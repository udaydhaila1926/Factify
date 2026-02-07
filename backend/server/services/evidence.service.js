const axios = require('axios');

class EvidenceService {
  constructor() {
    this.serpApiKey = process.env.SERPAPI_KEY;
    this.newsApiKey = process.env.NEWSAPI_KEY;
    this.serpApiUrl = 'https://serpapi.com/search.json';
    this.newsApiUrl = 'https://newsapi.org/v2/everything';
  }

  /**
   * Gather evidence from news sources related to a claim
   * @param {string} claim - The claim to search for
   * @returns {Array} - Array of evidence sources
   */
  async gatherEvidence(claim) {
    try {
      const sources = [];

      // Try SerpAPI first (more comprehensive)
      if (this.serpApiKey) {
        const serpResults = await this.searchSerpApi(claim);
        sources.push(...serpResults);
      }

      // Fallback to NewsAPI if SerpAPI not available or insufficient results
      if (sources.length < 3 && this.newsApiKey) {
        const newsResults = await this.searchNewsApi(claim);
        sources.push(...newsResults);
      }

      // Limit to 5 sources maximum
      return sources.slice(0, 5);

    } catch (error) {
      console.error('Evidence gathering error:', error);
      return [];
    }
  }

  /**
   * Search using SerpAPI
   * @param {string} query - Search query
   * @returns {Array} - Array of sources
   */
  async searchSerpApi(query) {
    try {
      const response = await axios.get(this.serpApiUrl, {
        params: {
          q: query,
          api_key: this.serpApiKey,
          engine: 'google',
          num: 10,
          safe: 'active'
        },
        timeout: 10000
      });

      const results = response.data.organic_results || [];
      return results.slice(0, 3).map(result => ({
        title: result.title,
        url: result.link,
        snippet: result.snippet,
        source: this.extractDomain(result.link)
      }));

    } catch (error) {
      console.error('SerpAPI search error:', error);
      return [];
    }
  }

  /**
   * Search using NewsAPI
   * @param {string} query - Search query
   * @returns {Array} - Array of sources
   */
  async searchNewsApi(query) {
    try {
      const response = await axios.get(this.newsApiUrl, {
        params: {
          q: query,
          apiKey: this.newsApiKey,
          language: 'en',
          sortBy: 'relevancy',
          pageSize: 5
        },
        timeout: 10000
      });

      const articles = response.data.articles || [];
      return articles.map(article => ({
        title: article.title,
        url: article.url,
        snippet: article.description,
        source: this.extractDomain(article.url)
      }));

    } catch (error) {
      console.error('NewsAPI search error:', error);
      return [];
    }
  }

  /**
   * Extract domain from URL
   * @param {string} url - Full URL
   * @returns {string} - Domain name
   */
  extractDomain(url) {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }

  /**
   * Calculate evidence agreement score based on sources
   * @param {Array} sources - Array of evidence sources
   * @param {string} claim - Original claim
   * @returns {number} - Agreement score (0-1)
   */
  calculateAgreement(sources, claim) {
    if (sources.length === 0) return 0.5;

    // Simple heuristic: more sources = higher agreement confidence
    // In production, you'd use NLP to analyze source content
    const baseScore = Math.min(sources.length / 5, 1.0);

    // Adjust based on source diversity
    const uniqueDomains = new Set(sources.map(s => s.source)).size;
    const diversityBonus = uniqueDomains / sources.length;

    return (baseScore * 0.7) + (diversityBonus * 0.3);
  }
}

module.exports = new EvidenceService();