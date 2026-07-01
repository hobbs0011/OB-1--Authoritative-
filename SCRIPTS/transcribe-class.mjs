import fs from "fs";
const filePath = "C:\\Users\\mrmic\\Downloads\\38833FF26BA1D.UnigramPreview_g9c9v27vpyspw!App\\Voice 260629_174541.m4a";
const outDir = "D:\\OB-1-CANONICAL\\OPERATIONS\\CLASS-INTEL\\2026-06-29-class10";
const apiKey = process.env.DEEPGRAM_API_KEY;
if (!fs.existsSync(filePath)) { console.error("MISSING FILE", filePath); process.exit(1); }
if (!apiKey) { console.error("MISSING DEEPGRAM_API_KEY"); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });
const audioBytes = fs.readFileSync(filePath);
const params = new URLSearchParams({
  model: "nova-3",
  language: "en",
  diarize: "true",
  utterances: "true",
  punctuate: "true",
  smart_format: "true",
  paragraphs: "true",
  words: "true"
});
const url = `https://api.deepgram.com/v1/listen?${params.toString()}`;
console.log("TRANSCRIBING", filePath, (audioBytes.length / 1024 / 1024).toFixed(2) + "MB");
fetch(url, {
  method: "POST",
  headers: { Authorization: `Token ${apiKey}`, "Content-Type": "audio/mp4" },
  body: audioBytes
})
.then(async (res) => {
  const text = await res.text();
  if (!res.ok) { console.error("HTTP", res.status, text); process.exit(1); }
  let data;
  try { data = JSON.parse(text); } catch (e) { fs.writeFileSync(outDir + "\\raw-error.txt", text); console.error("PARSE FAIL saved raw-error.txt"); process.exit(1); }
  const jsonPath = outDir + "\\2026-06-29-raw.json";
  const txtPath = outDir + "\\2026-06-29-transcript.txt";
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  const lines = [];
  if (data.results?.utterances?.length) {
    for (const u of data.results.utterances) {
      const mm = Math.floor(u.start / 60);
      const ss = Math.floor(u.start % 60);
      const ts = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
      lines.push(`[${ts} speaker:${u.speaker}] ${u.transcript}`);
    }
  } else {
    lines.push(data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "NO_TRANSCRIPT");
  }
  fs.writeFileSync(txtPath, lines.join("\n"));
  console.log("RAW", jsonPath);
  console.log("TXT", txtPath);
  console.log("UTTERANCES", data.results?.utterances?.length ?? 0);
  console.log("TRANSCRIPT_CHARS", lines.join("\n").length);
})
.catch((err) => { console.error("FETCH FAIL", err); process.exit(1); });
