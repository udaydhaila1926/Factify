export type Verdict = 'True' | 'False' | 'Mixed' | 'Unverified';

export interface Source {
  id: string;
  name: string;
  url: string;
  credibility: 'High' | 'Medium' | 'Low';
  snippet?: string;
  publishedDate?: string;
}

export interface ClaimResult {
  id: string;
  input_text: string;
  verdict: Verdict;
  credibility_score: number; // 0-100
  confidence_level: number; // 0-100
  explanation: string;
  sources: Source[];
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}
