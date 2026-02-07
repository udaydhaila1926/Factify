const axios = require('axios');

class LLMVerifier {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    console.log('🔑 GROQ KEY LOADED:', this.apiKey ? 'YES' : 'NO');

    // Groq OpenAI-compatible endpoint
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  }

  async verifyClaim({ claim, evidenceTexts }) {
    if (!this.apiKey) {
      return {
        verdict: 'Unverified',
        confidence: 0.5,
        reasoning: 'LLM verification unavailable (Groq key missing).'
      };
    }

    const messages = [
      {
        role: 'system',
        content: `You are a strict fact-checking assistant.
Only use the provided evidence.
If evidence is insufficient, say "Unverified".
Do not hallucinate.`
      },
      {
        role: 'user',
        content: `
Claim:
"${claim}"

Evidence:
${evidenceTexts.length ? evidenceTexts.join('\n\n') : 'No evidence provided.'}

Return ONLY valid JSON in this format:
{
  "verdict": "Supported | Contradicted | Unverified",
  "confidence": number between 0 and 1,
  "reasoning": "short explanation"
}
`
      }
    ];

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          // ✅ Use a confirmed live Groq model
          model: 'llama-3.1-8b-instant',
          messages,
          temperature: 0,
          max_tokens: 200
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const raw = response.data.choices[0].message.content;
      console.log('🧠 GROQ RAW RESPONSE:', raw);

      // ✅ FIX: strip Markdown code fences before parsing
      const cleaned = raw
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error('❌ JSON parse failed after cleaning:', cleaned);
        return {
          verdict: 'Unverified',
          confidence: 0.5,
          reasoning: 'LLM response could not be parsed reliably.'
        };
      }

      return parsed;

    } catch (err) {
      console.error('❌ Groq verification error:', err.response?.data || err.message);
      return {
        verdict: 'Unverified',
        confidence: 0.5,
        reasoning: 'Verification failed due to LLM error.'
      };
    }
  }
}

module.exports = new LLMVerifier();
