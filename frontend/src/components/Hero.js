import React from 'react';

export function Hero() {
  return (
    <div className="relative overflow-hidden py-24 sm:py-32 rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 mb-8">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1614265712999-72032803a77a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwzfHxhYnN0cmFjdCUyMHJlZCUyMHdpbmUlMjBjb2xvciUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzc0NzkxOTQ5fDA&ixlib=rb-4.1.0&q=85)'
        }}
      />
      <div className="bg-white/85 dark:bg-[#130c0d]/90 backdrop-blur-sm absolute inset-0" />
      
      <div className="relative max-w-4xl mx-auto text-center px-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold tracking-tight leading-none mb-6 text-foreground">
          Welcome to PulseSphere AI
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore the world, one headline at a time
        </p>
      </div>
    </div>
  );
}