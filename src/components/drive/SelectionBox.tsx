import React from "react";

interface SelectionBoxProps {
  dragStart: { x: number; y: number } | null;
  dragCurrent: { x: number; y: number } | null;
}

export default function SelectionBox({
  dragStart,
  dragCurrent,
}: SelectionBoxProps) {
  if (!dragStart || !dragCurrent) return null;

  return (
    <div
      className="fixed border border-blue-500 bg-blue-500/20 z-50 pointer-events-none"
      style={{
        left: Math.min(dragStart.x, dragCurrent.x),
        top: Math.min(dragStart.y, dragCurrent.y),
        width: Math.abs(dragCurrent.x - dragStart.x),
        height: Math.abs(dragCurrent.y - dragStart.y),
      }}
    />
  );
}
