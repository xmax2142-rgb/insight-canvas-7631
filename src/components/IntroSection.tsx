import { Shield } from "lucide-react";

const IntroSection = () => {
  return (
    <section className="max-w-4xl mx-auto py-8 md:py-12 px-4 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-accent animate-slide-up">
          <Shield className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-widest">GRC Command Center</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold leading-tight animate-slide-up stagger-1">
          Monitor violations, track remediation, and manage compliance activities.
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto animate-slide-up stagger-2">
          Your centralized dashboard for governance, risk, and compliance oversight. Stay ahead of threats, maintain audit readiness, and ensure organizational security posture.
        </p>
      </div>
    </section>
  );
};

export default IntroSection;
