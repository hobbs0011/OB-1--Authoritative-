/**
 * app/page.tsx
 * Main OBI Chat Interface
 */

"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";

interface Message {
  role: "user" | "obi";
  content: string;
}

interface StudentState {
  weakPoints: string[];
  streak: number;
  topWeaknesses?: Array<{ tag: string; severity: number }>;
}

export default function Home() {
  const [studentId, setStudentId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentState, setStudentState] = useState<StudentState | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize session
  async function handleStart() {
    if (!studentId) {
      alert("Please enter a student ID");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/student/" + studentId);
      if (!res.ok) throw new Error("Student not found");

      const data = await res.json();
      setStudentState(data.student);
      setMessages([
        {
          role: "obi",
          content: `Hey there! I'm OBI. I see you're learning English at level ${data.student.level}. Your streak is ${data.student.streak} days. Let's practice speaking today!`,
        },
      ]);
    } catch (error) {
      alert("Error loading student: " + (error as any).message);
    } finally {
      setLoading(false);
    }
  }

  // Send message to chat
  async function sendMessage() {
    if (!input.trim() || !studentId || loading) return;

    setLoading(true);
    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, message: userMessage }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "obi", content: data.response },
      ]);

      // Update student state
      if (data.weakPoints) {
        setStudentState((prev) =>
          prev ? { ...prev, weakPoints: data.weakPoints, streak: data.streak } : null
        );
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "obi",
          content: "Oops, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // If no session started
  if (!studentId) {
    return (
      <div className={styles.container}>
        <div className={styles.startup}>
          <h1>🎯 OBI — English Speaking Coach</h1>
          <p className={styles.tagline}>
            "You don't learn English by using an app. You learn by being held accountable."
          </p>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Enter student ID (or email for new session)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleStart()}
            />
            <button onClick={handleStart} disabled={loading}>
              {loading ? "Loading..." : "Start Session"}
            </button>
          </div>
          <p className={styles.hint}>
            💡 Don't have an ID? Type your email to create a new account.
          </p>
        </div>
      </div>
    );
  }

  // Chat interface
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>OBI</h1>
        {studentState && (
          <div className={styles.stats}>
            <span>Level: {studentState.weakPoints ? "A2" : "A1"}</span>
            <span>🔥 Streak: {studentState.streak} days</span>
          </div>
        )}
      </header>

      <div className={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
            <div className={styles.bubble}>
              <strong>{msg.role === "user" ? "You" : "OBI"}:</strong>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type or speak English..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? "..." : "Send"}
        </button>
      </div>

      {studentState?.topWeaknesses && studentState.topWeaknesses.length > 0 && (
        <div className={styles.weaknesses}>
          <h4>Your Focus Areas:</h4>
          {studentState.topWeaknesses.map((w) => (
            <span key={w.tag} className={styles.tag}>
              {w.tag} ({Math.round(w.severity * 100)}%)
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
