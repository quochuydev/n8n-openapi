'use client';

import { useState } from 'react';
import type { Server } from '@/lib/parser';

interface BaseUrlSelectorProps {
  servers: Server[];
  selectedUrl: string;
  onSelect: (url: string) => void;
}

export function BaseUrlSelector({ servers, selectedUrl, onSelect }: BaseUrlSelectorProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__custom__') {
      setIsCustom(true);
      setCustomUrl(selectedUrl);
    } else {
      setIsCustom(false);
      onSelect(value);
    }
  };

  const handleCustomSubmit = () => {
    if (customUrl.trim()) {
      onSelect(customUrl.trim());
    }
  };

  return (
    <div className="flex items-center gap-4 mb-4">
      <label className="font-semibold whitespace-nowrap">Base URL:</label>

      {!isCustom ? (
        <select
          className="select select-bordered flex-1"
          value={selectedUrl}
          onChange={handleChange}
        >
          {servers.map((server, idx) => (
            <option key={idx} value={server.url}>
              {server.url}{server.description ? ` - ${server.description}` : ''}
            </option>
          ))}
          <option value="__custom__">Custom URL...</option>
        </select>
      ) : (
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder="https://api.example.com"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
          />
          <button className="btn btn-primary" onClick={handleCustomSubmit}>
            Apply
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setIsCustom(false);
              if (servers.length > 0) {
                onSelect(servers[0].url);
              }
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
