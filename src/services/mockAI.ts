import { AnalysisResult, VerdictType } from "../types";
import { sleep } from "../lib/utils";

// Simulates the Python FastAPI Microservice
export const analyzeClaim = async (text: string): Promise<AnalysisResult> => {
  await sleep(2500); // Simulate network/processing latency

  const lowerText = text.toLowerCase();
  
  let verdict: VerdictType = 'Unverified';
  let score = 50;
  let summary = "Analysis inconclusive. Ensure the claim contains verifiable facts.";
  
  // Simple heuristic mocking for demonstration
  if (lowerText.includes("earth is flat") || lowerText.includes("fake") || lowerText.includes("scam")) {
    verdict = 'False';
    score = 12;
    summary = "Multiple scientific sources contradict this claim. The consensus is overwhelmingly against this statement.";
  } else if (lowerText.includes("water") || lowerText.includes("sky is blue") || lowerText.includes("verified")) {
    verdict = 'True';
    score = 94;
    summary = "This claim is supported by multiple high-credibility sources and general scientific consensus.";
  } else if (lowerText.includes("maybe") || lowerText.includes("rumor")) {
    verdict = 'Mixed';
    score = 45;
    summary = "Sources are conflicted. Some elements are factual, while others lack evidence or context.";
  } else {
    // Randomize for generic inputs to show UI states
    const rand = Math.random();
    if (rand > 0.6) {
        verdict = 'True';
        score = 88;
        summary = "Verified by cross-referencing recent news articles from trusted outlets.";
    } else {
        verdict = 'False';
        score = 23;
        summary = "Flagged as potential misinformation due to lack of corroborating evidence from major outlets.";
    }
  }

  return {
    id: crypto.randomUUID(),
    verdict,
    score,
    confidence: Math.floor(Math.random() * (99 - 70) + 70),
    summary,
    sources: [
      { id: '1', name: 'Reuters', url: '#', credibility: 'High' },
      { id: '2', name: 'Associated Press', url: '#', credibility: 'High' },
      { id: '3', name: 'FactCheck.org', url: '#', credibility: 'High' },
    ],
    analyzed_at: new Date().toISOString(),
  };
};
