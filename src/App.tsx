import React, { useState } from 'react';
import { SearchForm } from './components/SearchForm';
import { ImageGallery } from './components/ImageGallery';

function App() {
  const [currentHN, setCurrentHN] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (hn: string) => {
    setIsSearching(true);
    setCurrentHN(hn);
    // Reset searching state after a short delay to allow ImageGallery to handle its own loading
    setTimeout(() => setIsSearching(false), 100);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ระบบแสดงรูปภาพลูกค้า
          </h1>
          <p className="text-gray-600">
            ค้นหาและแสดงรูปภาพลูกค้าจากรหัสลูกค้า (HN MCS)
          </p>
        </header>

        <div className="max-w-2xl mx-auto mb-8">
          <SearchForm onSearch={handleSearch} loading={isSearching} />
        </div>

        {currentHN && (
          <div className="max-w-6xl mx-auto">
            <ImageGallery hn={currentHN} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 