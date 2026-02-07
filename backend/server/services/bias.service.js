const axios = require('axios');

class BiasService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  /**
   * Detect bias level in the content
   * @param {string} content - The content to analyze
   * @returns {string} - Bias level (Low/Medium/High)
   */
  async detectBias(content) {
    try {
      if (!this.openaiApiKey) {
        return 'Low'; // Default to low bias if no API
      }

      const prompt = `
Analyze the following text for political, ideological, or partisan bias. Rate the bias level as Low, Medium, or High.

Text: "${content.substring(0, 1000)}"

Bias Rating Criteria:
- Low: Neutral, factual, balanced presentation
- Medium: Some opinion language, mild slant, but mostly factual
- High: Strong partisan language, propaganda-like, heavily opinionated

Consider:
- Use of loaded/emotional language
- One-sided presentation
- Presence of partisan keywords
- Balance of viewpoints

Rate as: Low, Medium, or High
Explain briefly why:

Rating:`;

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const result = response.data.choices[0].message.content.trim();
      const biasLevel = this.extractBiasLevel(result);

      return biasLevel;

    } catch (error) {
      console.error('Bias detection error:', error);
      return 'Low'; // Default to low bias on error
    }
  }

  /**
   * Extract bias level from AI response
   * @param {string} response - AI response text
   * @returns {string} - Bias level
   */
  extractBiasLevel(response) {
    const lowerResponse = response.toLowerCase();

    if (lowerResponse.includes('high')) {
      return 'High';
    } else if (lowerResponse.includes('medium')) {
      return 'Medium';
    } else {
      return 'Low';
    }
  }

  /**
   * Convert bias level to penalty score for truth calculation
   * @param {string} biasLevel - Bias level (Low/Medium/High)
   * @returns {number} - Penalty score (0.1, 0.3, or 0.6)
   */
  getBiasPenalty(biasLevel) {
    switch (biasLevel.toLowerCase()) {
      case 'low': return 0.1;
      case 'medium': return 0.3;
      case 'high': return 0.6;
      default: return 0.1;
    }
  }
}

module.exports = new BiasService();