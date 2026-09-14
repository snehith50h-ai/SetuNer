"use client";
import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: React.ReactNode;
}

interface SlidingTabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const SlidingTabs: React.FC<SlidingTabsProps> = ({
  tabs,
  activeId,
  onChange,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  const updatePillPosition = (transition = true) => {
    if (!pillRef.current || !containerRef.current) return;
    const activeTab = tabRefs.current.get(activeId);
    if (!activeTab) return;

    if (!transition) {
      pillRef.current.style.transition = "none";
    }

    pillRef.current.style.transform = `translateX(${activeTab.offsetLeft}px)`;
    pillRef.current.style.width = `${activeTab.offsetWidth}px`;

    if (!transition) {
      // Force a reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      pillRef.current.offsetWidth;
      pillRef.current.style.transition = "";
    }
  };

  useEffect(() => {
    updatePillPosition(false);
    setIsInitialized(true);

    const handleResize = () => updatePillPosition(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeId]);

  useEffect(() => {
    if (isInitialized) {
      updatePillPosition(true);
    }
  }, [activeId, isInitialized]);

  return (
    <div className={cn("t-tabs", className)} role="tablist" ref={containerRef}>
      <span className="t-tabs-pill" aria-hidden="true" ref={pillRef}></span>
      {tabs.map((tab) => {
        const isSelected = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
              else tabRefs.current.delete(tab.id);
            }}
            className="t-tab"
            role="tab"
            aria-selected={isSelected}
            onClick={(e) => {
              e.preventDefault();
              onChange(tab.id);
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
