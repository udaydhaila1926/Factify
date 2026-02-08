import axios from 'axios';
import { NewsArticle } from '../types';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

export const fetchTrendingNews = async (): Promise<NewsArticle[]> => {
  if (!NEWS_API_KEY || NEWS_API_KEY === "YOUR_API_KEY") {
    console.warn("Missing News API Key");
    // Return mock data if no key is provided to prevent UI breakage during demo
    return mockNews;
  }

  try {
    const response = await axios.get(`${BASE_URL}/top-headlines`, {
      params: {
        country: 'us',
        category: 'general',
        apiKey: NEWS_API_KEY,
        pageSize: 12
      }
    });

    if (response.data.status === 'ok') {
      return response.data.articles;
    }
    return [];
  } catch (error: any) {
    // NewsAPI Free Tier blocks cloud environments (Status 426). 
    // Fallback to mock data to prevent crash.
    if (error.response?.status === 426 || error.code === "ERR_NETWORK") {
      console.warn("NewsAPI CORS restriction detected. Using mock data.");
      return mockNews;
    }

    console.error('Error fetching news:', error);
    throw error;
  }
};

const mockNews: NewsArticle[] = [
  {
    source: { id: 'cnn', name: 'CNN' },
    author: 'Mock Author',
    title: 'New AI Regulation Bill Proposed in Senate - Mock News',
    description: 'Senators have introduced a comprehensive bill aimed at regulating artificial intelligence development and deployment across various sectors.',
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    publishedAt: new Date().toISOString(),
    content: 'Mock content for demonstration purposes.'
  },
  {
    source: { id: 'techcrunch', name: 'TechCrunch' },
    author: 'Mock Author',
    title: 'Breakthrough in Quantum Computing Announced - Mock News',
    description: 'Researchers claim to have achieved a significant milestone in error correction for quantum processors.',
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
    publishedAt: new Date().toISOString(),
    content: 'Mock content for demonstration purposes.'
  },
  {
    source: { id: 'bbc', name: 'BBC News' },
    author: 'Mock Author',
    title: 'Global Climate Summit Reaches Historic Agreement - Mock News',
    description: 'World leaders have signed a new pact to accelerate the transition to renewable energy sources by 2030.',
    url: '#',
    urlToImage: 'https://images.unsplash.com/photo-1569163139599-0f4517e36b51?auto=format&fit=crop&q=80&w=800',
    publishedAt: new Date().toISOString(),
    content: 'Mock content for demonstration purposes.'
  }
];
