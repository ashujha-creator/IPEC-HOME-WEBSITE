import React from "react";
import Image from "next/image";
// Using a standard external link icon from react-icons
import { ExternalLink } from "lucide-react";

// Placeholder image paths - you'd replace these with your actual assets
const IC3_IMAGE =
  "https://plus.unsplash.com/premium_photo-1726880460027-fab1b079b37a?q=80&w=1126&auto=format&fit=crop";
const VDAT_IMAGE =
  "https://plus.unsplash.com/premium_photo-1726880460027-fab1b079b37a?q=80&w=1126&auto=format&fit=crop";

// Mock data for current happenings
const currentEvents = [
  {
    image: IC3_IMAGE,
    date: "6th, August 2026",
    title:
      "2026 Eighteenth International Conference on Contemporary Computing (IC3-2026)",
    description:
      "The International Conference on Contemporary Computing (IC3) is being jointly organized by Jaypee Institute of Information Technology, Noida, India",
    knowMoreUrl: "#", // Example link
  },
  {
    image: VDAT_IMAGE,
    date: "20th, August 2026",
    title: "30th International Symposium on VLSI Design and Test (VDAT 2026)",
    description:
      "Jaypee Institute of Information Technology (JIIT), Noida is hosting the 30th International Symposium on VLSI Design and Test (VDAT 2026) from 20-22",
    knowMoreUrl: "#",
  },
];

// Mock data for archived events
const archivedEvents = [
  {
    title: "one-week Staff Development Program (SDP)",
    date: "23rd, July 2026",
    knowMoreUrl: "#",
  },
  {
    title:
      'One-week Faculty Development Program (FDP) on "Recent Advances in Computational Mathematics"',
    date: "13th, July 2026",
    knowMoreUrl: null, // Example with no link
  },
  {
    title:
      "Recent Advances in Computational Mathematics, Machine Learning and Emerging Applications",
    date: "13th, July 2026",
    knowMoreUrl: "#",
  },
  {
    title: "Faculty Development Program 2026",
    date: "13th, July 2026",
    knowMoreUrl: "#",
  },
];

const EventsSection = () => {
  return (
    <section className="bg-white p-6 md:p-10 text-[#3c3c3c]">
      {/* Main Section Title */}
      <h2 className="text-4xl font-extrabold mb-1">What&apos;s</h2>
      <p className="text-2xl font-normal mb-10">Happening @ IPEC</p>

      {/* Main Grid: Happenings (left) and Archive (right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Current Happenings Column (Span 2) */}
        <div className="md:col-span-2 bg-[#f6f2eb] p-6 md:p-8 flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 flex-grow">
            {currentEvents.map((event, index) => (
              <div key={index} className="flex flex-col">
                {/* Event Image */}
                <div className="relative aspect-[3/2] w-full mb-4 border border-[#e0dad1]">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Event Text Content */}
                <p className="text-sm font-semibold text-[#6a6a6a] mb-1">
                  {event.date}
                </p>
                <h3 className="text-base font-bold mb-2 leading-tight">
                  {event.title}
                </h3>
                <p className="text-sm text-[#6a6a6a] leading-relaxed mb-4 flex-grow">
                  {event.description}
                </p>

                {/* Know More Link (only if a URL is provided) */}
                {event.knowMoreUrl && (
                  <a
                    href={event.knowMoreUrl}
                    className="flex items-center gap-2 text-sm font-semibold hover:text-black mt-auto"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Know More
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Pagination and View All Button - Placed below the cards */}
          <div className="mt-12 flex items-center justify-between">
            {/* Simple dot pagination (static placeholder) */}
            <div className="flex gap-1.5">
              <span className="w-6 h-1.5 bg-[#e86036] rounded-full"></span>
              <span className="w-6 h-1.5 bg-[#cbdbe1] rounded-full"></span>
              <span className="w-6 h-1.5 bg-[#cbdbe1] rounded-full"></span>
              <span className="w-6 h-1.5 bg-[#cbdbe1] rounded-full"></span>
            </div>

            {/* View All Button */}
            <button className="flex items-center gap-2.5 px-6 py-2 border border-[#3c3c3c] rounded-full text-sm font-semibold hover:bg-[#3c3c3c] hover:text-white transition-colors">
              <ExternalLink className="w-4 h-4" />
              View All
            </button>
          </div>
        </div>

        {/* Event Archive Column (Span 1) */}
        <div className="bg-[#e2f1f7] p-8 border-l border-[#d3dfe2]">
          <h3 className="text-3xl font-bold mb-10 text-[#2c2c2c]">
            Event Archive
          </h3>

          <div className="space-y-8 relative">
            {/* Optional subtle vertical line accent */}
            <div className="absolute left-[-2px] top-0 bottom-0 w-[1px] bg-[#cbdbe1]"></div>

            {archivedEvents.map((event, index) => (
              <div key={index} className="flex flex-col gap-1.5 relative pl-3">
                {/* Tiny dot on the line accent */}
                <div className="absolute left-[-4.5px] top-[10px] w-1.5 h-1.5 rounded-full bg-[#cbdbe1]"></div>

                <h4 className="text-sm font-medium leading-snug">
                  {event.title}
                </h4>
                <p className="text-sm font-semibold text-[#6a6a6a]">
                  {event.date}
                </p>

                {/* Know More Link (if URL exists) */}
                {event.knowMoreUrl && (
                  <a
                    href={event.knowMoreUrl}
                    className="flex items-center gap-2 text-xs font-semibold hover:text-black mt-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Know More
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
