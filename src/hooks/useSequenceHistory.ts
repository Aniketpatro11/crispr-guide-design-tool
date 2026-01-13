import { useState, useEffect } from "react";

export interface SequenceHistoryItem {
  id: string;
  sequence: string;
  preview: string;
  timestamp: number;
  length: number;
}

const STORAGE_KEY = "crispr-sequence-history";
const MAX_HISTORY = 10;

export function useSequenceHistory() {
  const [history, setHistory] = useState<SequenceHistoryItem[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = (sequence: string) => {
    if (!sequence || sequence.length < 10) return;
    
    const preview = sequence.slice(0, 30) + (sequence.length > 30 ? "..." : "");
    const newItem: SequenceHistoryItem = {
      id: Date.now().toString(),
      sequence,
      preview,
      timestamp: Date.now(),
      length: sequence.length,
    };

    setHistory((prev) => {
      // Check if this sequence already exists
      const exists = prev.some((item) => item.sequence === sequence);
      if (exists) {
        // Move to top
        return [
          newItem,
          ...prev.filter((item) => item.sequence !== sequence),
        ].slice(0, MAX_HISTORY);
      }
      return [newItem, ...prev].slice(0, MAX_HISTORY);
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return { history, addToHistory, removeFromHistory, clearHistory };
}
