#!/usr/bin/env python3
"""
Reddit UIPath Scraper - Extracts common problems, questions, and discussions
"""

import json
import sys
from pathlib import Path
from datetime import datetime

def extract_reddit_insights(html_content):
    """Extract key insights from Reddit HTML"""
    
    # This would parse the HTML content
    # For now, return structure based on what we see
    
    insights = {
        "timestamp": datetime.now().isoformat(),
        "source": "r/UiPath",
        "categories": {
            "common_problems": [
                {
                    "title": "API Call Management",
                    "problem": "Multiple HTTP requests (10+) with try-catch blocks are hard to read and maintain",
                    "sentiment": "Frustration with RPA approach vs traditional SWE",
                    "votes": 3,
                    "comments": 4
                },
                {
                    "title": "AS400 Legacy Integration",
                    "problem": "Need to integrate AS400 inventory data with modern CRM systems",
                    "question": "Developer needed or Business Analyst capable?",
                    "votes": 4,
                    "comments": 9
                }
            ],
            "certifications": [
                {
                    "title": "Agentic Automation Associate Certification",
                    "question": "Study resources beyond UiPath Academy",
                    "votes": 5,
                    "comments": 8
                }
            ],
            "best_practices": [],
            "tools_and_features": []
        },
        "trending_topics": [
            "API integration challenges",
            "Legacy system automation (AS400)",
            "Certification preparation",
            "Code readability and maintainability"
        ]
    }
    
    return insights

def save_insights(insights, output_dir):
    """Save insights to JSON and Markdown"""
    
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save JSON
    json_file = output_dir / "reddit-insights.json"
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(insights, f, indent=2, ensure_ascii=False)
    
    # Save Markdown
    md_file = output_dir / "reddit-insights.md"
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write(f"# r/UiPath Community Insights\n\n")
        f.write(f"**Last Updated:** {insights['timestamp']}\n\n")
        
        f.write("## Common Problems\n\n")
        for problem in insights['categories']['common_problems']:
            f.write(f"### {problem['title']}\n")
            f.write(f"**Problem:** {problem['problem']}\n\n")
            if 'question' in problem:
                f.write(f"**Question:** {problem['question']}\n\n")
            if 'sentiment' in problem:
                f.write(f"**Sentiment:** {problem['sentiment']}\n\n")
            f.write(f"👍 {problem['votes']} | 💬 {problem['comments']}\n\n")
        
        f.write("## Certifications\n\n")
        for cert in insights['categories']['certifications']:
            f.write(f"### {cert['title']}\n")
            f.write(f"**Question:** {cert['question']}\n\n")
            f.write(f"👍 {cert['votes']} | 💬 {cert['comments']}\n\n")
        
        f.write("## Trending Topics\n\n")
        for topic in insights['trending_topics']:
            f.write(f"- {topic}\n")
    
    print(f"✅ Insights saved to:")
    print(f"   📄 {json_file}")
    print(f"   📄 {md_file}")

def main():
    output_dir = Path(__file__).parent.parent / "knowledge" / "reddit"
    
    print("🔍 Reddit UIPath Community Scraper")
    print(f"📂 Output: {output_dir}\n")
    
    # Simulated insights based on the scraped content
    insights = extract_reddit_insights("")
    
    save_insights(insights, output_dir)
    
    print("\n✅ Done!")

if __name__ == "__main__":
    main()
