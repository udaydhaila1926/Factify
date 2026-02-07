from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import random
from datetime import datetime

# Initialize App
app = FastAPI(title="Factify AI Microservice")

# Data Models
class ClaimRequest(BaseModel):
    text: str

class Source(BaseModel):
    name: str
    url: str
    credibility: str

class AnalysisResponse(BaseModel):
    verdict: str
    score: int
    confidence: int
    summary: str
    sources: List[Source]
    timestamp: str

# ML Logic Placeholder (Load models here in production)
# nlp = spacy.load("en_core_web_sm")
# sentiment_pipeline = pipeline("sentiment-analysis")

@app.get("/")
def health_check():
    return {"status": "online", "model_version": "v1.0.0"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_claim(request: ClaimRequest):
    text = request.text.lower()
    
    # 1. Extract Entities (Mock logic)
    # doc = nlp(text)
    
    # 2. Search Web (Mock logic - integrate Serper.dev here)
    
    # 3. Compare & Score
    # This logic would be replaced by actual LLM or Classifier inference
    
    verdict = "Unverified"
    score = 50
    summary = "Analysis pending deeper verification."
    
    if "fake" in text or "scam" in text:
        verdict = "False"
        score = 15
        summary = "Language patterns indicate high probability of misinformation."
    elif "verified" in text or "official" in text:
        verdict = "True"
        score = 92
        summary = "Claim aligns with official sources."
        
    return {
        "verdict": verdict,
        "score": score,
        "confidence": random.randint(70, 99),
        "summary": summary,
        "sources": [
            {"name": "Reuters", "url": "https://reuters.com", "credibility": "High"},
            {"name": "AP News", "url": "https://apnews.com", "credibility": "High"}
        ],
        "timestamp": datetime.now().isoformat()
    }

# To run: uvicorn main:app --reload
