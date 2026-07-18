import { readFileSync, writeFileSync } from 'fs';

const raw = JSON.parse(readFileSync('D:\\OB-1-CANONICAL\\OPERATIONS\\CLASS-INTEL\\voice-260713-180332-transcript.json', 'utf8').replace(/^\uFEFF/, ''));
const utterances = raw.results?.utterances || [];

// Mai Tram = Speaker 0, Huong = Speaker 2
const studentMap = { 0: 'mai-tram-bluetech', 2: 'huong-bluetech' };

for (const [speakerNum, studentId] of Object.entries(studentMap)) {
  const segs = utterances.filter(u => u.speaker === parseInt(speakerNum));
  const text = segs.map(u => u.transcript).join(' ');
  const totalTime = segs.reduce((s, u) => s + (u.end - u.start), 0);
  
  const json = {
    session_date: '2026-07-13',
    duration_seconds: raw.results?.channels?.[0]?.duration_seconds || 0,
    student_utterances: segs.length,
    student_speaking_seconds: Math.round(totalTime),
    topics: ['Thailand travel', 'Vocabulary: consistent/inconsistent', 'Compliments vs insults culture', 'Sickness: cold vs flu', 'Grammar practice'],
    teacher: 'Michael (Speaker 1)',
    student_speaker_label: `Speaker ${speakerNum}`,
    transcript: segs.map(u => ({
      start: u.start,
      end: u.end,
      text: u.transcript
    })),
    full_text: text
  };
  
  const outPath = `D:\\OB-1-CANONICAL\\APPS\\NET-PET-AI\\public\\${studentId}-20260713-transcript.json`;
  writeFileSync(outPath, JSON.stringify(json, null, 2));
  console.log(`Written: ${outPath} (${segs.length} utterances, ${Math.round(totalTime/60)} min speaking)`);
}