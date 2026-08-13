import Header from "@/components/ui/header";
import NavBar from "@/components/ui/nav";
import Announcement from "@/components/ui/announcement";
import Carousel from "@/components/ui/carousel";
import OurStrength from "@/components/ui/strength";
import CampusAndAccreditations from "@/components/ui/campus";
import PlacementHighlights from "@/components/ui/placements";
import InnovationHub from "@/components/ui/InnovationHub";
import SpotlightAlumni from "@/components/ui/SpotlightAlumni";
import Notice from "@/components/ui/Notice";
import EventsSection from "@/components/ui/EventsSection";
export default function Home() {
  return (
    <>
      <main>
        <Header />
        <NavBar />
        <Announcement />
        <Carousel />
        <OurStrength />
        <CampusAndAccreditations />
        <PlacementHighlights />
        <InnovationHub />
        <SpotlightAlumni />
        <Notice />
        <EventsSection />
      </main>
    </>
  );
}
