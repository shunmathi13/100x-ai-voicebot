import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);

  async function sendQuestion() {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch("https://one00x-ai-voicebot.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      setAnswer(data.answer);

      const speech = new SpeechSynthesisUtterance(data.answer);
      speech.lang = "en-IN";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(speech);

      setQuestion("");
    } catch (error) {
      setAnswer("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      setQuestion(event.results[0][0].transcript);
    };
    recognition.start();
  }

  return (
    <div className="app">
      <header>
        <h2>100x AI Voice Assistant</h2>
        <p>My Personal AI Interview Assistant</p>
      </header>

      <main>
        <div className="avatar">🤖</div>
        <h1>Hello! Welcome.</h1>
        <p>Ask me about my experience, skills and journey.</p>

        <div className="suggestions">
          {[
            "Tell me about your life story",
            "What is your superpower?",
            "What are your growth areas?",
            "How do you push your limits?"
          ].map((item) => (
            <button key={item} onClick={() => setQuestion(item)}>
              {item}
            </button>
          ))}
        </div>

        {answer && (
          <div className="answer">
            <h3>My Answer</h3>
            <p>{answer}</p>
          </div>
        )}

        <div className="input-area">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask me a question..."
          />
          <button className="mic" onClick={startListening}>
            {listening ? "Listening..." : "🎤"}
          </button>
          <button className="send" onClick={sendQuestion} disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </main>

      <footer>Powered by AI | 100x Voice Bot</footer>
    </div>
  );
}

export default App;
