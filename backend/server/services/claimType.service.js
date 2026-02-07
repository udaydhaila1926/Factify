const axios = require('axios');

class ClaimTypeService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    this.apiUrl = process.env.GROQ_API_KEY
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

    this.model = process.env.GROQ_API_KEY
      ? 'llama-3.1-8b-instant'
      : 'gpt-4.1-mini';
  }

  /**
   * Public method used by controller
   */
  async detectType(claim) {
    // 1️⃣ Try semantic (LLM-based) classification
    const llmType = await this.detectWithLLM(claim);
    if (llmType) return llmType;

    // 2️⃣ Fallback: structural heuristics (NOT keywords)
    return this.detectStructurally(claim);
  }

  /**
   * LLM-based semantic classification
   * Safe: classification only, no truth reasoning
   */
  async detectWithLLM(claim) {
    if (!this.apiKey) return null;

    const prompt = `
You are classifying the TYPE of a claim, not verifying it.

Claim:
"${claim}"

Choose ONE category:

FOUNDATIONAL:
- Timeless, widely accepted facts
- Stable over time

GENERAL:
- Verifiable factual claims about events, science, policy, or records

COMPLEX:
- Allegations, political, corporate, military, or causal claims
- Require investigation or multiple sources

OPINION:
- Subjective, normative, or belief-based statements

Respond with ONLY ONE WORD:
FOUNDATIONAL | GENERAL | COMPLEX | OPINION
`;

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0,
          max_tokens: 5
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const raw =
        response.data.choices?.[0]?.message?.content?.trim().toUpperCase();

      if (
        ['FOUNDATIONAL', 'GENERAL', 'COMPLEX', 'OPINION'].includes(raw)
      ) {
        console.log('🧠 Claim type (LLM):', raw);
        return raw;
      }

      return null;
    } catch (err) {
      console.warn('⚠️ Claim type LLM failed, using fallback');
      return null;
    }
  }

  /**
   * Structural fallback (logic-based, not keyword-based)
   */
  detectStructurally(claim) {
    const lower = claim.toLowerCase();

    // Opinion indicators (grammar-based)
    if (
      lower.includes('i think') ||
      lower.includes('i believe') ||
      lower.includes('should') ||
      lower.includes('is better than')
    ) {
      return 'OPINION';
    }

    // Time-bound or numeric claims → complex
    if (
      /\b\d{4}\b/.test(claim) || // years
      /\b(rs|₹|\$|percent|%|million|billion)\b/i.test(claim)
    ) {
      return 'COMPLEX';
    }

    // Causal or investigative structure
    if (
      lower.includes('caused') ||
      lower.includes('led to') ||
      lower.includes('resulted in') ||
      lower.includes('responsible for')
    ) {
      return 'COMPLEX';
    }

    // Simple copular factual form → foundational
    if (
      lower.match(/^(.*)\s(is|are|was|were)\s(.*)$/)
    ) {
      return 'FOUNDATIONAL';
    }

    // Default safe choice
    return 'GENERAL';
  }
}

module.exports = new ClaimTypeService();
