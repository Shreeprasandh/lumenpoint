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

// Check API quota status
export const checkAPIQuota = async (): Promise<boolean> => {
  try {
    // Use a lightweight API call to check quota status
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('key', YOUTUBE_API_KEY);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', 'test'); // Minimal search to check quota
    url.searchParams.set('maxResults', '1');
    url.searchParams.set('type', 'video');

    const response = await fetch(url.toString());

    if (response.status === 403) {
      const errorText = await response.text();
      if (errorText.includes('quotaExceeded')) {
        return false; // Quota exceeded
      }
    }

    return response.ok; // API is available
  } catch (error) {
    console.error('Error checking API quota:', error);
    return false; // Assume quota exceeded on error
  }
};

export const fetchRecentVideos = async (maxResults: number = 50): Promise<YouTubeVideo[]> => {
  try {
    // Use the provided channel ID directly
    const actualChannelId = 'UCXGjxV_tSpTwBYcS7fm0E8A';
    console.log('Using channel ID for video fetch:', actualChannelId);

    const allVideos: YouTubeVideo[] = [];
    let nextPageToken: string | undefined;

    // Fetch all videos using pagination
    do {
      const url = new URL('https://www.googleapis.com/youtube/v3/search');
      url.searchParams.set('key', YOUTUBE_API_KEY);
      url.searchParams.set('channelId', actualChannelId);
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('order', 'date');
      url.searchParams.set('maxResults', '50'); // Max per page
      url.searchParams.set('type', 'video');
      if (nextPageToken) {
        url.searchParams.set('pageToken', nextPageToken);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`Failed to fetch videos: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        break; // No more videos
      }

      nextPageToken = data.nextPageToken;

      const videos = data.items.map((item: YouTubeSearchItem) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
        duration: '10:00', // Placeholder - would need another API call for actual duration
        videoId: item.id.videoId,
        publishedAt: item.snippet.publishedAt
      }));

      allVideos.push(...videos);
    } while (nextPageToken && allVideos.length < maxResults);

    console.log(`Fetched ${allVideos.length} videos from YouTube API`);

    // Return only up to maxResults
    return allVideos.slice(0, maxResults);
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);

    // Check if it's a quota exceeded error
    if (error instanceof Error && error.message.includes('quota')) {
      console.warn('YouTube API quota exceeded. Videos cannot be loaded until quota resets.');
      // Return a special marker to indicate quota exceeded
      return [{ id: 'quota_exceeded', title: 'API Quota Exceeded', thumbnail: '', duration: '', videoId: '', publishedAt: '' }];
    }

    // Return empty array instead of mock data - this ensures we don't show stale data
    return [];
  }
};

export const fetchAllVideos = async (): Promise<YouTubeVideo[]> => {
  return fetchRecentVideos(20); // Fetch more videos for "View All"
};





export const getAssetPath = async (type: 'infographic' | 'mindmap', videoId: string): Promise<string> => {
  try {
    // Fetch the mapping from public/assets_mapping.json
    const response = await fetch('/assets_mapping.json');
    if (!response.ok) {
      throw new Error('Failed to fetch assets mapping');
    }
    const mapping = await response.json();

    const assetType = type === 'infographic' ? 'infographic' : 'mindmap';
    if (mapping[videoId] && mapping[videoId][assetType]) {
      const fileId = mapping[videoId][assetType];
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    // Fallback to default
    return type === 'infographic' ? '/infographics/default-infographic.jpeg' : '/mindmaps/default-mindmap.png';
  } catch (error) {
    console.error('Error fetching asset path:', error);
    // Fallback to default
    return type === 'infographic' ? '/infographics/default-infographic.jpeg' : '/mindmaps/default-mindmap.png';
  }
};
