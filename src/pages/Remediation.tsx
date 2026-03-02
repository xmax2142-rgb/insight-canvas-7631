import Header from "@/components/Header";
import { Wrench } from "lucide-react";

const Remediation = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <Wrench className="w-16 h-16 mx-auto text-amber-500 mb-6" />
      <h1 className="text-4xl font-bold mb-4">Remediation Hub</h1>
      <p className="text-muted-foreground text-lg">Remediation tracking and progress coming soon.</p>
    </main>
  </div>
);

export default Remediation;
