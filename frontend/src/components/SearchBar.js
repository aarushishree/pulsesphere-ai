import React from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';

export function SearchBar({ value, onChange, onSearch }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      onSearch();
    }
  };

  return (
    <div className="relative w-full md:w-80">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        data-testid="search-input"
        type="text"
        placeholder="Search news..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="rounded-full bg-muted/50 border-transparent focus:border-primary focus:ring-primary pl-10 h-10 w-full transition-all duration-300"
      />
    </div>
  );
}