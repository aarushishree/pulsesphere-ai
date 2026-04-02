import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThemeProvider } from './components/ThemeProvider';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryTabs } from './components/CategoryTabs';
import { NewsGrid } from './components/NewsGrid';
import { NewsFeed } from './components/NewsFeed';
import { InsightsDashboard } from './components/InsightsDashboard';
import { Clock } from 'lucide-react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

function AppContent() {
  const [articles, setArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]); // for insights (accumulates across fetches)
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchNews = async (category = null) => {
    setIsLoading(true);
    try {
      let url = `${API}/news`;
      if (category && category !== 'all') url += `?category=${category}`;
      const response = await axios.get(url);
      setArticles(response.data);
      setLastUpdated(new Date());
      // Merge into allArticles (deduplicate by url)
      setAllArticles(prev => {
        const urls = new Set(prev.map(a => a.url));
        const fresh = response.data.filter(a => !urls.has(a.url));
        return [...prev, ...fresh];
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      fetchNews(activeCategory === 'all' ? null : activeCategory);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/search?q=${encodeURIComponent(searchValue)}`);
      setArticles(response.data);
      setLastUpdated(new Date());
      setAllArticles(prev => {
        const urls = new Set(prev.map(a => a.url));
        const fresh = response.data.filter(a => !urls.has(a.url));
        return [...prev, ...fresh];
      });
    } catch (error) {
      console.error('Error searching news:', error);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSearchValue('');
    fetchNews(category === 'all' ? null : category);
  };

  useEffect(() => { fetchNews(); }, []);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
      />

      <main>
        <Hero />

        {/* ── Insights Dashboard ───────────────────────────── */}
        <div className="border-b border-border/40 pb-4 mb-4">
          <InsightsDashboard articles={allArticles.length > 0 ? allArticles : articles} />
        </div>

        {/* ── Card Grid ────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <CategoryTabs activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span data-testid="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>

          <NewsGrid articles={articles} isLoading={isLoading} />
        </div>

        {/* ── Live News Feed ────────────────────────────────── */}
        <div className="border-t border-border/40 pt-12">
          <NewsFeed />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="pulsesphere-theme">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
