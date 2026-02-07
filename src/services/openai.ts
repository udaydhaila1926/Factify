import { AnalysisResult } from "../types";

const SYSTEM_PROMPT = `
You are Factify, an elite digital misinformation detection AI. 
Your goal is to analyze claims and return a structured JSON response.

Analyze the user's claim for:
1. Factual accuracy based on your knowledge base AND the provided news context.
2. Logical consistency.
3. Emotional manipulation or bias.

IMPORTANT: I will provide "News Context" from real-time API searches. 
Use this context to verify the claim.

Return ONLY a raw JSON object (no markdown formatting) with this structure:
{
  "verdict": "True" | "False" | "Mixed" | "Unverified",
  "score": number (0-100, where 100 is perfectly credible),
  "confidence": number (0-100),
  "summary": "A concise 2-3 sentence explanation. Mention if news context was used.",
  "sources": [
    { "id": "1", "name": "Source Name", "url": "URL", "credibility": "High" | "Medium" | "Low" }
  ]
}
`;

export const analyzeWithOpenAI = async (text: string, apiKey: string, contextArticles: string = ""): Promise<AnalysisResult> => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { 
            role: "user", 
            content: `
            --- NEWS CONTEXT ---
            ${contextArticles || "No context available."}
            --------------------
            Verify this claim: "${text}"` 
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "OpenAI API request failed");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
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
    console.error("OpenAI Analysis Error:", error);
    throw new Error(error.message || "Failed to analyze with AI");
  }
};
