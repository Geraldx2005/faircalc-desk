// :contentReference[oaicite:0]{index=0}
import React, { useRef, useLayoutEffect, useState, useEffect } from "react";

const SegmentedButton = ({ options, value, onChange }) => {
  const containerRef = useRef(null);
  const [segmentWidth, setSegmentWidth] = useState(0);

  const updateSegmentWidth = () => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setSegmentWidth(width / options.length);
    }
  };

  useLayoutEffect(() => {
    updateSegmentWidth();
  }, [options.length]);

  useEffect(() => {
    // Update on window resize
    window.addEventListener("resize", updateSegmentWidth);
    return () => window.removeEventListener("resize", updateSegmentWidth);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-12 inline-flex bg-gray-200 rounded-lg overflow-hidden"
    >
      {/* Sliding highlight */}
      <div
        className="absolute top-0 left-0 h-full bg-[#1c4270] rounded-lg transition-all duration-200"
        style={{
          width: segmentWidth,
          transform: `translateX(${options.indexOf(value) * segmentWidth}px)`
        }}
      />

      {/* Buttons */}
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`relative z-10 w-full h-full text-base transition font-medium
              ${active ? "text-white" : "text-gray-700"}`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedButton;
