import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Compass,
  Play,
  GraduationCap,
  BookOpen,
  Building2,
  Trophy,
} from "lucide-react";

export default function VirtualTourPage() {
  // Replace with your actual YouTube video ID
  const youtubeVideoId = "dQw4w9WgXcQ";

  const campusHighlights = [
    {
      title: "Academic Block",
      description:
        "State-of-the-art lecture halls, advanced research labs, and faculty suites.",
      icon: Building2,
    },
    {
      title: "Central Library",
      description:
        "Over 100,000 physical volumes, digital archives, and 24/7 quiet study zones.",
      icon: BookOpen,
    },
    {
      title: "Sports Complex",
      description:
        "Olympic-sized swimming pool, indoor arena, and multi-purpose athletic fields.",
      icon: Trophy,
    },
    {
      title: "Student Center",
      description:
        "Dining halls, club headquarters, and vibrant lounge spaces for campus life.",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Hero Section */}
      <section className=" py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <Badge className=" hover:bg-white/20 border-none px-4 py-1 text-sm font-medium">
            <Compass className="w-4 h-4 mr-2 inline" /> Interactive Experience
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Explore Our Campus Virtually
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600">
            Take a guided video tour through our world-class facilities, lush
            grounds, and vibrant academic environment from anywhere in the
            world.
          </p>
        </div>
      </section>

      {/* Main Video Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <Card className="border-slate-200 shadow-2xl bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="relative w-full aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/1exuYZoVz68?si=oIiDcPraBItniroe`}
                title="University Campus Virtual Tour"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Highlights & Information */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#0A192F]">
            Key Campus Locations
          </h2>
          <p className="text-slate-600 mt-2">
            Discover what makes our university campus unique
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {campusHighlights.map((highlight, index) => {
            const Icon = highlight.icon;
            return (
              <Card
                key={index}
                className="border-slate-200 hover:border-[#0A192F] transition-all shadow-sm hover:shadow-md"
              >
                <CardHeader className="space-y-1">
                  <div className="w-12 h-12 rounded-lg bg-[#0A192F] text-white flex items-center justify-center mb-2">
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl text-[#0A192F]">
                    {highlight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    {highlight.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
