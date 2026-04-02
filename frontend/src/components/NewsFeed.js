import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Rss, ExternalLink, Clock, Sparkles, X, Loader2, Database } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

function FeedItem({ article, onSummarize }) {
  const getTimeAgo = (ts) => {
    try { return formatDistanceToNow(new Date(ts), { addSuffix: true }); }
    catch { return 'Recently'; }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-4 p-4 rounded-xl hover:bg-muted/60 transition-colors duration-200 group"
    >
      {article.urlToImage && (
        <img
          src={article.urlToImage}
          alt=""
          className="w-20 h-16 rounded-lg object-cover flex-shrink-0"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize font-medium">
            {article.category}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {getTimeAgo(article.publishedAt)}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-foreground line-clamp-2 mb-1 leading-snug">
          {article.title}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{article.description}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{article.source}</span>
          <div className="ml-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onSummarize(article)}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              Summarize
            </button>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-accent text-muted-foreground transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Read
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function NewsFeed() {
  const [feedArticles, setFeedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dbCount, setDbCount] = useState(0);

  // Summary modal state
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  const fetchFeed = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [newsRes, statsRes] = await Promise.all([
        axios.get(`${API}/news`),
        axios.get(`${API}/vector-db/stats`).catch(() => ({ data: { indexed_articles: 0 } })),
      ]);
      setFeedArticles(newsRes.data);
      setDbCount(statsRes.data.indexed_articles);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const timer = setInterval(() => fetchFeed(true), 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [fetchFeed]);

  const handleSummarize = async (article) => {
    setSelectedArticle(article);
    setSummary('');
    setSummaryLoading(true);
    try {
      const text = `${article.title}. ${article.description}`;
      const res = await axios.post(`${API}/summarize`, { text });
      setSummary(res.data.summary || 'No summary available.');
    } catch {
      setSummary('Could not generate summary. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary">
            <Rss className="h-5 w-5" />
            <h2 className="text-2xl font-heading font-bold text-foreground">Live News Feed</h2>
          </div>
          {dbCount > 0 && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
              <Database className="h-3 w-3" />
              {dbCount} articles indexed
            </span>
          )}
        </div>
        <button
          onClick={() => fetchFeed(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Feed list */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="divide-y divide-border/30">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4">
                <div className="w-20 h-16 rounded-lg bg-muted animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : feedArticles.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Rss className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No articles in the feed yet. Check your GNEWS_API_KEY.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {feedArticles.map((article, i) => (
              <FeedItem key={i} article={article} onSummarize={handleSummarize} />
            ))}
          </div>
        )}
      </div>

      {/* Summary modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedArticle(null)}
            />
            <motion.div
              className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full p-6 z-10"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h4 className="font-heading font-semibold text-foreground text-lg">AI Summary</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">Local LLM</span>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm font-medium text-primary mb-3 line-clamp-2">
                {selectedArticle.title}
              </p>

              {summaryLoading ? (
                <div className="flex items-center gap-3 py-6 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm">Running local BART model…</span>
                </div>
              ) : (
                <p className="text-base leading-relaxed text-foreground bg-muted/50 rounded-xl p-4">
                  {summary}
                </p>
              )}

              <div className="mt-4 flex justify-end">
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Read Full Article
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
// Live news feed with summarization
