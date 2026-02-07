import { AnalysisResult } from "../types";

const SYSTEM_PROMPT = `
You are Factify, an elite digital misinformation detection AI. 
Your goal is to analyze claims and return a structured JSON response.

Analyze the user's claim for:
1. Factual accuracy based on your knowledge base AND the provided news context.
2. Logical consistency.
3. Emotional manipulation or bias.

IMPORTANT: I will provide "News Context" from real-time API searches. 
Use this context to verify the claim, especially for recent events. 
If the news context contradicts the claim, mark it as False.
If the news context supports it, mark it as True.

Return ONLY a raw JSON object (no markdown formatting, no code blocks) with this structure:
{
  "verdict": "True" | "False" | "Mixed" | "Unverified",
  "score": number (0-100, where 100 is perfectly credible),
  "confidence": number (0-100),
  "summary": "A concise 2-3 sentence explanation. Explicitly mention if you used the provided news context.",
  "sources": [
    { "id": "1", "name": "Source Name", "url": "URL from context if available", "credibility": "High" | "Medium" | "Low" }
  ]
}
`;

export const analyzeWithGemini = async (text: string, apiKey: string, contextArticles: string = ""): Promise<AnalysisResult> => {
  try {
    const prompt = `
    ${SYSTEM_PROMPT}

    --- NEWS CONTEXT START ---
    ${contextArticles || "No real-time news context available."}
    --- NEWS CONTEXT END ---

    Verify this claim: "${text}"
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    // Graceful handling for Rate Limits (HTTP 429)
    if (response.status === 429) {
      console.warn("Gemini API Quota Exceeded. Returning fallback result.");
      return {
        id: crypto.randomUUID(),
        verdict: "Unverified",
        score: 0,
        confidence: 0,
        summary: "Gemini API quota exceeded (Free Tier limit). Please try again in a minute. This is a placeholder result to prevent application crash.",
        sources: [],
        analyzed_at: new Date().toISOString(),
      };
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Gemini API request failed");
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) throw new Error("Empty response from Gemini");

    const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanContent);

    return {
      id: crypto.randomUUID(),
      verdict: result.verdict,
      score: result.score,
      confidence: result.confidence,
      summary: result.summary,
      sources: result.sources || [],
      analyzed_at: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(error.message || "Failed to analyze with Gemini AI");
  }
};
