import { analyzeClaim as analyzeMock } from "./mockAI";
import { analyzeWithOpenAI } from "./openai";
import { analyzeWithGemini } from "./gemini";
import { AnalysisResult } from "../types";
import { toast } from "sonner";

export type EngineType = 'mock' | 'openai' | 'gemini';

export const getActiveEngine = (): EngineType => {
  // Prioritize Environment Variables
  const envOpenAi = import.meta.env.VITE_OPENAI_API_KEY;
  const envGemini = import.meta.env.VITE_GEMINI_API_KEY;

  if (envOpenAi && envOpenAi.length > 10) return 'openai';
  if (envGemini && envGemini.length > 10) return 'gemini';
  
  return 'mock';
};

export const analyzeClaim = async (text: string, newsContext: string = ""): Promise<AnalysisResult> => {
  const engine = getActiveEngine();

  try {
    if (engine === 'openai') {
      const key = import.meta.env.VITE_OPENAI_API_KEY;
      return await analyzeWithOpenAI(text, key, newsContext);
    }
    
    if (engine === 'gemini') {
      const key = import.meta.env.VITE_GEMINI_API_KEY;
      return await analyzeWithGemini(text, key, newsContext);
    }
  } catch (error: any) {
    console.warn(`${engine} failed, falling back to mock:`, error);
    
    // Graceful Error Handling for Rate Limits
    if (error.message?.includes('Quota exceeded') || error.message?.includes('429')) {
        toast.warning('Gemini Free Tier Limit Reached', {
            description: 'Falling back to Mock Engine temporarily. Please wait a minute.',
            duration: 5000,
        });
    } else {
        toast.error(`${engine === 'openai' ? 'OpenAI' : 'Gemini'} Error`, {
            description: 'Service unavailable. Switching to Mock Engine.',
        });
    }
  }

  // Default / Fallback to Mock Engine
  return analyzeMock(text);
};
