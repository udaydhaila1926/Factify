/**
 * Domain trust scoring system
 * Higher scores indicate more trustworthy sources
 */
class DomainTrust {
  constructor() {
    // Trust scores from 0.0 (least trustworthy) to 1.0 (most trustworthy)
    this.trustMap = {
      // Major reputable news sources
      'bbc.com': 0.95,
      'bbc.co.uk': 0.95,
      'reuters.com': 0.95,
      'apnews.com': 0.95,
      'npr.org': 0.90,
      'nytimes.com': 0.90,
      'washingtonpost.com': 0.90,
      'theguardian.com': 0.85,
      'wsj.com': 0.85,
      'ft.com': 0.85,
      'cnn.com': 0.80,
      'foxnews.com': 0.75,
      'abcnews.go.com': 0.80,
      'cbsnews.com': 0.80,
      'nbcnews.com': 0.80,

      // Government and official sources
      'gov.uk': 0.95,
      'whitehouse.gov': 0.90,
      'who.int': 0.90,
      'cdc.gov': 0.90,
      'nih.gov': 0.90,
      'europa.eu': 0.85,

      // Academic and research institutions
      'harvard.edu': 0.90,
      'stanford.edu': 0.90,
      'mit.edu': 0.90,
      'ox.ac.uk': 0.90,
      'cam.ac.uk': 0.90,
      'edu': 0.70, // General .edu domains

      // Fact-checking organizations
      'factcheck.org': 0.95,
      'snopes.com': 0.90,
      'politifact.com': 0.90,
      'fullfact.org': 0.85,

      // Questionable or biased sources
      'breitbart.com': 0.40,
      'dailymail.co.uk': 0.50,
      'huffpost.com': 0.60,
      'buzzfeed.com': 0.50,

      // Social media and user-generated content
      'twitter.com': 0.20,
      'facebook.com': 0.20,
      'reddit.com': 0.30,
      'tiktok.com': 0.10,

      // Search engines and aggregators
      'google.com': 0.60,
      'bing.com': 0.60,

      // Default scores for unknown domains
      'default': 0.50
    };
  }

  /**
   * Get trust score for a domain
   * @param {string} domain - Domain name
   * @returns {number} - Trust score (0-1)
   */
  getTrustScore(domain) {
    if (!domain) return 0.5;

    const cleanDomain = domain.toLowerCase().trim();

    // Direct match
    if (this.trustMap[cleanDomain]) {
      return this.trustMap[cleanDomain];
    }

    // Check for partial matches (e.g., subdomains)
    for (const [key, score] of Object.entries(this.trustMap)) {
      if (cleanDomain.includes(key) || key.includes(cleanDomain)) {
        return score;
      }
    }

    // Check TLD patterns
    if (cleanDomain.endsWith('.edu')) return 0.70;
    if (cleanDomain.endsWith('.gov')) return 0.85;
    if (cleanDomain.endsWith('.org')) return 0.65;
    if (cleanDomain.endsWith('.com')) return 0.50;

    return this.trustMap.default;
  }

  /**
   * Get trust level description
   * @param {number} score - Trust score
   * @returns {string} - Trust level
   */
  getTrustLevel(score) {
    if (score >= 0.85) return 'Very High';
    if (score >= 0.70) return 'High';
    if (score >= 0.55) return 'Medium';
    if (score >= 0.40) return 'Low';
    return 'Very Low';
  }

  /**
   * Check if domain is considered reputable
   * @param {string} domain - Domain name
   * @returns {boolean} - True if reputable
   */
  isReputable(domain) {
    return this.getTrustScore(domain) >= 0.70;
  }

  /**
   * Get credibility rating
   * @param {string} domain - Domain name
   * @returns {string} - Credibility rating
   */
  getCredibilityRating(domain) {
    const score = this.getTrustScore(domain);
    if (score >= 0.85) return 'Excellent';
    if (score >= 0.70) return 'Good';
    if (score >= 0.55) return 'Fair';
    if (score >= 0.40) return 'Poor';
    return 'Very Poor';
  }
}

module.exports = new DomainTrust();