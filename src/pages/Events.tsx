import Header from "@/components/Header";
import { Radar } from "lucide-react";

const Events = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <Radar className="w-16 h-16 mx-auto text-cyan-500 mb-6" />
      <h1 className="text-4xl font-bold mb-4">Event Horizon Hub</h1>
      <p className="text-muted-foreground text-lg">Cybersecurity event management coming soon.</p>
    </main>
  </div>
);

export default Events;
