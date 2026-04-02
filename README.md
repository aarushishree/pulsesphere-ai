# PulseSphere AI — Local LLM Edition

## What changed
| Area | Before | After |
|---|---|---|
| Summarization | OpenRouter API (Mistral 7B cloud) | **Local BART** (`facebook/bart-large-cnn`) — no API key |
| Embeddings | Simple hash-based numpy vectors | **sentence-transformers** `all-MiniLM-L6-v2` |
| Vector DB | In-memory numpy array | **ChromaDB** (persistent on disk at `./chroma_db`) |
| New endpoint | — | `GET /api/semantic-search?q=...` |
| New endpoint | — | `GET /api/vector-db/stats` |
| Frontend | Card grid only | Card grid **+** Live News Feed section |
| Summarize UX | — | "Summarize" button on every card + feed item → modal |

---

## Backend setup

```bash
cd backend

# 1. Create .env
cp .env.example .env          # add your GNEWS_API_KEY

# 2. Install deps
pip install -r requirements.txt

# CPU-only PyTorch (saves ~2 GB):
pip install torch --index-url https://download.pytorch.org/whl/cpu

# 3. Run
uvicorn server:app --reload --port 8000
```

> **First summarize request**: BART (~1.6 GB) downloads automatically to `~/.cache/huggingface/`.
> Subsequent requests are instant.  
> If BART is unavailable (low RAM), the service falls back to extractive summarization automatically.

---

## Frontend setup

```bash
cd frontend
npm install
REACT_APP_BACKEND_URL=http://localhost:8000 npm start
```

---

## New UI sections

### Live News Feed
- Scrollable list of latest headlines at the bottom of the page
- Shows thumbnail, category badge, source, time-ago
- Hover any article → **Summarize** button appears
- Click **Summarize** → AI summary modal (runs local BART)
- Auto-refreshes every 5 minutes
- Badge shows how many articles are indexed in ChromaDB

### Summarize on Cards
- Every card in the grid also has a **Summarize** button
- Same modal experience — title, summary, link to full article

---

## Architecture

```
Browser
  │
  ├─ GET /api/news          → news_service.py (GNews API)
  │                           ↳ background: ChromaDB.upsert(articles)
  │
  ├─ GET /api/search        → news_service.py (GNews search)
  │                           ↳ background: ChromaDB.upsert(results)
  │
  ├─ POST /api/summarize    → ai_service.summarize_text()
  │                           ↳ BART (local) → extractive fallback
  │
  ├─ GET /api/semantic-search?q=… → ChromaDB.query()
  │
  └─ GET /api/vector-db/stats    → ChromaDB.count()
```
## Data Visualization
Uses recharts for charts
## Deployment
