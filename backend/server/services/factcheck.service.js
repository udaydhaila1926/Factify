const axios = require('axios');

class FactCheckService {
  constructor() {
    this.apiKey = process.env.GOOGLE_FACT_CHECK_API_KEY;
    this.baseUrl = 'https://factchecktools.googleapis.com/v1alpha1/claims:search';
  }

  /**
   * Search for fact checks related to a claim
   * @param {string} claim - The claim to search for
   * @returns {Object} - Fact check result with status and score
   */
  async checkClaim(claim) {
    try {
      if (!this.apiKey) {
        return {
          status: 'No Existing Check',
          score: 0.5, // Neutral score when API not available
          source: null
        };
      }

      const response = await axios.get(this.baseUrl, {
        params: {
          query: claim,
          key: this.apiKey,
          languageCode: 'en'
        },
        timeout: 10000
      });

      console.log("📦 Raw Google Fact Check response:", response.data);

      const claims = response.data.claims || [];

      if (claims.length === 0) {
        return {
          status: 'No Existing Check',
          score: 0.5,
          source: null
        };
      }

      // Get the most relevant fact check
      const factCheck = claims[0];
      const review = factCheck.claimReview?.[0];

      if (!review) {
        return {
          status: 'No Existing Check',
          score: 0.5,
          source: null
        };
      }
      console.log("✅ Found review:", review.textualRating);
      // Map Google Fact Check ratings to our system
      const { status, score } = this.mapRating(review.textualRating);

      return {
        verdict: status,
        source: {
          url: review.url,
          publisher: review.publisher?.name || 'Unknown',
          title: factCheck.text
        }
      };

    } catch (error) {
      console.error('Fact check API error:', error);
      return {
        status: 'No Existing Check',
        score: 0.5,
        source: null
      };
    }
  }

  /**
   * Map Google Fact Check ratings to our scoring system
   * @param {string} rating - Google Fact Check rating
   * @returns {Object} - Status and score
   */
  mapRating(rating) {
    if (!rating) {
      return { status: 'No Existing Check', score: 0.5 };
    }

    const lowerRating = rating.toLowerCase();

    // True/Verified ratings
    if (lowerRating.includes('true') ||
        lowerRating.includes('verified') ||
        lowerRating.includes('correct') ||
        lowerRating.includes('accurate')) {
      return { status: 'Verified', score: 1.0 };
    }

    // False/Contradicted ratings
    if (lowerRating.includes('false') ||
        lowerRating.includes('incorrect') ||
        lowerRating.includes('wrong') ||
        lowerRating.includes('misleading') ||
        lowerRating.includes('contradicted')) {
      return { status: 'Contradicted', score: 0.0 };
    }

    // Partially true/mixed
    if (lowerRating.includes('partly') ||
        lowerRating.includes('mixed') ||
        lowerRating.includes('partially')) {
      return { status: 'Verified', score: 0.7 };
    }

    // Unclear or other ratings
    return { status: 'No Existing Check', score: 0.5 };
  }
}

module.exports = new FactCheckService();
