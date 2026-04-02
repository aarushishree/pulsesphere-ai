import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { CategoryChart } from './CategoryChart';
import { TrendChart } from './TrendChart';
import { SourceRelevanceChart } from './SourceRelevanceChart';
import { getCategoryDistribution } from '../lib/chartHelpers';

function StatBadge({ label, value, color }) {
  return (
    <div className="flex flex-col items-center justify-center bg-muted/60 rounded-2xl px-5 py-4 min-w-[90px]">
      <span className="text-2xl font-heading font-bold" style={{ color }}>
        {value}
      </span>
      <span className="text-xs text-muted-foreground mt-0.5 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

export function InsightsDashboard({ articles }) {
  const [expanded, setExpanded] = useState(true);

  const distribution = getCategoryDistribution(articles);
  const topCategory = distribution[0]?.name || '—';
  const totalArticles = articles?.length || 0;
  const uniqueCategories = distribution.length;
  const uniqueSources = new Set(articles?.map(a => a.source)).size;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

      {/* Header — click to collapse */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between mb-6 group"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
            <BarChart2 className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-heading font-bold text-foreground">
              News Insights
            </h2>
            <p className="text-sm text-muted-foreground">
              Real-time analytics from fetched articles
            </p>
          </div>
        </div>
        <span className="text-muted-foreground group-hover:text-foreground transition-colors">
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </span>
      </button>

      {/* Collapsible body */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
      >
        {/* Stats row */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center sm:justify-start">
          <StatBadge label="Total Articles" value={totalArticles} color="#722f37" />
          <StatBadge label="Categories"     value={uniqueCategories} color="#a05060" />
          <StatBadge label="Sources"        value={uniqueSources}    color="#c27a85" />
          <StatBadge label="Top Category"   value={topCategory}      color="#8b3a45" />
        </div>

        {/* Row 1 — Category pie + Trend area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="h-4 w-4 text-primary" />
              <h3 className="font-heading font-semibold text-foreground">
                News Distribution by Category
              </h3>
            </div>
            <CategoryChart articles={articles} />
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="font-heading font-semibold text-foreground">
                News Trend Over Time
              </h3>
            </div>
            <TrendChart articles={articles} />
          </div>

        </div>

        {/* Row 2 — Source Relevance full-width */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="font-heading font-semibold text-foreground">
              Source Relevance Scores
            </h3>
            <span className="ml-auto text-xs text-muted-foreground">
              lower score = more relevant
            </span>
          </div>
          <SourceRelevanceChart articles={articles} />
        </div>

      </motion.div>
    </section>
  );
}
// Insights dashboard with all charts
