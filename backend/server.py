from fastapi import FastAPI, APIRouter, Query, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os, logging, hashlib
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel

from news_service import NewsArticle, get_all_news, get_news_by_category, search_news
from ai_service import summarize_text, add_to_vector_db, search_similar, get_vector_db_count

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="PulseSphere AI")
api_router = APIRouter(prefix="/api")

# ── Request models ───────────────────────────────────────────
class SummaryRequest(BaseModel):
    text: str
    title: Optional[str] = ""

class IndexRequest(BaseModel):
    articles: List[dict]

# ── Helper ───────────────────────────────────────────────────
def _article_id(url: str) -> str:
    return hashlib.md5(url.encode()).hexdigest()

def _index_articles(articles: List[NewsArticle]):
    """Background task: embed + store articles in ChromaDB."""
    for a in articles:
        text = f"{a.title}. {a.description}"
        meta = {
            "title": a.title,
            "source": a.source,
            "category": a.category,
            "publishedAt": a.publishedAt,
            "url": a.url,
            "urlToImage": a.urlToImage or "",
        }
        add_to_vector_db(_article_id(a.url), text, meta)

# ── Root ─────────────────────────────────────────────────────
@api_router.get("/")
async def root():
    return {"message": "PulseSphere AI — Local LLM Edition"}

# ── News (+ auto-index into vector DB) ───────────────────────
@api_router.get("/news", response_model=List[NewsArticle])
async def get_news(
    background_tasks: BackgroundTasks,
    category: Optional[str] = Query(None),
):
    if category:
        articles = get_news_by_category(category)
    else:
        articles = get_all_news()[:10]
    background_tasks.add_task(_index_articles, articles)
    return articles

# ── Search ───────────────────────────────────────────────────
@api_router.get("/search", response_model=List[NewsArticle])
async def search_news_endpoint(
    background_tasks: BackgroundTasks,
    q: str = Query(...),
):
    articles = search_news(q)
    background_tasks.add_task(_index_articles, articles)
    return articles

# ── Semantic search via vector DB ───────────────────────────
@api_router.get("/semantic-search")
async def semantic_search(q: str = Query(...), n: int = Query(5)):
    results = search_similar(q, n_results=n)
    return {"query": q, "results": results, "count": len(results)}

# ── Summarize (local BART / extractive fallback) ─────────────
@api_router.post("/summarize")
async def summarize(request: SummaryRequest):
    text = request.text.strip()
    if not text:
        return {"error": "Text cannot be empty"}
    summary = summarize_text(text)
    return {"summary": summary, "engine": "local-bart"}

# ── Vector DB stats ──────────────────────────────────────────
@api_router.get("/vector-db/stats")
async def vector_db_stats():
    return {"indexed_articles": get_vector_db_count()}

# ── Include router ───────────────────────────────────────────
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
# FastAPI backend with vector DB endpoints
