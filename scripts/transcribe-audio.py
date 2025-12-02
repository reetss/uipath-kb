#!/usr/bin/env python3
"""
YouTube Audio Transcription Engine
Uses yt-dlp + OpenAI Whisper for reliable transcription

Usage:
    python scripts/transcribe-audio.py VIDEO_URL
    python scripts/transcribe-audio.py --batch video-list.txt
"""

import sys
import os
import argparse
import subprocess
import tempfile
from pathlib import Path
import re
import time

try:
    import whisper
except ImportError:
    print("❌ Error: openai-whisper not installed")
    print("Install: pip install openai-whisper")
    sys.exit(1)

# Configuration - Global variables
VIDEOS_DIR = Path(__file__).parent.parent / "knowledge" / "videos"
AUDIO_FORMAT = "mp3"

# Will be set in main()
WHISPER_MODEL = "base"  # tiny, base, small, medium, large

def extract_video_id(url):
    """Extract video ID from YouTube URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)',
        r'youtube\.com\/embed\/([^&\s]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def download_audio(url, output_path):
    """Download audio from YouTube video using yt-dlp"""
    print(f"   🎵 Downloading audio...")
    
    cmd = [
        "yt-dlp",
        "--extract-audio",
        "--audio-format", AUDIO_FORMAT,
        "--audio-quality", "0",  # Best quality
        "--output", str(output_path),
        "--no-playlist",
        "--quiet",
        "--progress",
        url
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Download failed: {e.stderr}")
        return False

def transcribe_audio(audio_path, model):
    """Transcribe audio using Whisper"""
    print(f"   🎯 Transcribing with Whisper ({WHISPER_MODEL} model)...")
    
    try:
        result = model.transcribe(str(audio_path), language="en", verbose=False)
        return result["text"]
    except Exception as e:
        print(f"   ❌ Transcription failed: {e}")
        return None

def process_video(url, skip_existing=True):
    """Process a single video: download audio + transcribe"""
    video_id = extract_video_id(url)
    if not video_id:
        print(f"❌ Invalid URL: {url}")
        return False
    
    print(f"\n📹 Processing: {video_id}")
    print(f"   🔗 {url}")
    
    # Check if transcript already exists
    transcript_file = VIDEOS_DIR / f"{video_id}-transcript-whisper.txt"
    if skip_existing and transcript_file.exists():
        print(f"   ⏭️  Already transcribed, skipping...")
        return True
    
    start_time = time.time()
    
    # Create temp directory for audio
    with tempfile.TemporaryDirectory() as temp_dir:
        audio_path = Path(temp_dir) / f"{video_id}.{AUDIO_FORMAT}"
        
        # Step 1: Download audio
        if not download_audio(url, audio_path):
            return False
        
        # Check if audio file exists
        if not audio_path.exists():
            print(f"   ❌ Audio file not created")
            return False
        
        audio_size_mb = audio_path.stat().st_size / (1024 * 1024)
        print(f"   ✅ Audio downloaded ({audio_size_mb:.1f} MB)")
        
        # Step 2: Load Whisper model (only once)
        if not hasattr(process_video, 'model'):
            print(f"   🤖 Loading Whisper model ({WHISPER_MODEL})...")
            process_video.model = whisper.load_model(WHISPER_MODEL)
        
        # Step 3: Transcribe
        transcript = transcribe_audio(audio_path, process_video.model)
        
        if not transcript:
            return False
        
        # Step 4: Save transcript
        transcript_file.parent.mkdir(parents=True, exist_ok=True)
        transcript_file.write_text(transcript, encoding='utf-8')
        
        duration = time.time() - start_time
        transcript_size_kb = len(transcript) / 1024
        
        print(f"   ✅ Transcript saved ({transcript_size_kb:.1f} KB, {duration:.0f}s)")
        print(f"   📄 {transcript_file}")
        
        return True

def process_batch(video_list_file, skip_existing=True):
    """Process multiple videos from a file"""
    print(f"🚀 Batch Audio Transcription Engine\n")
    print(f"📂 Video list: {video_list_file}")
    print(f"⚙️  Model: {WHISPER_MODEL}")
    print(f"⚙️  Skip existing: {skip_existing}\n")
    
    # Read URLs from file
    with open(video_list_file, 'r') as f:
        urls = [
            line.strip() 
            for line in f 
            if line.strip() 
            and not line.strip().startswith('#')
            and 'youtube.com' in line
        ]
    
    print(f"📊 Found {len(urls)} videos to process\n")
    
    results = {
        'successful': 0,
        'failed': 0,
        'skipped': 0
    }
    
    for i, url in enumerate(urls, 1):
        print(f"\n{'='*60}")
        print(f"Video {i}/{len(urls)}")
        print('='*60)
        
        success = process_video(url, skip_existing)
        
        if success:
            # Check if it was skipped
            video_id = extract_video_id(url)
            transcript_file = VIDEOS_DIR / f"{video_id}-transcript-whisper.txt"
            if transcript_file.exists():
                results['successful'] += 1
        else:
            results['failed'] += 1
        
        # Pause between videos
        if i < len(urls):
            print("\n⏳ Waiting 3 seconds...")
            time.sleep(3)
    
    # Summary
    print("\n" + "="*60)
    print("📊 BATCH PROCESSING SUMMARY")
    print("="*60)
    print(f"✅ Successful: {results['successful']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"📄 Total: {len(urls)}")
    print("="*60)
    print(f"\n✨ All transcripts saved to: {VIDEOS_DIR}")

def main():
    parser = argparse.ArgumentParser(description="YouTube Audio Transcription Engine")
    parser.add_argument('input', help="YouTube URL or video list file")
    parser.add_argument('--batch', action='store_true', help="Process batch from file")
    parser.add_argument('--no-skip', action='store_true', help="Re-transcribe existing files")
    parser.add_argument('--model', default=WHISPER_MODEL, 
                       choices=['tiny', 'base', 'small', 'medium', 'large'],
                       help="Whisper model size (default: base)")
    
    args = parser.parse_args()
    
    skip_existing = not args.no_skip
    
    try:
        if args.batch:
            process_batch(args.input, skip_existing)
        else:
            process_video(args.input, skip_existing)
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
