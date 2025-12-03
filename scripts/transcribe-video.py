#!/usr/bin/env python3
"""
Video Transcription with yt-dlp + faster-whisper
Cross-platform compatible (Windows + macOS + Linux)

Usage:
    python scripts/transcribe-video.py <youtube-url> [model-size]
    
Model sizes: tiny, base, small, medium, large-v2
Default: base (good balance of speed/quality)
"""

import os
import sys
import subprocess
import json
import logging
import platform
from pathlib import Path
from datetime import datetime

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_DIR = SCRIPT_DIR.parent
VIDEOS_DIR = PROJECT_DIR / "knowledge" / "videos"
AUDIO_DIR = VIDEOS_DIR / "audio"
LOG_DIR = PROJECT_DIR / "logs"

# Create directories
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================================
# LOGGING SETUP
# ============================================================================

LOG_FILE = LOG_DIR / "transcribe-video.log"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE, encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_system_info() -> dict:
    """Get current system information for cross-platform compatibility"""
    return {
        "os": platform.system(),
        "os_version": platform.version(),
        "python_version": platform.python_version(),
        "architecture": platform.machine()
    }

def check_dependencies() -> bool:
    """Check if required dependencies are installed"""
    issues = []
    
    # Check yt-dlp
    try:
        result = subprocess.run(
            ["yt-dlp", "--version"], 
            capture_output=True, 
            text=True
        )
        logger.debug(f"yt-dlp version: {result.stdout.strip()}")
    except FileNotFoundError:
        issues.append("yt-dlp not found. Install with: brew install yt-dlp (macOS) or pip install yt-dlp")
    
    # Check faster-whisper
    try:
        from faster_whisper import WhisperModel
        logger.debug("faster-whisper is available")
    except ImportError:
        issues.append("faster-whisper not found. Install with: pip install faster-whisper")
    
    if issues:
        for issue in issues:
            logger.error(f"❌ Dependency issue: {issue}")
        return False
    
    return True

def extract_video_id(url: str) -> str | None:
    """Extract video ID from YouTube URL"""
    if "v=" in url:
        return url.split("v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    return None

# ============================================================================
# CORE FUNCTIONS
# ============================================================================

def download_audio(url: str, video_id: str) -> Path | None:
    """Download audio from YouTube video using yt-dlp"""
    audio_file = AUDIO_DIR / f"{video_id}.mp3"
    
    if audio_file.exists():
        logger.info(f"⏭️  Audio already exists: {audio_file.name}")
        return audio_file
    
    logger.info(f"📥 Downloading audio for {video_id}...")
    
    # Use yt-dlp with cross-platform compatible arguments
    cmd = [
        "yt-dlp",
        "-x",  # Extract audio
        "--audio-format", "mp3",
        "--audio-quality", "0",  # Best quality
        "-o", str(audio_file),
        url
    ]
    
    try:
        result = subprocess.run(
            cmd, 
            check=True, 
            capture_output=True, 
            text=True
        )
        logger.info(f"✅ Downloaded: {audio_file.name}")
        logger.debug(f"yt-dlp output: {result.stdout}")
        return audio_file
        
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Download failed: {e.stderr}")
        return None

def transcribe_audio(audio_file: Path, video_id: str, model_size: str = "base") -> Path | None:
    """Transcribe audio using faster-whisper"""
    from faster_whisper import WhisperModel
    
    transcript_file = VIDEOS_DIR / f"{video_id}-transcript-whisper.txt"
    
    if transcript_file.exists():
        logger.info(f"⏭️  Transcript already exists: {transcript_file.name}")
        return transcript_file
    
    logger.info(f"🎯 Transcribing with faster-whisper ({model_size})...")
    
    try:
        # Load model - compute_type depends on platform
        compute_type = "int8"
        if platform.system() == "Darwin" and platform.machine() == "arm64":
            # Apple Silicon - can use int8 or float16
            compute_type = "int8"
        
        logger.debug(f"Loading model: {model_size}, compute_type: {compute_type}")
        model = WhisperModel(model_size, device="cpu", compute_type=compute_type)
        
        # Transcribe
        segments, info = model.transcribe(str(audio_file), beam_size=5)
        
        logger.info(f"🌍 Detected language: {info.language} ({info.language_probability:.2%})")
        
        # Collect transcript
        transcript_lines = []
        for segment in segments:
            transcript_lines.append(segment.text.strip())
        
        transcript = "\n".join(transcript_lines)
        
        # Save transcript
        transcript_file.write_text(transcript, encoding="utf-8")
        
        size_kb = transcript_file.stat().st_size / 1024
        logger.info(f"✅ Transcript saved: {transcript_file.name} ({size_kb:.1f} KB)")
        
        return transcript_file
        
    except Exception as e:
        logger.error(f"❌ Transcription failed: {e}")
        return None

def process_video(url: str, model_size: str = "base") -> bool:
    """Process a single video: download + transcribe"""
    video_id = extract_video_id(url)
    
    if not video_id:
        logger.error(f"❌ Invalid YouTube URL: {url}")
        return False
    
    logger.info(f"\n{'='*60}")
    logger.info(f"📹 Processing: {video_id}")
    logger.info(f"🔗 URL: {url}")
    logger.info(f"{'='*60}")
    
    start_time = datetime.now()
    
    # Step 1: Download audio
    audio_file = download_audio(url, video_id)
    if not audio_file:
        return False
    
    # Step 2: Transcribe
    transcript_file = transcribe_audio(audio_file, video_id, model_size)
    if not transcript_file:
        return False
    
    duration = (datetime.now() - start_time).total_seconds()
    logger.info(f"⏱️  Total duration: {duration:.1f}s")
    
    return True

# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main entry point"""
    logger.info("🚀 Video Transcription with faster-whisper")
    logger.info(f"📂 Output: {VIDEOS_DIR}")
    logger.info(f"📝 Log file: {LOG_FILE}")
    
    # Log system info
    sys_info = get_system_info()
    logger.info(f"💻 System: {sys_info['os']} {sys_info['architecture']}")
    logger.debug(f"Full system info: {sys_info}")
    
    # Check arguments
    if len(sys.argv) < 2:
        print("\nUsage: python transcribe-video.py <video-url> [model-size]")
        print("\nModel sizes: tiny, base, small, medium, large-v2")
        print("Default: base (good balance of speed/quality)")
        print(f"\nLog file: {LOG_FILE}")
        sys.exit(1)
    
    url = sys.argv[1]
    model_size = sys.argv[2] if len(sys.argv) > 2 else "base"
    
    logger.info(f"🎯 Model: {model_size}")
    
    # Check dependencies
    if not check_dependencies():
        logger.error("❌ Missing dependencies. See log for details.")
        sys.exit(1)
    
    # Process video
    success = process_video(url, model_size)
    
    if success:
        logger.info("\n✅ Transcription complete!")
    else:
        logger.error("\n❌ Transcription failed. Check log for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()
