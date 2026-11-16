import { useState, useEffect } from "react";

const KEY = "sysdesign-progress";

export function useProgress() {
  const [done, setDone] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify([...done]));
    } catch {
      // storage unavailable (private mode, etc.) — progress just won't persist
    }
  }, [done]);

  function toggle(topicId) {
    setDone((prev) => {
      const next = new Set(prev);
      next.has(topicId) ? next.delete(topicId) : next.add(topicId);
      return next;
    });
  }

  return { done, toggle };
}
