import React from "react";
import { cn } from "@/lib/utils";

export type MatrixLoaderVariant = 'scan' | 'twinkle' | 'orbit' | 'pulse';

interface MatrixLoaderProps {
  variant?: MatrixLoaderVariant;
  className?: string;
}

export const MatrixLoader: React.FC<MatrixLoaderProps> = ({ variant = 'scan', className }) => {
  const cycle = 1200; // ms

  const getDelay = (index: number) => {
    // 4x4 grid: indices 0 to 15
    const col = index % 4;

    if (variant === 'scan') {
      return col * (cycle / 10);
    }
    if (variant === 'twinkle') {
      const order = [7, 2, 11, 5, 14, 9, 0, 12, 3, 15, 6, 10, 13, 1, 8, 4];
      return order[index] * (cycle / 16);
    }
    if (variant === 'orbit') {
      // ring [1,2,7,11,14,13,8,4]
      const ring = [1, 2, 7, 11, 14, 13, 8, 4];
      const ringIndex = ring.indexOf(index);
      if (ringIndex !== -1) {
        return ringIndex * (cycle / 8);
      }
      return 0; // center holds steady
    }
    if (variant === 'pulse') {
      const inner = [5, 6, 9, 10];
      if (inner.includes(index)) {
        return 0;
      }
      return cycle * 0.16;
    }
    return 0;
  };

  const isGap = (index: number) => [0, 3, 12, 15].includes(index);

  return (
    <div className={cn("t-matrix", className)}>
      {Array.from({ length: 16 }).map((_, i) => (
        <i
          key={i}
          className={isGap(i) ? "is-gap" : undefined}
          style={{ "--d": getDelay(i) } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
