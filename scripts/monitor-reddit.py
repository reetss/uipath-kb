#!/usr/bin/env python3
"""
Automated Reddit UIPath Monitor
Scrapes r/UiPath for common problems, solutions, and trends
"""

import json
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

def scrape_reddit_posts():
    """Scrape r/UiPath using fetch_webpage tool"""
    # This would use the fetch_webpage tool in practice
    # For now, returns structured data based on recent scrape
    
    posts = [
        {
            "title": "Dealing w API calls",
            "author": "PureMud8950",
            "problem": "10+ HTTP requests with try-catch blocks are unreadable",
            "tags": ["api", "http", "readability", "best-practices"],
            "upvotes": 3,
            "comments": 4,
            "category": "common_problems",
            "sentiment": "frustrated"
        },
        {
            "title": "On As400 and want to tie in inventory data to crm's",
            "author": "Amazing_rocness",
            "problem": "AS400 legacy system integration with modern CRMs for real-time inventory",
            "question": "Developer needed or Business Analyst capable?",
            "tags": ["as400", "legacy", "crm", "integration"],
            "upvotes": 4,
            "comments": 9,
            "category": "integration"
        },
        {
            "title": "Agentic Automation Associate Certification",
            "author": "RT_04",
            "question": "Study resources beyond UiPath Academy needed",
            "tags": ["certification", "learning", "agentic-automation"],
            "upvotes": 5,
            "comments": 8,
            "category": "certification"
        }
    ]
    
    return posts

def categorize_posts(posts):
    """Categorize posts into meaningful groups"""
    categories = defaultdict(list)
    
    for post in posts:
        cat = post.get("category", "other")
        categories[cat].append(post)
    
    return dict(categories)

def extract_trends(posts):
    """Extract trending topics from posts"""
    tag_count = defaultdict(int)
    
    for post in posts:
        for tag in post.get("tags", []):
            tag_count[tag] += 1
    
    # Sort by frequency
    sorted_tags = sorted(tag_count.items(), key=lambda x: x[1], reverse=True)
    
    return [tag for tag, count in sorted_tags[:10]]

def generate_insights(posts):
    """Generate structured insights from posts"""
    
    categories = categorize_posts(posts)
    trends = extract_trends(posts)
    
    insights = {
        "metadata": {
            "timestamp": datetime.now().isoformat(),
            "source": "r/UiPath",
            "posts_analyzed": len(posts)
        },
        "categories": {},
        "trending_topics": trends,
        "summary": {
            "top_problems": [],
            "most_discussed": [],
            "quick_wins": []
        }
    }
    
    # Convert categorized posts
    for cat, cat_posts in categories.items():
        insights["categories"][cat] = cat_posts
    
    # Find top problems (by upvotes + comments)
    scored_posts = sorted(
        [p for p in posts if "problem" in p],
        key=lambda x: x.get("upvotes", 0) + x.get("comments", 0),
        reverse=True
    )
    insights["summary"]["top_problems"] = scored_posts[:5]
    
    # Most discussed (by comments)
    discussed = sorted(posts, key=lambda x: x.get("comments", 0), reverse=True)
    insights["summary"]["most_discussed"] = discussed[:3]
    
    return insights

def generate_markdown_report(insights, output_file):
    """Generate comprehensive Markdown report"""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# r/UiPath Community Monitoring Report\n\n")
        f.write(f"**Generated:** {insights['metadata']['timestamp']}\n")
        f.write(f"**Posts Analyzed:** {insights['metadata']['posts_analyzed']}\n\n")
        
        f.write("---\n\n")
        
        # Top Problems
        f.write("## 🔴 Top Problems & Pain Points\n\n")
        for i, post in enumerate(insights['summary']['top_problems'], 1):
            f.write(f"### {i}. {post['title']}\n")
            if 'problem' in post:
                f.write(f"**Problem:** {post['problem']}\n\n")
            if 'question' in post:
                f.write(f"**Question:** {post['question']}\n\n")
            f.write(f"**Tags:** {', '.join(post.get('tags', []))}\n")
            f.write(f"**Engagement:** 👍 {post.get('upvotes', 0)} | 💬 {post.get('comments', 0)}\n\n")
        
        # Most Discussed
        f.write("## 💬 Most Discussed Topics\n\n")
        for post in insights['summary']['most_discussed']:
            f.write(f"- **{post['title']}** ({post.get('comments', 0)} comments)\n")
        f.write("\n")
        
        # Trending Topics
        f.write("## 📈 Trending Topics\n\n")
        for tag in insights['trending_topics']:
            f.write(f"- `{tag}`\n")
        f.write("\n")
        
        # Categories
        f.write("## 📂 By Category\n\n")
        for cat, posts in insights['categories'].items():
            f.write(f"### {cat.replace('_', ' ').title()} ({len(posts)})\n\n")
            for post in posts:
                f.write(f"- **{post['title']}** by u/{post.get('author', 'unknown')}\n")
            f.write("\n")
        
        # Recommendations
        f.write("## 💡 Recommendations for Knowledge Base\n\n")
        f.write("Based on community discussions, consider adding:\n\n")
        
        for i, post in enumerate(insights['summary']['top_problems'][:3], 1):
            f.write(f"{i}. **{post['title']}**\n")
            if 'problem' in post:
                f.write(f"   - Document best practices for: {', '.join(post.get('tags', []))}\n")
            f.write("\n")

def generate_json_export(insights, output_file):
    """Export insights as JSON for programmatic access"""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(insights, f, indent=2, ensure_ascii=False)

def main():
    output_dir = Path(__file__).parent.parent / "knowledge" / "reddit"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("🔍 Reddit UIPath Community Monitor")
    print("=" * 60)
    
    # Scrape posts
    print("\n📥 Scraping r/UiPath...")
    posts = scrape_reddit_posts()
    print(f"✅ Found {len(posts)} posts")
    
    # Generate insights
    print("\n🧠 Analyzing community insights...")
    insights = generate_insights(posts)
    
    # Save reports
    md_file = output_dir / "community-insights.md"
    json_file = output_dir / "community-insights.json"
    
    print("\n📝 Generating reports...")
    generate_markdown_report(insights, md_file)
    generate_json_export(insights, json_file)
    
    print("\n✅ Reports generated:")
    print(f"   📄 {md_file}")
    print(f"   📄 {json_file}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print(f"Posts analyzed: {len(posts)}")
    print(f"Top problems: {len(insights['summary']['top_problems'])}")
    print(f"Trending topics: {len(insights['trending_topics'])}")
    print(f"Categories: {len(insights['categories'])}")
    print("=" * 60)

if __name__ == "__main__":
    main()
