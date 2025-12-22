'use client';

import { useState } from 'react';

type InputMethod = 'paste' | 'upload' | 'url';

interface InputPanelProps {
  onParse: (content: string) => void;
  loading: boolean;
  error: string | null;
}

export function InputPanel({ onParse, loading, error }: InputPanelProps) {
  const [activeTab, setActiveTab] = useState<InputMethod>('paste');
  const [pasteContent, setPasteContent] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const handleSubmit = async () => {
    if (activeTab === 'paste') {
      onParse(pasteContent);
    } else if (activeTab === 'url') {
      try {
        const response = await fetch(`/api/fetch?url=${encodeURIComponent(urlInput)}`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch');
        }
        const text = await response.text();
        onParse(text);
      } catch {
        onParse('');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onParse(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="card bg-base-200 p-6">
      <div role="tablist" className="tabs tabs-boxed mb-4">
        <button
          role="tab"
          className={`tab ${activeTab === 'paste' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('paste')}
        >
          Paste
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === 'upload' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === 'url' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('url')}
        >
          URL
        </button>
      </div>

      {activeTab === 'paste' && (
        <textarea
          className="textarea textarea-bordered w-full h-40 font-mono text-sm"
          placeholder="Paste your OpenAPI/Swagger JSON or YAML here..."
          value={pasteContent}
          onChange={(e) => setPasteContent(e.target.value)}
        />
      )}

      {activeTab === 'upload' && (
        <input
          type="file"
          className="file-input file-input-bordered w-full"
          accept=".json,.yaml,.yml"
          onChange={handleFileUpload}
        />
      )}

      {activeTab === 'url' && (
        <input
          type="url"
          className="input input-bordered w-full"
          placeholder="https://api.example.com/swagger.json"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
      )}

      {error && (
        <div className="alert alert-error mt-4">
          <span>{error}</span>
        </div>
      )}

      {activeTab !== 'upload' && (
        <button
          className="btn btn-primary mt-4"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <span className="loading loading-spinner" /> : 'Parse & Convert'}
        </button>
      )}
    </div>
  );
}
