import requests, sys, os

API_KEY = os.environ.get("DEEPGRAM_API_KEY")
if not API_KEY:
    print("ERROR: Set DEEPGRAM_API_KEY environment variable")
    sys.exit(1)
audio_path = sys.argv[1]

with open(audio_path, "rb") as f:
    audio_data = f.read()

print(f"File: {audio_path}")
print(f"Size: {len(audio_data)} bytes")

response = requests.post(
    "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en&punctuate=true&paragraphs=true&utterances=true",
    headers={"Authorization": f"Token {API_KEY}", "Content-Type": "audio/m4a"},
    data=audio_data,
    timeout=300,
)

if response.status_code == 200:
    result = response.json()
    metadata = result.get("metadata", {})
    duration = metadata.get("duration", 0)
    alt = result["results"]["channels"][0]["alternatives"][0]
    words = alt.get("words", [])
    transcript = alt.get("transcript", "")

    print(f"Duration: {duration:.1f}s ({duration/60:.1f} min)")
    print(f"Words: {len(words)} | Chars: {len(transcript)}")
    if words:
        print(
            f'Coverage: {words[0]["start"]:.1f}s - {words[-1]["end"]:.1f}s of {duration:.1f}s'
        )
    print("---TRANSCRIPT---")
    print(transcript)
else:
    print(f"Error {response.status_code}: {response.text}")
