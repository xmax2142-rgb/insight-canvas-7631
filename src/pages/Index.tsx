import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import IntroSection from "@/components/IntroSection";
import { Calendar } from "@/components/ui/calendar";
import { ShieldAlert, Wrench, Radar, ArrowUpRight } from "lucide-react";
import { useViolations } from "@/hooks/useViolations";
import { mockRemediationItems } from "@/lib/mockData";
import { mockEvents } from "@/data/mockEvents";
import { isAfter, startOfToday } from "date-fns";

const hubs = [
  {
    title: "Cyber Violations Hub",
    description: "Track, investigate, and resolve cybersecurity policy violations across your organization.",
    href: "/violations",
    icon: ShieldAlert,
    accentColor: "border-l-red-500",
    iconColor: "text-red-500",
  },
  {
    title: "Remediation Hub",
    description: "Monitor remediation progress from assessments and ensure timely resolution of findings.",
    href: "/remediation",
    icon: Wrench,
    accentColor: "border-l-amber-500",
    iconColor: "text-amber-500",
  },
  {
    title: "Event Horizon Hub",
    description: "Schedule and manage cybersecurity events, audits, training sessions, and deadlines.",
    href: "/events",
    icon: Radar,
    accentColor: "border-l-cyan-500",
    iconColor: "text-cyan-500",
  },
];

const Index = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { violations, openCount: openViolations, totalCount: totalViolations } = useViolations();

  const openRemediations = mockRemediationItems.filter(i => i.status === "open" || i.status === "in_progress").length;
  const closedRemediations = mockRemediationItems.filter(i => i.status === "closed").length;
  const totalRemediations = mockRemediationItems.length;
  const criticalFindings = mockRemediationItems.filter(i => i.priority === "critical" && i.status !== "closed").length;
  const upcomingEvents = mockEvents.filter(ev => isAfter(ev.startDate, startOfToday()) && ev.status !== "completed").length;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSection
          totalViolations={totalViolations}
          openViolations={openViolations}
          openRemediations={openRemediations}
          closedRemediations={closedRemediations}
          totalRemediations={totalRemediations}
          criticalFindings={criticalFindings}
          upcomingEvents={upcomingEvents}
        />
        <IntroSection />

        {/* Hub Shortcuts */}
        <section className="py-12">
          <div className="flex items-center justify-between mb-8 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Command Hubs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hubs.map((hub, index) => {
              const Icon = hub.icon;
              return (
                <a
                  key={hub.title}
                  href={hub.href}
                  className={`group rounded-2xl bg-card border border-border/50 border-l-4 ${hub.accentColor} p-6 md:p-8 flex flex-col gap-4 card-hover animate-slide-up stagger-${Math.min(index + 1, 3)} no-underline`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-8 h-8 ${hub.iconColor}`} />
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <h3 className="text-xl font-bold">{hub.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{hub.description}</p>
                </a>
              );
            })}
          </div>
        </section>

        {/* Activity Calendar */}
        <section className="py-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 animate-slide-up">Activity Calendar</h2>
          <div className="rounded-2xl bg-card border border-border/50 p-6 md:p-8 inline-block animate-scale-in">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="pointer-events-auto"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Hubs</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/violations" className="hover:text-accent transition-colors">Violations</a></li>
                <li><a href="/remediation" className="hover:text-accent transition-colors">Remediation</a></li>
                <li><a href="/events" className="hover:text-accent transition-colors">Events</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-accent transition-colors">About</a></li>
                <li><a href="/contact" className="hover:text-accent transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Settings</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-accent transition-colors">Profile</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Notifications</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-accent transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 CyberGRC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
