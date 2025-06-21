import React, { useState } from 'react';

interface SearchFormProps {
  onSearch: (hn: string) => void;
  loading?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading = false }) => {
  const [hn, setHn] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hn.trim()) {
      onSearch(hn.trim());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        ค้นหารูปภาพ
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="hn" className="block text-sm font-medium text-gray-700 mb-2">
            รหัสลูกค้า (HN MCS)
          </label>
          <input
            type="text"
            id="hn"
            value={hn}
            onChange={(e) => setHn(e.target.value)}
            placeholder="กรุณากรอกรหัส (HN MCS) เช่น 67000190"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={!hn.trim() || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {loading ? 'กำลังค้นหา...' : 'ค้นหารูปภาพ'}
        </button>
      </form>
    </div>
  );
}; 