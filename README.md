📘 Factify — AI-Powered Misinformation & Deepfake Detection Platform

Factify is a modern AI-powered web application designed to combat misinformation by verifying text-based claims and detecting AI-generated deepfake media. It provides users with credibility analysis, explainable results, and intelligent insights using cutting-edge AI models.

🚀 Features
🧠 Claim Verification (Text-Based)

Analyze text claims or news content

AI-powered credibility assessment

Verdict classification:

✅ True

❌ False

⚠️ Misleading

❓ Unverified

Credibility score (0–100)

Explainable reasoning and summaries

🎭 Deepfake Detection (NEW)

Detects AI-generated / manipulated media

Supports:

🖼️ Image-based deepfake detection

🎥 Video deepfake analysis (if enabled)

Uses AI models to analyze:

Facial inconsistencies

Artifact patterns

Manipulation traces

Returns:

Deepfake probability score

Real vs Fake classification

Confidence indicators

🔥 This feature was added recently and is now a core capability of Factify.

🖥️ Frontend

Built with React + TypeScript

Powered by Vite for fast builds

Modern UI using:

Tailwind CSS

ShadCN UI components

Smooth animations & interactive charts

Responsive and accessible design

🗄️ Backend & Infrastructure

Supabase for:

Authentication

Database

Storage

Serverless architecture

Secure API handling for AI requests

📊 Data & Visualization

Visual credibility scores

Charts for analysis trends

Real-time feedback on submissions

🧱 Tech Stack

Frontend

React

TypeScript

Vite

Tailwind CSS

ShadCN UI

Recharts

Backend / Services

Supabase

AI APIs (LLMs + Deepfake Models)

Tooling

ESLint

PostCSS

Netlify (deployment)

📂 Project Structure
Factify/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   └── styles/
├── supabase/
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json

⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/factify.git
cd factify

2️⃣ Install Dependencies
npm install

3️⃣ Environment Variables

Create a .env file:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_AI_API_KEY=your_ai_api_key

4️⃣ Run Locally
npm run dev

🧪 Usage

Submit a text claim to verify authenticity

Upload images/videos for deepfake detection

View AI-generated verdicts, scores, and explanations instantly

📦 Deployment
Netlify
npm run build


Deploy the dist/ folder via Netlify.

🔐 Security

Environment-based API key protection

Input validation & sanitization

Supabase auth & role-based access

🧪 Testing
npm run lint

🤝 Contributing

Fork the repository

Create a new branch

Commit your changes

Open a pull request

📌 Future Enhancements

Audio deepfake detection

Browser extension

Multilingual verification

Whatsapp bot