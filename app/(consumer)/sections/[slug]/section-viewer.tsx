"use client";

import { useState } from "react";

export default function SectionViewer({ slug }: { slug: string }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-screen bg-gray-950 overflow-hidden ">
      {/* Overlay spinner shown until iframe fires onLoad */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-gray-950 transition-opacity duration-300">
          <div className="w-10 h-10 rounded-full border-3 border-gray-800 border-t-blue-500 animate-spin" />
          <span className="text-xs font-medium text-gray-400 animate-pulse">
            Rendering content...
          </span>
        </div>
      )}

      {/* Iframe */}
      <div className=" m-0 p-0 overflow:hidden">
        <iframe
          src={`/internal-sections/${slug}/index.html`}
          title={slug}
          onLoad={() => setIsLoading(false)}
          className={`w-full h-screen border-none block overflow-hidden transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>
    </div>
  );
}
