#!/bin/bash
# Automated Reddit Monitoring Scheduler
# Runs daily Reddit scraping and analysis

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/reddit-monitor-$(date +%Y%m%d).log"

# Create log directory
mkdir -p "$LOG_DIR"

echo "=====================================" >> "$LOG_FILE"
echo "Reddit Monitor Run: $(date)" >> "$LOG_FILE"
echo "=====================================" >> "$LOG_FILE"

# Run monitor
python3 "$SCRIPT_DIR/monitor-reddit.py" >> "$LOG_FILE" 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Success" >> "$LOG_FILE"
else
    echo "❌ Failed with exit code $EXIT_CODE" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"

# Keep only last 30 days of logs
find "$LOG_DIR" -name "reddit-monitor-*.log" -mtime +30 -delete

exit $EXIT_CODE
