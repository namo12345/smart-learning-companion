
## ✅ README.md 

````markdown
# 🧠 Smart Learning Companion

An AI-powered educational assistant that helps students **learn, test, and revise** topics — all from a single interactive interface.

> 📡 Live Demo:  
> 👉 [https://smart-learning-livid.vercel.app](https://smart-learning-livid.vercel.app)

---

## ✨ Features

- 🔎 **AI Topic Research**: Enter any topic and get a deep, student-friendly explanation
- 📝 **Quiz Generator**: Creates 5-question MCQ quizzes based on your selected difficulty
- ✅ **Feedback & Scoring**: Instant grading with detailed answer explanations
- 🃏 **Flashcard Review**: Flip-through flashcards based on quiz feedback
- 🔊 **Text-to-Speech (TTS)**: Reads content aloud for auditory learners
- 📜 **Past Attempts History**: Tracks quiz scores locally using `localStorage`

---

## ⚠️ Important Note

> 🛠️ **If the "Generate Quiz" button doesn't respond on first click, please click it again.**  
> This happens occasionally due to API response timing — retrying will fix it.

---

## 🛠️ Tech Stack

| Layer      | Tech Used                     |
|------------|-------------------------------|
| Frontend   | HTML, CSS, JavaScript (Vanilla) |
| Backend    | Vercel Serverless Functions (`api/chat.js`) |
| AI Engine  | OpenRouter API (GPT-based)    |
| Hosting    | Vercel (Frontend + API)       |
| Extras     | Web Speech API (for TTS), localStorage |

---

## 🚀 How It Works

```mermaid
flowchart LR
    A[Enter Topic] --> B[AI Research (GPT)]
    B --> C[Select Difficulty]
    C --> D[Generate Quiz]
    D --> E[Submit Answers]
    E --> F[See Feedback + Flashcards]
    F --> G[Review Past Attempts]
````

---

## 📂 Folder Structure

```
smart-learning/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── api/
│   └── chat.js       ← GPT request via secure Vercel function
├── vercel.json       ← Optional config
└── README.md
```

---

## 📦 How to Deploy (For Developers)

1. Clone the repo
2. Add `api/chat.js` with your OpenRouter logic
3. Add environment variable in Vercel: `OR_KEY = your-api-key`
4. Push to GitHub → Deploy via [https://vercel.com](https://vercel.com)

---
