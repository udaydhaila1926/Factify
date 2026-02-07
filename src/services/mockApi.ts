import { ClaimResult } from '../types';

export const mockVerifyClaim = async (input: string): Promise<ClaimResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate analysis logic
      const isTrue = Math.random() > 0.5;
      resolve({
        id: Math.random().toString(36).substring(7),
        input_text: input,
        verdict: isTrue ? 'True' : 'False',
        credibility_score: isTrue ? 92 : 15,
        explanation: isTrue 
          ? "Multiple verified sources confirm this statement is accurate based on recent reports." 
          : "This claim contradicts established facts from primary sources.",
        sources: [
          { id: '1', name: 'Reuters', credibility: 'High', url: '#' },
          { id: '2', name: 'FactCheck.org', credibility: 'High', url: '#' }
        ],
        created_at: new Date().toISOString()
      });
    }, 1500);
  });
};
