"use client";

import { useState, useEffect, useCallback } from "react";
import { InputPanel } from "@/components/InputPanel";
import { NodeList } from "@/components/NodeList";
import { Toast, type ToastMessage } from "@/components/Toast";
import { parseOpenAPI, getBaseUrl } from "@/lib/parser";
import { convertToN8nNodes, createWorkflow } from "@/lib/converter/index";
import type { N8nNode, OpenAPISpec } from "@/types";

const STORAGE_KEY = "n8n-openapi-tabs";

interface ConversionTab {
  id: string;
  title: string;
  baseUrl: string;
  nodes: N8nNode[];
  selectedIds: string[];
  spec: OpenAPISpec;
}

function extractBaseUrlFromSourceUrl(sourceUrl: string): string {
  try {
    const url = new URL(sourceUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tabs, setTabs] = useState<ConversionTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [outputText, setOutputText] = useState("");
  const [showDemoModal, setShowDemoModal] = useState(false);

  const addToast = useCallback(
    (type: ToastMessage["type"], message: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load from localStorage on mount, or load sample if empty
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.tabs && data.tabs.length > 0) {
            setTabs(data.tabs);
            setActiveTabId(data.activeTabId || null);
            return;
          }
        }

        // No saved tabs, load sample
        const response = await fetch("/pos-swagger.json");
        if (response.ok) {
          const content = await response.text();
          const spec = parseOpenAPI(content);
          const baseUrl = getBaseUrl(spec);
          const nodes = convertToN8nNodes(spec, baseUrl);
          const sampleTab: ConversionTab = {
            id: crypto.randomUUID(),
            title: spec.info?.title || "Sample API",
            baseUrl,
            nodes,
            selectedIds: nodes.map((n) => n.id),
            spec,
          };
          setTabs([sampleTab]);
          setActiveTabId(sampleTab.id);
        }
      } catch (e) {
        console.error("Failed to load initial data:", e);
      }
    };

    loadInitialData();
  }, []);

  // Save to localStorage
  const saveToStorage = (tabs: ConversionTab[], activeTabId: string | null) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs, activeTabId }));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  };

  const handleConvert = async (content: string, sourceUrl?: string) => {
    if (!content.trim()) {
      setError("Please provide OpenAPI spec content");
      addToast("error", "Please provide OpenAPI spec content");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const spec = parseOpenAPI(content);

      // Get base URL: from spec, or extract from source URL
      let baseUrl = getBaseUrl(spec);
      if (!baseUrl && sourceUrl) {
        baseUrl = extractBaseUrlFromSourceUrl(sourceUrl);
      }

      const nodes = convertToN8nNodes(spec, baseUrl);
      const newTab: ConversionTab = {
        id: crypto.randomUUID(),
        title: spec.info?.title || "Untitled",
        baseUrl,
        nodes,
        selectedIds: nodes.map((n) => n.id),
        spec,
      };

      const newTabs = [...tabs, newTab];
      setTabs(newTabs);
      setActiveTabId(newTab.id);
      saveToStorage(newTabs, newTab.id);
      addToast(
        "success",
        `Converted "${newTab.title}" with ${nodes.length} nodes`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to parse OpenAPI spec";
      setError(message);
      addToast("error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTab = (id: string) => {
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;

    if (!confirm(`Remove "${tab.title}" tab?`)) return;

    const newTabs = tabs.filter((t) => t.id !== id);
    let newActiveId = activeTabId;

    if (activeTabId === id) {
      const idx = tabs.findIndex((t) => t.id === id);
      newActiveId = newTabs[idx]?.id || newTabs[idx - 1]?.id || null;
    }

    setTabs(newTabs);
    setActiveTabId(newActiveId);
    saveToStorage(newTabs, newActiveId);
  };

  const handleUpdateBaseUrl = (tabId: string, newBaseUrl: string) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id !== tabId) return tab;

      // Reconvert nodes with new base URL
      const nodes = convertToN8nNodes(tab.spec, newBaseUrl);
      return {
        ...tab,
        baseUrl: newBaseUrl,
        nodes,
        selectedIds: nodes.map((n) => n.id),
      };
    });

    setTabs(newTabs);
    saveToStorage(newTabs, activeTabId);
  };

  const handleToggleNode = (tabId: string, nodeId: string) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id !== tabId) return tab;

      const selectedSet = new Set(tab.selectedIds);
      if (selectedSet.has(nodeId)) {
        selectedSet.delete(nodeId);
      } else {
        selectedSet.add(nodeId);
      }
      return { ...tab, selectedIds: Array.from(selectedSet) };
    });

    setTabs(newTabs);
    saveToStorage(newTabs, activeTabId);
  };

  const handleCopyNode = (node: N8nNode) => {
    const workflow = createWorkflow([node]);
    navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
    addToast("success", "Node copied to clipboard");
  };

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activeSelectedIds = new Set(activeTab?.selectedIds || []);
  const activeSelectedNodes =
    activeTab?.nodes.filter((n) => activeSelectedIds.has(n.id)) || [];
  const activeWorkflow = createWorkflow(activeSelectedNodes);

  // Sync output text when selection changes
  useEffect(() => {
    setOutputText(JSON.stringify(activeWorkflow, null, 2));
  }, [activeTabId, activeTab?.selectedIds]);

  // Handle Escape key to close demo modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showDemoModal) {
        setShowDemoModal(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showDemoModal]);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(outputText);
    addToast(
      "success",
      `Copied ${activeSelectedNodes.length} nodes to clipboard`
    );
  };

  const handleSelectAll = (tabId: string) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id !== tabId) return tab;
      return { ...tab, selectedIds: tab.nodes.map((n) => n.id) };
    });
    setTabs(newTabs);
    saveToStorage(newTabs, activeTabId);
  };

  const handleUnselectAll = (tabId: string) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id !== tabId) return tab;
      return { ...tab, selectedIds: [] };
    });
    setTabs(newTabs);
    saveToStorage(newTabs, activeTabId);
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <header className="navbar bg-base-200 px-6">
        <h1 className="text-xl font-bold">OpenAPI to n8n Converter</h1>
        <a
          href="https://github.com/quochuydev/n8n-openapi"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2"
        >
          <img
            src="https://img.shields.io/github/stars/quochuydev/n8n-openapi?style=social"
            alt="GitHub stars"
            className="h-5"
          />
        </a>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Column 1 - Convert Form (3/10) */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          <InputPanel
            onConvert={handleConvert}
            loading={loading}
            error={error}
          />

          {/* Demo Video Thumbnail */}
          <div className="card bg-base-200 p-3">
            <button
              className="relative group cursor-pointer w-full"
              onClick={() => setShowDemoModal(true)}
            >
              <video
                className="w-full rounded-lg opacity-80 group-hover:opacity-100 transition-opacity"
                muted
                loop
                playsInline
                autoPlay
              >
                <source src="/demo.mov" type="video/quicktime" />
                <source src="/demo.mov" type="video/mp4" />
              </video>
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 rounded-full p-3 group-hover:bg-black/70 group-hover:scale-110 transition-all">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 text-xs text-white bg-black/60 px-2 py-1 rounded">
                Watch Demo
              </div>
            </button>
          </div>
        </div>

        {/* Column 2 - Browser Tabs (7/10) */}
        <div className="flex flex-col lg:col-span-7">
          {/* Tab Bar */}
          <div className="flex bg-base-300 rounded-t-lg px-2 pt-2 gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg cursor-pointer transition-colors min-w-0 ${
                  activeTabId === tab.id
                    ? "bg-base-200 text-base-content"
                    : "bg-base-300 text-base-content/60 hover:text-base-content hover:bg-base-200/50"
                }`}
                onClick={() => setActiveTabId(tab.id)}
              >
                <span className="truncate max-w-32">{tab.title}</span>
                <button
                  className="btn btn-ghost btn-xs p-0 h-4 min-h-0 w-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab.id);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            {tabs.length === 0 && (
              <div className="px-3 py-2 text-sm text-base-content/50">
                No conversions yet
              </div>
            )}
          </div>

          {/* Tab Content - Nodes + Output */}
          <div className="bg-base-200 rounded-b-lg rounded-tr-lg p-4 flex-1 overflow-auto">
            {activeTab ? (
              <div className="flex flex-col gap-4 h-full">
                {/* Base URL Editor */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Base URL:</label>
                  <input
                    type="text"
                    className="input input-bordered input-sm flex-1"
                    value={activeTab.baseUrl}
                    onChange={(e) =>
                      handleUpdateBaseUrl(activeTab.id, e.target.value)
                    }
                    placeholder="https://api.example.com"
                  />
                </div>

                {/* Nodes + Output */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 flex-1">
                  {/* Nodes */}
                  <div className="flex flex-col lg:col-span-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">
                        Nodes ({activeTab.nodes.length})
                      </h3>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleSelectAll(activeTab.id)}
                          disabled={
                            activeSelectedIds.size === activeTab.nodes.length
                          }
                        >
                          Select All
                        </button>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleUnselectAll(activeTab.id)}
                          disabled={activeSelectedIds.size === 0}
                        >
                          Unselect All
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto max-h-[70vh]">
                      <NodeList
                        nodes={activeTab.nodes}
                        selectedIds={activeSelectedIds}
                        onToggle={(nodeId) =>
                          handleToggleNode(activeTab.id, nodeId)
                        }
                        onCopy={handleCopyNode}
                      />
                    </div>
                  </div>

                  {/* Output */}
                  <div className="flex flex-col lg:col-span-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">
                        Output ({activeSelectedNodes.length} selected)
                      </h3>
                      <div className="flex flex-col items-end gap-1">
                        <button
                          className="btn btn-primary btn-xs gap-2"
                          onClick={handleCopyAll}
                          disabled={activeSelectedNodes.length === 0}
                        >
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                          </span>
                          Copy All
                        </button>
                        <span className="text-[10px] text-base-content/50 animate-pulse">
                          Copy and paste to n8n workflow
                        </span>
                      </div>
                    </div>
                    <textarea
                      className="textarea textarea-bordered font-mono text-xs w-full flex-1 max-h-[70vh] min-h-48"
                      value={outputText}
                      onChange={(e) => setOutputText(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-base-content/50 py-8">
                Convert an OpenAPI spec to see results here.
              </div>
            )}
          </div>
        </div>
      </main>

      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Demo Video Modal */}
      {showDemoModal && (
        <dialog
          className="modal modal-open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDemoModal(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowDemoModal(false);
          }}
        >
          <div className="modal-box max-w-4xl w-full p-0 bg-black">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10 text-white hover:bg-white/20"
              onClick={() => setShowDemoModal(false)}
            >
              ✕
            </button>
            <video
              className="w-full rounded-lg"
              autoPlay
              muted
              loop
              playsInline
              controls
            >
              <source src="/demo.mov" type="video/quicktime" />
              <source src="/demo.mov" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <form method="dialog" className="modal-backdrop bg-black/80">
            <button onClick={() => setShowDemoModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
