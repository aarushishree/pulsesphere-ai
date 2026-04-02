"""
ai_service.py — Local summarization + ChromaDB vector store
============================================================
Summarizer : sumy (pure Python, no model download needed) with
             transformers/BART as optional upgrade
Vector DB  : ChromaDB + TF-IDF embeddings (no sentence-transformers needed)
             upgrades automatically to sentence-transformers if installed
"""

import os, re, math, logging, hashlib
from typing import List, Optional
from collections import Counter

logger = logging.getLogger(__name__)

# ── ChromaDB (lazy init) ─────────────────────────────────────
_chroma_client = None
_chroma_collection = None

def _get_chroma():
    global _chroma_client, _chroma_collection
    if _chroma_client is not None:
        return _chroma_client, _chroma_collection
    try:
        import chromadb

        db_path = os.path.join(os.path.dirname(__file__), "chroma_db")
        os.makedirs(db_path, exist_ok=True)

        try:
            _chroma_client = chromadb.PersistentClient(path=db_path)
        except Exception:
            _chroma_client = chromadb.Client()

        # Try sentence-transformers first, fall back to default
        try:
            from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
            ef = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
            logger.info("Using sentence-transformers embeddings")
        except Exception:
            ef = None  # ChromaDB default (works out of the box)
            logger.info("Using ChromaDB default embeddings")

        kwargs = {"name": "news_articles", "metadata": {"hnsw:space": "cosine"}}
        if ef:
            kwargs["embedding_function"] = ef

        _chroma_collection = _chroma_client.get_or_create_collection(**kwargs)
        logger.info(f"ChromaDB ready — {_chroma_collection.count()} articles indexed")
    except Exception as e:
        logger.error(f"ChromaDB init failed: {e}")
        _chroma_client = "unavailable"
        _chroma_collection = None
    return _chroma_client, _chroma_collection


# ── Extractive summarizer (pure Python, zero downloads) ──────
STOPWORDS = {
    "the","a","an","is","are","was","were","in","on","at","to","of","and",
    "or","but","it","its","this","that","with","for","by","as","from","be",
    "been","have","has","had","will","would","could","should","may","might",
    "also","said","says","new","one","two","more","than","about","after",
    "before","when","where","which","who","how","what","there","their","they",
    "he","she","we","you","i","his","her","our","your","its","been","do",
}

def _extractive_summary(text: str, num_sentences: int = 3) -> str:
    """TF-IDF-style extractive summarization — always works, no downloads."""
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    if len(sentences) <= num_sentences:
        return " ".join(sentences)

    # Word frequencies
    all_words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    word_freq = Counter(w for w in all_words if w not in STOPWORDS)
    total = sum(word_freq.values()) or 1

    # Score each sentence by avg word importance
    scores = []
    for sent in sentences:
        words = re.findall(r'\b[a-z]{3,}\b', sent.lower())
        content = [w for w in words if w not in STOPWORDS]
        if not content:
            scores.append(0)
            continue
        score = sum(word_freq[w] / total for w in content) / len(content)
        # Slightly boost first sentence (usually most informative in news)
        scores.append(score)

    scores[0] *= 1.3  # news lede bonus

    # Pick top sentences, keep original order
    top_idx = sorted(
        sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:num_sentences]
    )
    return " ".join(sentences[i] for i in top_idx)


# ── BART (optional upgrade — only if transformers installed) ──
_bart = None

def _get_bart():
    global _bart
    if _bart is not None:
        return _bart
    try:
        from transformers import pipeline
        logger.info("Loading BART summarizer (first run — may take a moment)…")
        _bart = pipeline("summarization", model="facebook/bart-large-cnn",
                         device=-1, truncation=True)
        logger.info("BART ready ✓")
    except Exception as e:
        logger.warning(f"BART not available ({e}), using extractive fallback")
        _bart = "unavailable"
    return _bart


# ── Public API ───────────────────────────────────────────────

def summarize_text(text: str) -> str:
    """
    Summarize news text.
    Uses BART if transformers is installed, otherwise extractive summary.
    """
    if not text or len(text.strip()) < 50:
        return text.strip()

    bart = _get_bart()
    if bart != "unavailable":
        try:
            result = bart(text[:1024], max_length=100, min_length=30, do_sample=False)
            return result[0]["summary_text"]
        except Exception as e:
            logger.error(f"BART error: {e}")

    return _extractive_summary(text, num_sentences=3)


def add_to_vector_db(article_id: str, text: str, metadata: Optional[dict] = None) -> bool:
    client, collection = _get_chroma()
    if client == "unavailable" or collection is None:
        return False
    try:
        # Clean metadata — ChromaDB requires all values to be str/int/float/bool
        clean_meta = {}
        for k, v in (metadata or {}).items():
            clean_meta[k] = str(v) if v is not None else ""
        collection.upsert(ids=[article_id], documents=[text], metadatas=[clean_meta])
        return True
    except Exception as e:
        logger.error(f"Vector DB upsert error: {e}")
        return False


def search_similar(query: str, n_results: int = 5) -> List[dict]:
    client, collection = _get_chroma()
    if client == "unavailable" or collection is None:
        return []
    try:
        count = collection.count()
        if count == 0:
            return []
        results = collection.query(
            query_texts=[query],
            n_results=min(n_results, count),
        )
        output = []
        for doc, meta, dist in zip(
            results.get("documents", [[]])[0],
            results.get("metadatas", [[]])[0],
            results.get("distances", [[]])[0],
        ):
            output.append({"text": doc, "metadata": meta, "distance": round(dist, 4)})
        return output
    except Exception as e:
        logger.error(f"Vector DB search error: {e}")
        return []


def get_vector_db_count() -> int:
    client, collection = _get_chroma()
    if client == "unavailable" or collection is None:
        return 0
    try:
        return collection.count()
    except Exception:
        return 0
