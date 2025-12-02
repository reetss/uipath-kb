#!/usr/bin/env python3
"""
Robust Video Transcription with yt-dlp + faster-whisper
"""

import os
import sys
import subprocess
import json
from pathlib import Path
from faster_whisper import WhisperModel

# Configuration
VIDEOS_DIR = Path(__file__).parent.parent / "knowledge" / "videos"
AUDIO_DIR = VIDEOS_DIR / "audio"
AUDIO_DIR.mkdir(exist_ok=True)

def extract_video_id(url):
    """Extract video ID from YouTube URL"""
    if "v=" in url:
        return url.split("v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    return None

def download_audio(url, video_id):
    """Download audio from YouTube video"""
    audio_file = AUDIO_DIR / f"{video_id}.mp3"
    
    if audio_file.exists():
        print(f"   ⏭️  Audio already exists: {audio_file.name}")
        return audio_file
    
    print(f"   📥 Downloading audio...")
    cmd = [
        "yt-dlp",
        "-x",  # Extract audio
        "--audio-format", "mp3",
        "--audio-quality", "0",  # Best quality
        "-o", str(audio_file),
        url
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"   ✅ Downloaded: {audio_file.name}")
        return audio_file
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Download failed: {e.stderr}")
        return None

def transcribe_audio(audio_file, video_id, model_size="base"):
    """Transcribe audio using faster-whisper"""
    transcript_file = VIDEOS_DIR / f"{video_id}-transcript-whisper.txt"
    
    if transcript_file.exists():
        print(f"   ⏭️  Transcript already exists")
        return transcript_file
    
    print(f"   🎯 Transcribing with faster-whisper ({model_size})...")
    
    # Load model (cached after first use)
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    
    # Transcribe
    segments, info = model.transcribe(str(audio_file), beam_size=5)
    
    print(f"   🌍 Detected language: {info.language} ({info.language_probability:.2%})")
    
    # Collect transcript
    transcript_lines = []
    for segment in segments:
        transcript_lines.append(segment.text.strip())
    
    transcript = "\n".join(transcript_lines)
    
    # Save
    transcript_file.write_text(transcript, encoding="utf-8")
    
    size_kb = transcript_file.stat().st_size / 1024
    print(f"   ✅ Transcript saved: {size_kb:.1f} KB")
    
    return transcript_file

def process_video(url, model_size="base"):
    """Process a single video: download + transcribe"""
    video_id = extract_video_id(url)
    if not video_id:
        print(f"❌ Invalid URL: {url}")
        return False
    
    print(f"\n📹 Processing: {video_id}")
    print(f"   🔗 {url}")
    
    # Download audio
    audio_file = download_audio(url, video_id)
    if not audio_file:
        return False
    
    # Transcribe
    transcript_file = transcribe_audio(audio_file, video_id, model_size)
    if not transcript_file:
        return False
    
    return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python transcribe-video.py <video-url> [model-size]")
        print("Model sizes: tiny, base, small, medium, large-v2")
        print("Default: base (good balance of speed/quality)")
        sys.exit(1)
    
    url = sys.argv[1]
    model_size = sys.argv[2] if len(sys.argv) > 2 else "base"
    
    print("🚀 Video Transcription with faster-whisper")
    print(f"📂 Output: {VIDEOS_DIR}")
    print(f"🎯 Model: {model_size}\n")
    
    success = process_video(url, model_size)
    
    if success:
        print("\n✅ Success!")
    else:
        print("\n❌ Failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
