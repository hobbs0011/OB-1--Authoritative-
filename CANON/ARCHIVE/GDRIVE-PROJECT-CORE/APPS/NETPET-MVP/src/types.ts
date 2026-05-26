// Core type definitions for OBI system

export interface StudentMemory {
  student_id: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  daily_streak: number;
  last_session_timestamp: number;
  weak_phonemes: string[];
  recent_errors: ErrorRecord[];
  memory_summary: string;
  retention_score: number;
  total_sessions: number;
  joined_date: number;
}

export interface ErrorRecord {
  input: string;
  correction: string;
  mistake_type: "phoneme" | "grammar" | "vocabulary" | "pronunciation";
  timestamp: number;
  session_id: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DailyTask {
  type: "speaking" | "listening" | "writing" | "correction";
  prompt: string;
  focus_area: string;
  difficulty: "easy" | "medium" | "hard";
  duration_minutes: number;
  weak_areas_target: string[];
}

export interface AIResponse {
  reply: string;
  corrections: ErrorRecord[];
  next_focus: string;
  streak_updated: boolean;
  new_streak_count: number;
}

export interface ProgressReport {
  daily_active: boolean;
  session_count: number;
  streak: number;
  weak_phonemes: string[];
  improvement_areas: string[];
  retention_score: number;
}
