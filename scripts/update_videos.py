import os
import json
import logging
import requests

# Constants
YOUTUBE_API_KEY = 'AIzaSyDoA2JXkyhxmH09UsavtmIkwSF-Kwop-A4'
MAPPING_FILE = 'public/assets_mapping.json'

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_channel_id():
    # Get channel ID from handle like in youtube.ts
    channel_url = f'https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@ourlumenpoint&key={YOUTUBE_API_KEY}'
    response = requests.get(channel_url)
    if response.status_code == 200:
        data = response.json()
        if data['items']:
            return data['items'][0]['id']
    return 'UCourlumenpoint'  # fallback

def fetch_all_videos(channel_id):
    videos = []
    next_page_token = None

    while True:
        url = f'https://www.googleapis.com/youtube/v3/search?key={YOUTUBE_API_KEY}&channelId={channel_id}&part=snippet&order=date&maxResults=50&type=video'
        if next_page_token:
            url += f'&pageToken={next_page_token}'

        response = requests.get(url)
        if response.status_code != 200:
            logger.error(f"YouTube API error: {response.status_code} - {response.text}")
            break

        data = response.json()
        for item in data['items']:
            videos.append({
                'videoId': item['id']['videoId'],
                'title': item['snippet']['title'],
                'publishedAt': item['snippet']['publishedAt']
            })

        next_page_token = data.get('nextPageToken')
        if not next_page_token:
            break

    return videos

def load_mapping():
    if os.path.exists(MAPPING_FILE):
        with open(MAPPING_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_mapping(mapping):
    with open(MAPPING_FILE, 'w') as f:
        json.dump(mapping, f, indent=2)

def main():
    logger.info('Starting video update process...')

    # Load existing mapping
    mapping = load_mapping()
    logger.info(f'Loaded existing mapping with {len(mapping)} videos')

    # Get channel ID
    channel_id = get_channel_id()
    logger.info(f'Using channel ID: {channel_id}')

    # Fetch all videos from YouTube
    videos = fetch_all_videos(channel_id)
    logger.info(f'Fetched {len(videos)} videos from YouTube')

    # Update mapping with new videos
    new_videos_count = 0
    for video in videos:
        video_id = video['videoId']
        if video_id not in mapping:
            mapping[video_id] = {}
            new_videos_count += 1
            logger.info(f'Added new video: {video["title"]} (ID: {video_id})')

    # Save updated mapping
    save_mapping(mapping)
    logger.info(f'Updated mapping saved. Added {new_videos_count} new videos.')
    logger.info(f'Total videos in mapping: {len(mapping)}')

if __name__ == '__main__':
    main()
