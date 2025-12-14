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

export const getAssetPath = (type: 'thumbnail' | 'mindmap', videoTitle: string): string => {
  // Clean the title for filename - match the actual file naming pattern
  const cleanTitle = videoTitle.toLowerCase();

  let path: string;
  if (type === 'thumbnail') {
    // Thumbnails are JPEG files
    if (cleanTitle.includes('f1') && cleanTitle.includes('engine')) {
      path = '/thumbnails/F1 2026 Engine Rules EXPLAINED  The 5050 Power Split That Changes EVERYTHING.jpeg';
    } else if (cleanTitle.includes('ai') && cleanTitle.includes('luxury')) {
      path = '/thumbnails/AI LUXURY FACTORY Build a $10,000Mo YouTube Channel (100% Automated).jpeg';
    } else if (cleanTitle.includes('audi') && cleanTitle.includes('f1')) {
      path = '/thumbnails/AUDI\'s F1 GAMBIT How They Plan to Build a Championship Winning Team by 2030.jpeg';
    } else if (cleanTitle.includes('oppenheimer') && cleanTitle.includes('paradox')) {
      path = '/thumbnails/OPPENHEIMER\'s PARADOX Creator of the Atomic Age vs. Destroyer of Worlds  The True Story.jpeg';
    } else {
      path = '/thumbnails/default-thumbnail.jpeg';
    }
  } else {
    // Mindmaps are PNG files
    if (cleanTitle.includes('f1') && cleanTitle.includes('engine')) {
      path = '/mindmaps/F1 2026 Engine Rules EXPLAINED  The 5050 Power Split That Changes EVERYTHING.png';
    } else if (cleanTitle.includes('ai') && cleanTitle.includes('luxury')) {
      path = '/mindmaps/AI LUXURY FACTORY Build a $10,000Mo YouTube Channel (100% Automated).png';
    } else if (cleanTitle.includes('audi') && cleanTitle.includes('f1')) {
      path = '/mindmaps/AUDI\'s F1 GAMBIT How They Plan to Build a Championship Winning Team by 2030.png';
    } else if (cleanTitle.includes('oppenheimer') && cleanTitle.includes('paradox')) {
      path = '/mindmaps/OPPENHEIMER\'s PARADOX Creator of the Atomic Age vs. Destroyer of Worlds  The True Story.png';
    } else {
      path = '/mindmaps/default-mindmap.png';
    }
  }
  return encodeURI(path);
};
