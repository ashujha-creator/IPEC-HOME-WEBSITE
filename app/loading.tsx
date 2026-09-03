import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Glow */}
        <div className="absolute -inset-4 rounded-full bg-blue-600/20 blur-lg animate-pulse" />

        {/* Outer Spinning Ring */}
        <div className="h-28 w-28 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700 border-r-blue-700" />

        {/* Center IPEC Logo Container */}
        <div className="absolute flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white p-2 shadow-md">
          <Image
            src="/logo.png" // Ensure your logo is placed in the public/ directory
            alt="IPEC Logo"
            width={70}
            height={70}
            className="object-contain animate-pulse"
            priority
          />
        </div>
      </div>

      {/* Brand Text & Indicator */}
      <div className="mt-6 text-center">
        <h3 className="text-lg font-bold tracking-wide text-slate-800">
          Inderprastha Engineering College
        </h3>
        <p className="mt-1 text-xs font-medium tracking-widest text-slate-500 uppercase animate-pulse">
          Loading Application...
        </p>
      </div>
    </div>
  );
}
