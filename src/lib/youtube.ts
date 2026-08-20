import { parseISO8601Duration } from './utils';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const CACHE_DURATION_HOURS = 6;

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  thumbnailUrl: string;
  publishedAt: string;
  durationSeconds: number;
  duration: string; // ISO 8601
  viewCount: number;
  embedUrl: string;
  watchUrl: string;
  source: 'youtube';
}

export interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  nextPageToken?: string;
  totalResults: number;
  cached: boolean;
  error?: string;
}

function buildYouTubeSearchQuery(query: string): string {
  // Enhance query to target ad content
  const adKeywords = ['advertisement', 'commercial', 'ad', 'TV spot'];
  const hasAdKeyword = adKeywords.some(kw => query.toLowerCase().includes(kw));
  
  if (!hasAdKeyword) {
    return `${query} commercial advertisement`;
  }
  return query;
}

export async function searchYouTube(
  query: string,
  options: {
    maxResults?: number;
    pageToken?: string;
    order?: 'relevance' | 'date' | 'viewCount' | 'rating';
    publishedAfter?: string;
    publishedBefore?: string;
  } = {}
): Promise<YouTubeSearchResult> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured');
    return {
      videos: getMockYouTubeResults(query),
      totalResults: 5,
      cached: false,
      error: 'YouTube API key not configured. Showing demo results.',
    };
  }

  const {
    maxResults = 12,
    pageToken,
    order = 'relevance',
    publishedAfter,
    publishedBefore,
  } = options;

  try {
    const enhancedQuery = buildYouTubeSearchQuery(query);
    
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: enhancedQuery,
      type: 'video',
      maxResults: maxResults.toString(),
      order,
      key: YOUTUBE_API_KEY,
      videoEmbeddable: 'true',
      videoCategoryId: '1', // Film & Animation often contains ads
    });

    if (pageToken) searchParams.set('pageToken', pageToken);
    if (publishedAfter) searchParams.set('publishedAfter', publishedAfter);
    if (publishedBefore) searchParams.set('publishedBefore', publishedBefore);

    const searchUrl = `${YOUTUBE_API_BASE}/search?${searchParams}`;
    const searchRes = await fetch(searchUrl, { next: { revalidate: CACHE_DURATION_HOURS * 3600 } });
    
    if (!searchRes.ok) {
      const error = await searchRes.json();
      throw new Error(error.error?.message || 'YouTube API search failed');
    }

    const searchData = await searchRes.json();
    const videoIds = searchData.items
      ?.map((item: any) => item.id?.videoId)
      .filter(Boolean)
      .join(',');

    if (!videoIds) {
      return { videos: [], totalResults: 0, cached: false };
    }

    // Get video details including duration
    const detailParams = new URLSearchParams({
      part: 'snippet,contentDetails,statistics',
      id: videoIds,
      key: YOUTUBE_API_KEY,
    });

    const detailRes = await fetch(`${YOUTUBE_API_BASE}/videos?${detailParams}`, {
      next: { revalidate: CACHE_DURATION_HOURS * 3600 },
    });

    if (!detailRes.ok) {
      throw new Error('YouTube API details fetch failed');
    }

    const detailData = await detailRes.json();

    const videos: YouTubeVideo[] = detailData.items?.map((item: any) => {
      const duration = item.contentDetails?.duration || 'PT0S';
      const durationSeconds = parseISO8601Duration(duration);
      const videoId = item.id;

      return {
        id: videoId,
        title: item.snippet?.title || '',
        description: item.snippet?.description?.slice(0, 500) || '',
        channelTitle: item.snippet?.channelTitle || '',
        channelId: item.snippet?.channelId || '',
        thumbnailUrl:
          item.snippet?.thumbnails?.maxres?.url ||
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        publishedAt: item.snippet?.publishedAt || '',
        durationSeconds,
        duration,
        viewCount: parseInt(item.statistics?.viewCount || '0'),
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
        source: 'youtube' as const,
      };
    }) || [];

    return {
      videos,
      nextPageToken: searchData.nextPageToken,
      totalResults: searchData.pageInfo?.totalResults || videos.length,
      cached: false,
    };
  } catch (error) {
    console.error('YouTube search error:', error);
    return {
      videos: getMockYouTubeResults(query),
      totalResults: 5,
      cached: false,
      error: error instanceof Error ? error.message : 'YouTube search failed',
    };
  }
}

// Mock results for development/when API key is missing
function getMockYouTubeResults(query: string): YouTubeVideo[] {
  const mockIds = ['dQw4w9WgXcQ', 'owGykVbfgUE', 'XjJQBjWYDTs', 'apGMBNPBqT0', 'VtvjbmoDx-I'];
  
  return mockIds.map((id, i) => ({
    id,
    title: `${query} - Commercial Ad ${i + 1}`,
    description: `This is a sample advertisement for "${query}". In a real implementation, actual YouTube results would appear here.`,
    channelTitle: `Brand Channel ${i + 1}`,
    channelId: `UCexample${i}`,
    thumbnailUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 3600 * 1000).toISOString(),
    durationSeconds: Math.floor(Math.random() * 60) + 15,
    duration: 'PT30S',
    viewCount: Math.floor(Math.random() * 1000000) + 10000,
    embedUrl: `https://www.youtube.com/embed/${id}`,
    watchUrl: `https://www.youtube.com/watch?v=${id}`,
    source: 'youtube' as const,
  }));
}

export async function getYouTubeVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  if (!YOUTUBE_API_KEY) return null;

  try {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails,statistics',
      id: videoId,
      key: YOUTUBE_API_KEY,
    });

    const res = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error('Failed to fetch video details');

    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return null;

    const duration = item.contentDetails?.duration || 'PT0S';
    const durationSeconds = parseISO8601Duration(duration);

    return {
      id: videoId,
      title: item.snippet?.title || '',
      description: item.snippet?.description?.slice(0, 500) || '',
      channelTitle: item.snippet?.channelTitle || '',
      channelId: item.snippet?.channelId || '',
      thumbnailUrl:
        item.snippet?.thumbnails?.maxres?.url ||
        item.snippet?.thumbnails?.high?.url ||
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      publishedAt: item.snippet?.publishedAt || '',
      durationSeconds,
      duration,
      viewCount: parseInt(item.statistics?.viewCount || '0'),
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      source: 'youtube',
    };
  } catch (error) {
    console.error('Error fetching YouTube video details:', error);
    return null;
  }
}
