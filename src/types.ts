export interface Source {
  id: string;
  name: string;
  credibility: string;
  url: string;
}

export interface ClaimResult {
  id: string;
  input_text: string;
  verdict: 'True' | 'False' | 'Mixed' | 'Unverified';
  credibility_score: number;
  explanation: string;
  sources: Source[];
  created_at: string;
}
