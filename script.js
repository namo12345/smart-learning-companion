const API_URL = "/api/chat";

let correctAnswers = [];
let explanations = [];
let flashcards = [];
let currentCard = 0;
let flipped = false;

function showLoader(message, type) {
  const loader = document.getElementById(type + "Loader");
  if (loader) {
    loader.innerHTML = `<span>${message}</span><span class="spinner"></span>`;
    loader.style.display = "block";
  }
}

function hideLoader(type) {
  const loader = document.getElementById(type + "Loader");
  if (loader) loader.style.display = "none";
}

async function researchTopic() {
  const topic = document.getElementById("topic").value.trim();
  if (!topic) return alert("Please enter a topic!");

  ["research", "quiz-container", "result", "feedback", "history"].forEach(id => document.getElementById(id).innerHTML = "");
  ["submitBtnWrapper", "quizBtnWrapper", "difficultyWrapper", "ttsWrapper", "ttsControl", "ttsResultWrapper", "flashcardContainer"].forEach(id => document.getElementById(id).style.display = "none");
  stopTTS();

  showLoader("🔎 Researching...", "research");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: `Explain the concept of ${topic} clearly and deeply for a student.` })
  });

  const data = await res.json();
  hideLoader("research");

  const content = data?.choices?.[0]?.message?.content;
  document.getElementById("research").innerText = content || "❌ No content returned.";
  document.getElementById("difficultyWrapper").style.display = "block";
  document.getElementById("quizBtnWrapper").style.display = "block";
  document.getElementById("ttsWrapper").style.display = "block";
}

async function generateQuiz() {
  const topic = document.getElementById("topic").value.trim();
  const difficulty = document.getElementById("difficulty").value;
  if (!topic) return alert("Enter topic");

  ["quiz-container", "result", "feedback"].forEach(id => document.getElementById(id).innerHTML = "");
  ["submitBtnWrapper", "ttsResultWrapper", "flashcardContainer"].forEach(id => document.getElementById(id).style.display = "none");
  stopTTS();

  showLoader("🧠 Generating quiz...", "quiz");

  const prompt = `Create a ${difficulty} level quiz with 5 questions on '${topic}'. Each should include:
Question
A) Option
B) Option
C) Option
D) Option
Answer: A
Explanation: why it's correct`;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();
  hideLoader("quiz");

  const content = data?.choices?.[0]?.message?.content;
  if (!content) return document.getElementById("quiz-container").innerText = "❌ No quiz returned.";
  parseAndDisplayQuiz(content);
  document.getElementById("submitBtnWrapper").style.display = "block";
}

function parseAndDisplayQuiz(rawText) {
  const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
  let html = '', question = '', options = [], answer = '', explanation = '', count = 0;
  correctAnswers = [];
  explanations = [];

  const commit = () => {
    if (question && options.length === 4 && answer && explanation) {
      html += `<div class='question'><p><strong>${question}</strong></p>`;
      options.forEach((opt, idx) => {
        html += `<label><input type='radio' name='q${count}' value='${opt}'> ${opt}</label><br>`;
      });
      html += `</div>`;
      correctAnswers.push(options["ABCD".indexOf(answer)]);
      explanations.push(explanation);
      count++;
    }
  };

  lines.forEach(line => {
    if (/^\d+\./.test(line)) {
      commit();
      question = line;
      options = [];
      answer = '';
      explanation = '';
    } else if (/^[A-Da-d][)\.]/.test(line)) {
      options.push(line.slice(3).trim());
    } else if (/^Answer[:\s]/i.test(line)) {
      answer = line.match(/Answer[:\s]*([A-Da-d])/i)?.[1].toUpperCase();
    } else if (/^Explanation[:\s]/i.test(line)) {
      explanation = line.replace(/^Explanation[:\s]*/i, '');
    }
  });
  commit();

  document.getElementById("quiz-container").innerHTML = html;
}

function submitQuiz() {
  let score = 0;
  let result = "<h3>Results:</h3>";

  correctAnswers.forEach((ans, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    const userAns = selected ? selected.value : "(none)";
    const correct = userAns === ans;

    if (correct) score++;
    result += `<p><strong>Q${i + 1}</strong>: ${correct ? "✅ Correct" : `❌ Incorrect (Correct: ${ans})`}<br><em>Your Answer: ${userAns}</em></p>`;
  });

  document.getElementById("result").innerHTML = result + `<h3>Score: ${score}/5</h3>`;
  document.getElementById("ttsResultWrapper").style.display = "block";

  saveHistory(score);
  showHistory();

  flashcards = explanations.map((exp, idx) => ({
    front: `Explanation for Q${idx + 1}`,
    back: exp
  }));

  if (flashcards.length) {
    currentCard = 0;
    flipped = false;
    document.getElementById("flashcardContainer").style.display = "block";
    renderFlashcard();
  }
}

function renderFlashcard() {
  const card = flashcards[currentCard];
  document.getElementById("flashFront").innerText = card.front;
  document.getElementById("flashBack").innerText = card.back;
  const cardEl = document.getElementById("flashcard");
  cardEl.classList.remove("flip");
  if (flipped) cardEl.classList.add("flip");
}

function flipFlashcard() {
  flipped = !flipped;
  renderFlashcard();
}

function nextFlashcard() {
  if (currentCard < flashcards.length - 1) {
    currentCard++;
    flipped = false;
    renderFlashcard();
  }
}

function prevFlashcard() {
  if (currentCard > 0) {
    currentCard--;
    flipped = false;
    renderFlashcard();
  }
}

function saveHistory(score) {
  const topic = document.getElementById("topic").value;
  const difficulty = document.getElementById("difficulty").value;
  const history = JSON.parse(localStorage.getItem("quizHistory") || "[]");
  history.push({ topic, difficulty, score, date: new Date().toLocaleString() });
  localStorage.setItem("quizHistory", JSON.stringify(history));
}

function showHistory() {
  const data = JSON.parse(localStorage.getItem("quizHistory") || "[]");
  if (!data.length) return;
  let html = "<h3>📊 Past Attempts</h3><ul>";
  data.slice(-5).reverse().forEach(entry => {
    html += `<li><strong>${entry.topic}</strong> [${entry.difficulty}] - ${entry.score}/5 (${entry.date})</li>`;
  });
  html += "</ul>";
  document.getElementById("history").innerHTML = html;
}

// 🔊 TTS Functions
let utterance;

function speakText(sectionId) {
  const text = document.getElementById(sectionId)?.innerText;
  if (!text) return;
  stopTTS();
  utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
  document.getElementById("ttsControl").style.display = "flex";
}

function pauseTTS() {
  if (speechSynthesis.speaking) speechSynthesis.pause();
}

function resumeTTS() {
  if (speechSynthesis.paused) speechSynthesis.resume();
}

function stopTTS() {
  if (speechSynthesis.speaking || speechSynthesis.paused) {
    speechSynthesis.cancel();
  }
  document.getElementById("ttsControl").style.display = "none";
}
