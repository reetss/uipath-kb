#!/usr/bin/env python3
"""
Batch Video Transcription with yt-dlp + faster-whisper
Processes all videos from video-list-clean.txt
"""

import os
import sys
import time
import subprocess
from pathlib import Path

def read_video_list(file_path):
    """Read video URLs from file"""
    urls = []
    with open(file_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and 'youtube.com' in line:
                urls.append(line)
    return urls

def main():
    script_dir = Path(__file__).parent
    video_list_file = script_dir.parent / "knowledge" / "videos" / "video-list-clean.txt"
    transcribe_script = script_dir / "transcribe-video.py"
    python_bin = script_dir.parent / ".venv-whisper" / "bin" / "python"
    model_size = sys.argv[1] if len(sys.argv) > 1 else "base"
    
    print("🚀 Batch Video Transcription with faster-whisper")
    print(f"📂 Video list: {video_list_file}")
    print(f"🎯 Model: {model_size}\n")
    
    urls = read_video_list(video_list_file)
    print(f"📊 Found {len(urls)} videos to process\n")
    
    results = {"success": 0, "failed": 0, "total": len(urls)}
    
    for i, url in enumerate(urls, 1):
        print(f"\n{'='*60}")
        print(f"[{i}/{len(urls)}]")
        
        start = time.time()
        
        # Call transcribe-video.py as subprocess
        try:
            subprocess.run(
                [str(python_bin), str(transcribe_script), url, model_size],
                check=True
            )
            results["success"] += 1
            duration = time.time() - start
            print(f"⏱️  Duration: {duration:.1f}s")
        except subprocess.CalledProcessError:
            results["failed"] += 1
        
        # Small delay between videos
        if i < len(urls):
            time.sleep(2)
    
    print(f"\n{'='*60}")
    print("📊 BATCH SUMMARY")
    print(f"{'='*60}")
    print(f"✅ Successful: {results['success']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"📄 Total: {results['total']}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
