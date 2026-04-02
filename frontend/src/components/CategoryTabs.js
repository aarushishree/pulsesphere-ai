import React from 'react';

const categories = [
  { id: 'all', label: 'All News' },
  { id: 'geopolitics', label: 'Geopolitics' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'technology', label: 'Technology' },
  { id: 'business', label: 'Business' },
  { id: 'science', label: 'Science' },
];

export function CategoryTabs({ activeCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          data-testid={`category-${category.id}`}
          onClick={() => onCategoryChange(category.id)}
          className={`inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 ${
            activeCategory === category.id
              ? 'bg-primary text-primary-foreground shadow-md scale-105'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:scale-105'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}// Category filter tabs
