import React from 'react';

interface ModularDataDeckProps {
  children: React.ReactNode;
}

export default function ModularDataDeck({ children }: ModularDataDeckProps) {
  return (
    <div className="w-full lg:ml-[45vw] lg:w-[55vw] min-h-[calc(100vh-80px)] pt-11 pb-12 flex flex-col justify-start">
      <main 
        id="main-content" 
        tabIndex={-1} 
        className="flex-1 px-4 sm:px-8 py-6 max-w-4xl focus:outline-none"
      >
        {children}
      </main>
    </div>
  );
}
