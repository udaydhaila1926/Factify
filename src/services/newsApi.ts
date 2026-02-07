import { NewsArticle } from "../types";

export const fetchRelatedNews = async (query: string, apiKey: string): Promise<NewsArticle[]> => {
  if (!apiKey) return [];

  let searchQuery = query;

  // 1. Smart URL Handling
  // If the user pasted a URL, NewsAPI won't find it by exact match. We need to extract keywords.
  if (query.match(/^https?:\/\//i)) {
    try {
      const urlObj = new URL(query);
      
      // Strategy: Extract the pathname, replace slashes/dashes with spaces
      // e.g. /news/world-us-canada-123 -> "news world us canada 123"
      const cleanPath = urlObj.pathname
        .replace(/\.(html|php|aspx|jsp)$/i, '') // Remove extensions
        .replace(/\/index$/i, '') // Remove index
        .replace(/[-_/]/g, ' ') // Replace separators with spaces
        .trim();
      
      // Filter out short words (stop words) and pure numbers to get "meaty" keywords
      // We take the last few meaningful words as they usually contain the headline
      const keywords = cleanPath.split(' ')
        .filter(w => w.length > 3 && isNaN(Number(w))) // Remove short words and IDs
        .slice(-5) // Take the last 5 relevant words (often the title)
        .join(' ');

      if (keywords) {
        searchQuery = keywords;
        console.log(`[Factify] Converted URL "${query}" to search query: "${searchQuery}"`);
      } else {
        // Fallback: If we couldn't extract keywords, maybe just use the domain to find general news?
        // Or just fail gracefully.
        console.warn("[Factify] Could not extract keywords from URL, using original query.");
      }
    } catch (e) {
      console.warn("[Factify] URL parsing failed, using original query.");
    }
  }

  try {
    // We search for the query in the 'everything' endpoint sorted by relevancy
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&language=en&sortBy=relevancy&pageSize=5&apiKey=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        // NewsAPI free tier often blocks browser requests (CORS) except from localhost.
        if (response.status === 426 || response.status === 403) {
            console.warn("NewsAPI Error: Browser request blocked or plan limit reached. This is common on the free tier.");
        }
        return [];
    }

    const data = await response.json();
    
    if (data.status !== 'ok' || !data.articles) {
      return [];
    }

    return data.articles.map((article: any) => ({
      source: article.source,
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt
    }));

  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};
