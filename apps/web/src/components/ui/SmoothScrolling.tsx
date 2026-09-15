"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";

export const SmoothScrolling = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Initialize Lenis for buttery smooth scrolling
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponent decay
      orientation: "vertical",
      gestureOrientation: "vertical",
      wheelMultiplier: 0.8,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};
