import axios from 'axios';
import { ClaimResult, Source, Verdict } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const SERPER_API_KEY = import.meta.env.VITE_SERPER_API_KEY;
const GOOGLE_FACT_CHECK_KEY = import.meta.env.VITE_GOOGLE_FACT_CHECK_KEY;

// --- 1. Google Fact Check API ---
async function checkExistingFactChecks(query: string): Promise<ClaimResult | null> {
  if (!GOOGLE_FACT_CHECK_KEY || GOOGLE_FACT_CHECK_KEY === "YOUR_API_KEY") return null;
  
  try {
    const response = await axios.get('https://factchecktools.googleapis.com/v1alpha1/claims:search', {
      params: {
        query: query,
        key: GOOGLE_FACT_CHECK_KEY,
        languageCode: 'en',
      }
    });

    const claims = response.data.claims;
    if (claims && claims.length > 0) {
      const bestMatch = claims[0];
      const review = bestMatch.claimReview[0];
      
      // Map Google's rating to our Verdict
      let verdict: Verdict = 'Unverified';
      const rating = review.textualRating.toLowerCase();
      if (rating.includes('true') && !rating.includes('not')) verdict = 'True';
      else if (rating.includes('false') || rating.includes('fake')) verdict = 'False';
      else if (rating.includes('mixed') || rating.includes('misleading')) verdict = 'Mixed';

      return {
        id: 'fc-' + Math.random().toString(36).substr(2, 9),
        input_text: query,
        verdict,
        credibility_score: verdict === 'True' ? 95 : verdict === 'False' ? 10 : 50,
        confidence_level: 100,
        explanation: `Fact checked by ${review.publisher.name}: ${review.title || review.textualRating}`,
        sources: [{
          id: 'fc-source',
          name: review.publisher.name,
          url: review.url,
          credibility: 'High',
          snippet: bestMatch.text
        }],
        created_at: new Date().toISOString()
      };
    }
  } catch (error) {
    console.warn('Google Fact Check API failed or no results:', error);
  }
  return null;
}

// --- 2. Serper.dev Search ---
async function searchWeb(query: string): Promise<Source[]> {
  if (!SERPER_API_KEY || SERPER_API_KEY === "YOUR_API_KEY") {
    console.warn("Missing Serper API Key");
    return [];
  }

  try {
    const response = await axios.post('https://google.serper.dev/search', 
      { q: query, num: 5 },
      { headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' } }
    );

    return response.data.organic.map((result: any, index: number) => ({
      id: `serper-${index}`,
      name: result.title,
      url: result.link,
      credibility: 'Medium', // Default, AI will adjust
      snippet: result.snippet,
      publishedDate: result.date
    }));
  } catch (error) {
    console.error('Serper search failed:', error);
    return [];
  }
}

// --- 3. Gemini AI Analysis ---
async function analyzeWithGemini(claim: string, sources: Source[]): Promise<ClaimResult> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY") {
    throw new Error("Missing Gemini API Key");
  }

  const sourcesText = sources.map(s => `- ${s.name} (${s.url}): ${s.snippet}`).join('\n');
  
  const prompt = `
    You are an expert fact-checker. Analyze the following claim based ONLY on the provided search results.
    
    Claim: "${claim}"
    
    Search Results:
    ${sourcesText}
    
    Instructions:
    1. Determine if the claim is True, False, Mixed, or Unverified.
    2. Assign a credibility score (0-100).
    3. Provide a concise explanation (max 2 sentences).
    4. Select the most relevant sources from the list.
    
    Return pure JSON format:
    {
      "verdict": "True" | "False" | "Mixed" | "Unverified",
      "credibility_score": number,
      "explanation": "string",
      "confidence_level": number
    }
  `;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const textResponse = response.data.candidates[0].content.parts[0].text;
    // Clean code blocks if present
    const jsonString = textResponse.replace(/```json|```/g, '').trim();
    const aiResult = JSON.parse(jsonString);

    return {
      id: 'ai-' + Math.random().toString(36).substr(2, 9),
      input_text: claim,
      verdict: aiResult.verdict,
      credibility_score: aiResult.credibility_score,
      confidence_level: aiResult.confidence_level,
      explanation: aiResult.explanation,
      sources: sources, // Pass through sources
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    throw new Error("AI analysis failed. Please check API keys.");
  }
}

// --- Orchestrator ---
export const verifyClaim = async (input: string): Promise<ClaimResult> => {
  // 1. Try Google Fact Check first (Fastest & Most Reliable)
  const factCheckResult = await checkExistingFactChecks(input);
  if (factCheckResult) return factCheckResult;

  // 2. If not found, Search the Web
  const sources = await searchWeb(input);
  
  if (sources.length === 0) {
    return {
      id: 'err-' + Date.now(),
      input_text: input,
      verdict: 'Unverified',
      credibility_score: 0,
      confidence_level: 0,
      explanation: "No sufficient information found to verify this claim.",
      sources: [],
      created_at: new Date().toISOString()
    };
  }

  // 3. Analyze with Gemini
  return await analyzeWithGemini(input, sources);
};
