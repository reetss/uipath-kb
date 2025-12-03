#!/usr/bin/env python3
"""
Batch Video Transcription with yt-dlp + faster-whisper
Cross-platform compatible (Windows + macOS + Linux)

Processes all videos from video-list-clean.txt

Usage:
    python scripts/batch-transcribe.py [model-size]
    
Model sizes: tiny, base, small, medium, large-v2
Default: base
"""

import sys
import time
import subprocess
import logging
import platform
import shutil
from pathlib import Path
from datetime import datetime

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_DIR = SCRIPT_DIR.parent
VIDEOS_DIR = PROJECT_DIR / "knowledge" / "videos"
LOG_DIR = PROJECT_DIR / "logs"

LOG_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================================
# LOGGING SETUP
# ============================================================================

LOG_FILE = LOG_DIR / "batch-transcribe.log"

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

def find_python_executable() -> str:
    """Find the correct Python executable for the virtual environment"""
    
    # Check for .venv-whisper in project root
    venv_dir = PROJECT_DIR / ".venv-whisper"
    
    if platform.system() == "Windows":
        python_paths = [
            venv_dir / "Scripts" / "python.exe",
            venv_dir / "Scripts" / "python",
        ]
    else:
        python_paths = [
            venv_dir / "bin" / "python",
            venv_dir / "bin" / "python3",
        ]
    
    for path in python_paths:
        if path.exists():
            logger.debug(f"Found Python: {path}")
            return str(path)
    
    # Fallback to current Python
    logger.warning("Virtual environment not found, using system Python")
    return sys.executable

def read_video_list(file_path: Path) -> list[str]:
    """Read video URLs from file, skipping comments and empty lines"""
    urls = []
    
    if not file_path.exists():
        logger.error(f"Video list not found: {file_path}")
        return urls
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and 'youtube.com' in line:
                urls.append(line)
    
    return urls

# ============================================================================
# MAIN FUNCTION
# ============================================================================

def main():
    """Main entry point for batch transcription"""
    
    start_time = datetime.now()
    
    logger.info("🚀 Batch Video Transcription with faster-whisper")
    logger.info(f"📂 Project: {PROJECT_DIR}")
    logger.info(f"📝 Log file: {LOG_FILE}")
    logger.info(f"💻 System: {platform.system()} {platform.machine()}")
    
    # Parse arguments
    model_size = sys.argv[1] if len(sys.argv) > 1 else "base"
    video_list_file = VIDEOS_DIR / "video-list-clean.txt"
    transcribe_script = SCRIPT_DIR / "transcribe-video.py"
    
    logger.info(f"🎯 Model: {model_size}")
    logger.info(f"📄 Video list: {video_list_file}")
    
    # Find Python executable
    python_bin = find_python_executable()
    logger.info(f"🐍 Python: {python_bin}")
    
    # Read video URLs
    urls = read_video_list(video_list_file)
    
    if not urls:
        logger.error("❌ No videos found in video list")
        sys.exit(1)
    
    logger.info(f"📊 Found {len(urls)} videos to process\n")
    
    # Process videos
    results = {"success": 0, "failed": 0, "skipped": 0, "total": len(urls)}
    
    for i, url in enumerate(urls, 1):
        logger.info(f"\n{'='*60}")
        logger.info(f"[{i}/{len(urls)}] Processing video")
        
        video_start = time.time()
        
        try:
            # Run transcribe-video.py as subprocess
            result = subprocess.run(
                [python_bin, str(transcribe_script), url, model_size],
                capture_output=True,
                text=True,
                timeout=1800  # 30 minute timeout per video
            )
            
            if result.returncode == 0:
                results["success"] += 1
                duration = time.time() - video_start
                logger.info(f"✅ Completed in {duration:.1f}s")
            else:
                results["failed"] += 1
                logger.error(f"❌ Failed: {result.stderr}")
                
        except subprocess.TimeoutExpired:
            results["failed"] += 1
            logger.error("❌ Timeout (30 min exceeded)")
            
        except Exception as e:
            results["failed"] += 1
            logger.error(f"❌ Exception: {e}")
        
        # Small delay between videos to be nice to YouTube
        if i < len(urls):
            time.sleep(2)
    
    # Summary
    total_duration = (datetime.now() - start_time).total_seconds()
    
    logger.info(f"\n{'='*60}")
    logger.info("📊 BATCH SUMMARY")
    logger.info(f"{'='*60}")
    logger.info(f"✅ Successful: {results['success']}")
    logger.info(f"❌ Failed: {results['failed']}")
    logger.info(f"📄 Total: {results['total']}")
    logger.info(f"⏱️  Total time: {total_duration/60:.1f} minutes")
    logger.info(f"📝 Log file: {LOG_FILE}")
    logger.info(f"{'='*60}")
    
    # Exit code based on results
    if results["failed"] > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()
