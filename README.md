📘 Factify — AI-Powered Real-Time Misinformation Verification

Factify is a full-stack web platform that analyzes online claims, text, or URLs and returns a verdict, credibility score, and explainable evidence using AI + web intelligence.

🚀 Features
🧠 AI Verification Engine

Accepts text claims or URLs

Uses NLP + web-search retrieval

Returns:

✔️ True / False / Misleading / Unverified

🔢 Credibility Score (0–100)

📚 Cited Evidence with summarized reasoning

🖥️ Frontend (Next.js)

Modern UI built with Next.js 14 App Router

TailwindCSS + ShadCN UI components

Real-time result cards

Debounced search and URL validation

⚙️ Backend (Django API)

REST API using Django Rest Framework (DRF)

Endpoint /api/verify handles:

Claim analysis

Web search retrieval

AI inference + explanation

PostgreSQL database for logging verification history

🔐 Security

Rate limiting

API key protection for AI calls

Sanitized input validation

📡 Architecture (High Level)
Next.js (client)  
   ↓ fetch()  
Django REST API  
   ↓  
AI Engine (LLM + Retrieval)  
   ↓  
Verdict + Score + Evidence

📂 Project Structure
Frontend (Next.js)
/frontend
 ├── app/
 │    ├── page.tsx
 │    ├── api/
 │    └── components/
 ├── public/
 ├── styles/
 └── package.json

Backend (Django)
/backend
 ├── factify/
 │    ├── settings.py
 │    ├── urls.py
 │    ├── wsgi.py
 ├── api/
 │    ├── views.py
 │    ├── serializers.py
 │    ├── urls.py
 ├── models/
 └── requirements.txt

🔧 Installation & Setup
1. Clone the Repository
git clone https://github.com/yourusername/factify.git
cd factify

🖥️ Frontend Setup (Next.js)
Install dependencies:
cd frontend
npm install

Run locally:
npm run dev

Environment variables:

Create .env.local:

NEXT_PUBLIC_API_URL=http://localhost:8000/api

⚙️ Backend Setup (Django)
Create & activate virtual environment:
cd backend
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

Install dependencies:
pip install -r requirements.txt

Run server:
python manage.py migrate
python manage.py runserver

Environment variables (.env):
OPENAI_API_KEY=your_key_here
SEARCH_API_KEY=your_key_here
DEBUG=True

🔌 API Usage
POST /api/verify
Request:
{
  "claim": "COVID-19 was created in a lab.",
  "source_url": ""
}

Response:
{
  "verdict": "Misleading",
  "score": 42,
  "evidence": ["Source 1...", "Source 2..."]
}

📦 Deployment
Frontend

Deploy on Vercel

vercel deploy

Backend

Deploy on Render, Railway, or AWS EC2

Use Gunicorn + Nginx

🧪 Testing
Frontend tests:
npm run test

Backend tests:
python manage.py test

🤝 Contributing

Fork the repo

Create a feature branch

Submit a pull request