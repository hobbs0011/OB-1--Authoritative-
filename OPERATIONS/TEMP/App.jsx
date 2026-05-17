// NOTE: Inline style object was mangled during API transfer.
// Verify style prop against source: hobbs0011/NET-Ai-EcoSystem-CommandStation
// Original was likely: style={ { padding: '2rem' } }
import React from "react";

const appStyle = { padding: '2rem' };

export default function App() {
  return (
    <div style={appStyle}>
      <h1>Welcome to the NET Classroom</h1>
      <p>This is your command station for student lessons, ethics, and AI practice.</p>
      <ul>
        <li>Start with an intro briefing</li>
        <li>Explore ethics, rules, and AI topics</li>
        <li>Edit and manage lesson packs</li>
      </ul>
      <p>Select a lesson from the sidebar to begin.</p>
    </div>
  );
}
