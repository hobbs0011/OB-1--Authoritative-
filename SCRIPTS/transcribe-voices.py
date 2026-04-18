# Deepgram Transcription using Python SDK
import os
import sys

os.environ["DEEPGRAM_API_KEY"] = "2a921fd1b8fb218072597bc877ed53461efacb17"

from deepgram import DeepgramClient


def transcribe_audio(file_path):
    dg_client = DeepgramClient()

    with open(file_path, "rb") as audio:
        # Let Deepgram auto-detect the language
        response = dg_client.listen.v1.media.transcribe_file(
            request=audio, model="nova-2"
        )
        return response.results.channels[0].alternatives[0].transcript


files = [
    r"C:\Users\mrmic\Downloads\Voice 260416_211505.m4a",
    r"C:\Users\mrmic\Downloads\Voice 260416_203228.m4a",
]

output_dir = r"D:\OB-1\ASSETS\TRANSCRIPTIONS"
os.makedirs(output_dir, exist_ok=True)

for file_path in files:
    if os.path.exists(file_path):
        filename = os.path.splitext(os.path.basename(file_path))[0]
        print(f"Transcribing: {filename}")

        try:
            transcript = transcribe_audio(file_path)

            output_file = os.path.join(output_dir, f"{filename}.txt")
            with open(output_file, "w", encoding="utf-8", errors="replace") as f:
                f.write(transcript)

            print(f"Saved: {output_file}")
            print("---TRANSCRIPT---")
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
            print(transcript)
            print("===")
        except Exception as e:
            print(f"Error transcribing {filename}: {e}")
            import traceback

            traceback.print_exc()
    else:
        print(f"File not found: {file_path}")
