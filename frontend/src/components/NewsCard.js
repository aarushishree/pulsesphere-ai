import React, { useState } from 'react';
import { ExternalLink, Clock, Sparkles, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

export function NewsCard({ article, index }) {
  const [summaryModal, setSummaryModal] = useState(false);
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const getTimeAgo = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const handleSummarize = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSummaryModal(true);
    if (summary) return; // already fetched
    setLoadingSummary(true);
    try {
      const text = `${article.title}. ${article.description}`;
      const res = await axios.post(`${API}/summarize`, { text, title: article.title });
      setSummary(res.data.summary || 'No summary available.');
    } catch {
      setSummary('Could not generate summary. Please try again.');
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        data-testid={`news-card-${index}`}
        className="h-full"
      >
        <div className="h-full bg-card rounded-2xl border border-border/50 shadow-[0_8px_30px_rgb(114,47,55,0.05)] dark:shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(114,47,55,0.08)] overflow-hidden flex flex-col">
          {article.urlToImage && (
            <div className="overflow-hidden rounded-t-2xl flex-shrink-0">
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                {article.category}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{getTimeAgo(article.publishedAt)}</span>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-heading font-semibold mb-3 text-foreground line-clamp-2">
              {article.title}
            </h3>

            <p className="text-base leading-relaxed text-muted-foreground mb-4 line-clamp-3 flex-1">
              {article.description}
            </p>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
              <span className="text-sm text-muted-foreground font-medium truncate mr-2">
                {article.source}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* AI Summary Button */}
                <button
                  onClick={handleSummarize}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200"
                  title="AI Summary"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Summarize</span>
                </button>
                {/* Read Full Article */}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors duration-200"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Read</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary Modal */}
      <AnimatePresence>
        {summaryModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSummaryModal(false)}
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
                </div>
                <button
                  onClick={() => setSummaryModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm font-medium text-primary mb-3 line-clamp-2">{article.title}</p>

              {loadingSummary ? (
                <div className="flex items-center gap-3 py-6 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm">Generating local AI summary…</span>
                </div>
              ) : (
                <p className="text-base leading-relaxed text-foreground bg-muted/50 rounded-xl p-4">
                  {summary}
                </p>
              )}

              <div className="mt-4 flex justify-end">
                <a
                  href={article.url}
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
    </>
  );
}
