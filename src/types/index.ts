export type VerdictType = 'True' | 'False' | 'Mixed' | 'Unverified';

export interface Source {
  id: string;
  name: string;
  url: string;
  credibility: 'High' | 'Medium' | 'Low';
}

export interface GoogleFactCheckReview {
  publisher: {
    name: string;
    site: string;
  };
  url: string;
  title: string;
  reviewDate?: string;
  textualRating: string;
  languageCode: string;
}

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
}

export interface BertAnalysis {
  label: string; // e.g., "POSITIVE", "NEGATIVE"
  score: number; // 0-1
  intensity: 'High' | 'Medium' | 'Low';
}

export interface AnalysisResult {
  id: string;
  verdict: VerdictType;
  score: number; // 0-100
  confidence: number; // 0-100
  summary: string;
  sources: Source[];
  analyzed_at: string;
  
  // Integrations
  factChecks?: GoogleFactCheckReview[];
  linguisticAnalysis?: BertAnalysis;
  relatedNews?: NewsArticle[];
}

// Matches the Supabase 'claims' table structure
export interface DbClaim {
  id: string;
  user_id: string;
  input_text: string;
  verdict: VerdictType;
  score: number;
  confidence: number;
  explanation: string;
  sources: Source[];
  created_at: string;
}

export interface ClaimHistoryItem extends AnalysisResult {
  text: string;
}

export interface UserSettings {
  openai_api_key?: string;
  gemini_api_key?: string;
  google_fact_check_key?: string;
  news_api_key?: string;
}
