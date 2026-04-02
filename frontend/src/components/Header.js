import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { SearchBar } from './SearchBar';

export function Header({ searchValue, onSearchChange, onSearch }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#130c0d]/80 border-b border-border shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-heading font-bold text-primary">
              PulseSphere AI
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <SearchBar 
              value={searchValue} 
              onChange={onSearchChange} 
              onSearch={onSearch}
            />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}