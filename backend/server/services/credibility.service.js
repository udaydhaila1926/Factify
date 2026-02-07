const domainTrust = require('../utils/domainTrust');

class CredibilityService {
  /**
   * Calculate source credibility score based on domains
   * @param {Array} sources - Array of source objects with domain info
   * @returns {number} - Credibility score (0-1)
   */
  calculateSourceCredibility(sources) {
    if (sources.length === 0) return 0.5;

    const credibilityScores = sources.map(source => {
      const domain = source.source || this.extractDomain(source.url);
      return domainTrust.getTrustScore(domain);
    });

    // Average credibility score
    const totalScore = credibilityScores.reduce((sum, score) => sum + score, 0);
    return totalScore / credibilityScores.length;
  }

  /**
   * Assess overall credibility level
   * @param {number} score - Credibility score (0-1)
   * @returns {string} - Credibility level (High/Medium/Low)
   */
  getCredibilityLevel(score) {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
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
   * Get detailed credibility breakdown
   * @param {Array} sources - Array of sources
   * @returns {Object} - Detailed credibility analysis
   */
  getDetailedAnalysis(sources) {
    const domainScores = sources.map(source => {
      const domain = source.source || this.extractDomain(source.url);
      const trustScore = domainTrust.getTrustScore(domain);
      const trustLevel = domainTrust.getTrustLevel(trustScore);

      return {
        domain,
        trustScore,
        trustLevel,
        source: source.title || 'Unknown'
      };
    });

    const averageScore = this.calculateSourceCredibility(sources);
    const overallLevel = this.getCredibilityLevel(averageScore);

    return {
      averageScore,
      overallLevel,
      domainBreakdown: domainScores
    };
  }
}

module.exports = new CredibilityService();