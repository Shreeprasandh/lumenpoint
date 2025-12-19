import os
import json
import logging
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import requests
from fuzzywuzzy import fuzz

# Constants
YOUTUBE_API_KEY = 'AIzaSyDoA2JXkyhxmH09UsavtmIkwSF-Kwop-A4'
FOLDER_ID = '1RYLkrK45_THxFybdcU0rGrL0qWVBqKhY'  # Replace with actual FOLDER_ID
INPUT_ROOT = 'public'
MAPPING_FILE = 'public/assets_mapping.json'
SCOPES = ['https://www.googleapis.com/auth/drive.file']
TOKEN_FILE = 'token.json'
CLIENT_SECRET_FILE = 'client_secret.json'

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def authenticate_drive():
    creds = None
    # Load saved credentials if they exist
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    # If there are no valid credentials, authenticate
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CLIENT_SECRET_FILE):
                logger.error("Error: client_secret.json not found in root directory!")
                raise FileNotFoundError("client_secret.json not found in root directory!")
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
            creds = flow.run_local_server(port=0)

        # Save the credentials for the next run
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())

    return build('drive', 'v3', credentials=creds)

def normalize(text):
    # Remove HTML entities, normalize punctuation, and clean up
    import re
    text = text.lower().strip()
    text = re.sub(r'&#39;', "'", text)  # Fix HTML apostrophe
    text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation
    text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
    return text.strip()

def get_channel_id():
    # Get channel ID from handle like in youtube.ts
    channel_url = f'https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@ourlumenpoint&key={YOUTUBE_API_KEY}'
    response = requests.get(channel_url)
    if response.status_code == 200:
        data = response.json()
        if data['items']:
            return data['items'][0]['id']
    return 'UCourlumenpoint'  # fallback

def search_youtube_video_id(title, channel_id=None):
    if channel_id is None:
        channel_id = get_channel_id()

    # First try exact match
    url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&q={title}&channelId={channel_id}&type=video&key={YOUTUBE_API_KEY}&maxResults=10'
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        normalized_title = normalize(title)

        logger.info(f"Searching for title: '{title}' (normalized: '{normalized_title}')")
        logger.info(f"Found {len(data['items'])} videos in search results")

        # Log the first few video titles found
        for i, item in enumerate(data['items'][:3]):
            logger.info(f"  Result {i+1}: '{item['snippet']['title']}' (ID: {item['id']['videoId']})")

        # Try exact normalized match first
        for item in data['items']:
            yt_title = item['snippet']['title']
            if normalize(yt_title) == normalized_title:
                logger.info(f"Exact match found: '{yt_title}'")
                return item['id']['videoId']

        # If no exact match, try substring match (first 20 chars)
        title_prefix = normalized_title[:20]
        for item in data['items']:
            yt_title = item['snippet']['title']
            if normalize(yt_title)[:20] == title_prefix:
                logger.info(f"Substring match found: '{yt_title}' (prefix: '{normalize(yt_title)[:20]}')")
                return item['id']['videoId']

        # If no substring match, try fuzzy matching with 85% threshold
        for item in data['items']:
            yt_title = item['snippet']['title']
            similarity = fuzz.token_sort_ratio(normalized_title, normalize(yt_title))
            if similarity >= 85:
                logger.info(f"Fuzzy match found: '{yt_title}' (similarity: {similarity}%)")
                return item['id']['videoId']

        logger.warning(f"No match found for title: '{title}' (tried exact, substring, and fuzzy matching)")
    else:
        logger.error(f"YouTube API error: {response.status_code} - {response.text}")

    return None

def upload_to_drive(service, file_path, file_name):
    file_metadata = {
        'name': file_name,
        'parents': [FOLDER_ID]
    }
    media = MediaFileUpload(file_path, mimetype='image/png')

    # Upload the file using OAuth credentials (user's storage quota)
    file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id'
    ).execute()
    file_id = file.get('id')

    # Make the file publicly accessible
    permission = {
        'type': 'anyone',
        'role': 'reader'
    }
    service.permissions().create(
        fileId=file_id,
        body=permission
    ).execute()

    return file_id

def load_mapping():
    if os.path.exists(MAPPING_FILE):
        with open(MAPPING_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_mapping(mapping):
    with open(MAPPING_FILE, 'w') as f:
        json.dump(mapping, f, indent=2)

def upload_mapping_to_drive(service, mapping):
    """Upload the assets_mapping.json to Google Drive and return public URL"""
    mapping_content = json.dumps(mapping, indent=2)

    # Create/update the mapping file on Drive
    file_metadata = {
        'name': 'assets_mapping.json',
        'parents': [FOLDER_ID]
    }

    # Check if file already exists
    query = f"name='assets_mapping.json' and '{FOLDER_ID}' in parents and trashed=false"
    existing_files = service.files().list(q=query, fields='files(id)').execute().get('files', [])

    if existing_files:
        # Update existing file
        file_id = existing_files[0]['id']
        media = MediaFileUpload(io.StringIO(mapping_content), mimetype='application/json')
        service.files().update(fileId=file_id, media_body=media).execute()
    else:
        # Create new file
        media = MediaFileUpload(io.StringIO(mapping_content), mimetype='application/json')
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()
        file_id = file.get('id')

    # Make the file publicly accessible
    permission = {
        'type': 'anyone',
        'role': 'reader'
    }
    service.permissions().create(
        fileId=file_id,
        body=permission
    ).execute()

    # Return the public URL
    return f"https://drive.google.com/uc?export=download&id={file_id}"

def process_folder(service, folder_path, asset_type):
    mapping = load_mapping()
    for file_name in os.listdir(folder_path):
        if file_name.lower().endswith(('.png', '.jpg', '.jpeg')):
            title = os.path.splitext(file_name)[0]
            video_id = search_youtube_video_id(title)
            if video_id:
                new_name = f'{video_id}_{asset_type}.png'
                file_path = os.path.join(folder_path, file_name)
                file_id = upload_to_drive(service, file_path, new_name)
                if video_id not in mapping:
                    mapping[video_id] = {}
                mapping[video_id][asset_type] = file_id
                os.remove(file_path)
                logger.info(f'Uploaded {file_name} as {new_name}, file ID: {file_id}')
            else:
                logger.error(f'Video not found for title: {title}')
    save_mapping(mapping)

def main():
    service = authenticate_drive()
    process_folder(service, os.path.join(INPUT_ROOT, 'infographics'), 'infographic')
    process_folder(service, os.path.join(INPUT_ROOT, 'mindmaps'), 'mindmap')
    logger.info('Sync completed.')

if __name__ == '__main__':
    main()
