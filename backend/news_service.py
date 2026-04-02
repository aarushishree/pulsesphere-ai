from typing import List, Optional
from pydantic import BaseModel
import os, requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")

class NewsArticle(BaseModel):
    title: str
    description: str
    source: str
    publishedAt: str
    url: str
    urlToImage: Optional[str] = None
    category: str

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY", "")
BASE_URL = "https://gnews.io/api/v4"

def _parse(articles, category="general"):
    return [
        NewsArticle(
            title=a["title"],
            description=a.get("description", "") or "",
            source=a["source"]["name"],
            publishedAt=a["publishedAt"],
            url=a["url"],
            urlToImage=a.get("image"),
            category=category,
        )
        for a in articles
    ]

def get_all_news() -> List[NewsArticle]:
    try:
        print(f"[news_service] Using API key: {GNEWS_API_KEY[:8]}...")
        r = requests.get(f"{BASE_URL}/top-headlines", params={
            "token": GNEWS_API_KEY, "lang": "en", "max": 10
        }, timeout=10)
        data = r.json()
        print(f"[news_service] Response status: {r.status_code}, articles: {len(data.get('articles', []))}")
        if "errors" in data:
            print(f"[news_service] API Error: {data['errors']}")
        return _parse(data.get("articles", []), "general")
    except Exception as e:
        print(f"[news_service] Error: {e}")
        return []

def get_news_by_category(category: str) -> List[NewsArticle]:
    try:
        topic_map = {
            "technology": "technology",
            "entertainment": "entertainment",
            "business": "business",
            "science": "science",
        }
        if category == "geopolitics":
            r = requests.get(f"{BASE_URL}/search", params={
                "token": GNEWS_API_KEY,
                "q": "geopolitics OR diplomacy OR war OR international relations",
                "lang": "en", "max": 10
            }, timeout=10)
        else:
            r = requests.get(f"{BASE_URL}/top-headlines", params={
                "token": GNEWS_API_KEY,
                "topic": topic_map.get(category, "general"),
                "lang": "en", "max": 10
            }, timeout=10)
        data = r.json()
        print(f"[news_service] {category}: {len(data.get('articles', []))} articles")
        return _parse(data.get("articles", []), category)
    except Exception as e:
        print(f"[news_service] Error fetching {category}: {e}")
        return []

def search_news(query: str) -> List[NewsArticle]:
    try:
        r = requests.get(f"{BASE_URL}/search", params={
            "token": GNEWS_API_KEY, "q": query, "lang": "en", "max": 10
        }, timeout=10)
        data = r.json()
        return _parse(data.get("articles", []), "search")
    except Exception as e:
        print(f"[news_service] Search error: {e}")
        return []
