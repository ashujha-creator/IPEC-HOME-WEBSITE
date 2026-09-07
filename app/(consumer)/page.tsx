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
import Footer from "../../components/ui/fotter";
import LifeGallery from "@/components/ui/gallery";
import AboutSection from "@/components/ui/about";

import { getLinks } from "@/app/actions/links"; // adjust path to match your project
import { defaultItems } from "@/lib/navigation/nav-items";
import { mapDatabaseLinks } from "@/lib/navigation/map-db-links";

export default async function Home() {
  const linksRecord = await getLinks();
  const navItems = linksRecord
    ? mapDatabaseLinks(defaultItems, linksRecord)
    : defaultItems;

  return (
    <>
      <main>
        <Header />
        <NavBar items={navItems} />
        <Announcement />
        <Carousel />
        <AboutSection />
        <OurStrength />
        <CampusAndAccreditations />
        <PlacementHighlights />
        <InnovationHub />
        <SpotlightAlumni />
        <Notice />
        <EventsSection />
        <LifeGallery />
        <Footer />
      </main>
    </>
  );
}
