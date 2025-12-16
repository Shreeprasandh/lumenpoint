interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  videoId: string;
  publishedAt: string;
}

interface YouTubeSearchItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      high?: { url: string };
      default: { url: string };
    };
    publishedAt: string;
  };
}

const YOUTUBE_API_KEY = 'AIzaSyDoA2JXkyhxmH09UsavtmIkwSF-Kwop-A4';

export const fetchRecentVideos = async (maxResults: number = 4): Promise<YouTubeVideo[]> => {
  try {
    // First get channel ID from handle
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@ourlumenpoint&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelResponse.json();
    const actualChannelId = channelData.items?.[0]?.id || 'UCourlumenpoint';

    // Fetch videos
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${actualChannelId}&part=snippet&order=date&maxResults=${maxResults}&type=video`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }

    const data = await response.json();

    return data.items.map((item: YouTubeSearchItem) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
      duration: '10:00', // Placeholder - would need another API call for actual duration
      videoId: item.id.videoId,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    // Return mock data if API fails
    return [
      {
        id: '1',
        title: 'F1 2026 Engine Rules EXPLAINED: The 50/50 Power Split That Changes EVERYTHING',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '12:34',
        videoId: 'dQw4w9WgXcQ',
        publishedAt: '2024-01-01'
      },
      {
        id: '2',
        title: 'AI LUXURY FACTORY: Build a $10,000/Mo YouTube Channel (100% Automated)',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '8:45',
        videoId: 'dQw4w9WgXcQ',
        publishedAt: '2024-01-01'
      },
      {
        id: '3',
        title: 'AUDI\'s F1 GAMBIT: How They Plan to Build a Championship Winning Team by 2030',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '15:22',
        videoId: 'dQw4w9WgXcQ',
        publishedAt: '2024-01-01'
      },
      {
        id: '4',
        title: 'OPPENHEIMER\'s PARADOX: Creator of the Atomic Age vs. Destroyer of Worlds - The True Story',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '18:45',
        videoId: 'dQw4w9WgXcQ',
        publishedAt: '2024-01-01'
      }
    ];
  }
};

export const fetchAllVideos = async (): Promise<YouTubeVideo[]> => {
  return fetchRecentVideos(20); // Fetch more videos for "View All"
};

// Available asset files
const thumbnailFiles = [
  'AI LUXURY FACTORY Build a $10,000Mo YouTube Channel (100% Automated).jpeg',
  'AUDI\'s F1 GAMBIT How They Plan to Build a Championship Winning Team by 2030.jpeg',
  'BITCOIN Explained Digital Gold or Digital Fraud The Financial Revolution in 5 Minutes.png',
  'F1 2026 Engine Rules EXPLAINED  The 5050 Power Split That Changes EVERYTHING.jpeg',
  'OPPENHEIMER\'s PARADOX Creator of the Atomic Age vs. Destroyer of Worlds  The True Story.jpeg',
  'THE ASCENT OF AI From Today\'s Peak to the \'Ultimate Form\' (10 Stages of Artificial Intelligence).png'
];

const mindmapFiles = [
  'AI LUXURY FACTORY Build a $10,000Mo YouTube Channel (100% Automated).png',
  'AUDI\'s F1 GAMBIT How They Plan to Build a Championship Winning Team by 2030.png',
  'BITCOIN Explained Digital Gold or Digital Fraud The Financial Revolution in 5 Minutes.png',
  'F1 2026 Engine Rules EXPLAINED  The 5050 Power Split That Changes EVERYTHING.png',
  'OPPENHEIMER\'s PARADOX Creator of the Atomic Age vs. Destroyer of Worlds  The True Story.png',
  'THE ASCENT OF AI From Today\'s Peak to the \'Ultimate Form\' (10 Stages of Artificial Intelligence).png'
];

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};

const findBestMatch = (title: string, files: string[]): string | null => {
  const normalizedTitle = normalizeText(title);

  // First try exact match after normalization
  for (const file of files) {
    const normalizedFile = normalizeText(file.replace(/\.(jpeg|png)$/i, ''));
    if (normalizedFile === normalizedTitle) {
      return file;
    }
  }

  // Then try partial matches
  for (const file of files) {
    const normalizedFile = normalizeText(file.replace(/\.(jpeg|png)$/i, ''));
    const titleWords = normalizedTitle.split(' ');
    const fileWords = normalizedFile.split(' ');

    // Check if most significant words match
    const commonWords = titleWords.filter(word => fileWords.includes(word));
    if (commonWords.length >= Math.min(titleWords.length, fileWords.length) * 0.7) {
      return file;
    }
  }

  return null;
};

export const getAssetPath = (type: 'thumbnail' | 'mindmap', videoTitle: string): string => {
  const files = type === 'thumbnail' ? thumbnailFiles : mindmapFiles;
  const matchedFile = findBestMatch(videoTitle, files);

  if (matchedFile) {
    const folder = type === 'thumbnail' ? 'thumbnails' : 'mindmaps';
    return encodeURI(`/${folder}/${matchedFile}`);
  }

  // Fallback to default
  return type === 'thumbnail' ? '/thumbnails/default-thumbnail.jpeg' : '/mindmaps/default-mindmap.png';
};
