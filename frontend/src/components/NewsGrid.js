import React from 'react';
import { NewsCard } from './NewsCard';

export function NewsGrid({ articles, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-muted/60 animate-pulse rounded-2xl h-96" />
        ))}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-muted-foreground">No news articles found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {articles.map((article, index) => (
        <NewsCard key={index} article={article} index={index} />
      ))}
    </div>
  );
}