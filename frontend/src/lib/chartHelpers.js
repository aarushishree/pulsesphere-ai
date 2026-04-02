/**
 * chartHelpers.js
 * Pure helper functions for data visualization
 * No side effects — just data transformation
 */

/**
 * Count articles per category from articles array
 * Returns array ready for recharts
 */
export function getCategoryDistribution(articles) {
  if (!articles || articles.length === 0) return [];

  const counts = {};
  articles.forEach((article) => {
    const cat = article.category
      ? article.category.charAt(0).toUpperCase() + article.category.slice(1)
      : 'General';
    counts[cat] = (counts[cat] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Group articles by time bucket (hour or day)
 * Returns array ready for recharts LineChart
 */
export function getNewsTrend(articles, groupBy = 'hour') {
  if (!articles || articles.length === 0) return [];

  const buckets = {};

  articles.forEach((article) => {
    if (!article.publishedAt) return;
    const date = new Date(article.publishedAt);
    if (isNaN(date.getTime())) return;

    let key;
    if (groupBy === 'hour') {
      key = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
    } else {
      key = `${date.getMonth() + 1}/${date.getDate()}`;
    }
    buckets[key] = (buckets[key] || 0) + 1;
  });

  // Sort chronologically
  return Object.entries(buckets)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => {
      // Simple lexicographic sort works for our MM/DD format
      return a.time.localeCompare(b.time);
    });
}

/**
 * Pick a color for a given category (wine palette)
 */
export const CATEGORY_COLORS = {
  Geopolitics:   '#722f37',
  Technology:    '#a05060',
  Entertainment: '#c27a85',
  Business:      '#8b3a45',
  Science:       '#d4a0a8',
  General:       '#e8c5cb',
  Search:        '#f0dde0',
};

export function getCategoryColor(name, index) {
  if (CATEGORY_COLORS[name]) return CATEGORY_COLORS[name];
  // Fallback gradient from wine to light
  const palette = Object.values(CATEGORY_COLORS);
  return palette[index % palette.length];
}


/**
 * Get source relevance scores for horizontal bar chart
 * Score = cosine-distance proxy: articles from less-frequent sources
 * that appear in searches are "more relevant" (lower distance = more relevant)
 * We normalise article count per source to a 0–1 relevance score.
 */
export function getSourceRelevanceScores(articles) {
  if (!articles || articles.length === 0) return [];

  // Count articles per source
  const counts = {};
  articles.forEach((a) => {
    const src = a.source || 'Unknown';
    counts[src] = (counts[src] || 0) + 1;
  });

  const max = Math.max(...Object.values(counts));

  // Normalize: sources with FEWER articles get a LOWER score (= more relevant)
  // This mirrors the cosine distance behaviour shown in the screenshot
  return Object.entries(counts)
    .map(([source, count]) => ({
      source,
      score: parseFloat((count / max).toFixed(2)),
      count,
    }))
    .sort((a, b) => b.score - a.score) // highest score at top
    .slice(0, 10); // cap at 10 sources
}
