import { pipeline, env } from '@xenova/transformers';
import { BertAnalysis } from '../types';

// Configure to not load from local path, but fetch from CDN
env.allowLocalModels = false;
env.useBrowserCache = true;

let classifier: any = null;

export const loadBertModel = async () => {
  if (!classifier) {
    // We use a DistilBERT model fine-tuned for sentiment analysis.
    // High negative sentiment in news claims often correlates with fear-mongering/clickbait.
    console.log("Loading BERT model...");
    classifier = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
    console.log("BERT model loaded.");
  }
  return classifier;
};

export const analyzeWithBert = async (text: string): Promise<BertAnalysis | null> => {
  try {
    const model = await loadBertModel();
    const output = await model(text);
    
    // Output format: [{ label: 'POSITIVE'|'NEGATIVE', score: 0.99 }]
    const result = output[0];
    
    let intensity: 'High' | 'Medium' | 'Low' = 'Low';
    if (result.score > 0.9) intensity = 'High';
    else if (result.score > 0.75) intensity = 'Medium';

    return {
      label: result.label,
      score: result.score,
      intensity
    };
  } catch (error) {
    console.error("BERT Analysis failed:", error);
    return null;
  }
};
