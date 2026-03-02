import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ShieldCheck, UserCheck, Lock, Home } from "lucide-react";
import { mockUsers } from "@/lib/mockData";

const RemediationLogin = () => {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!selectedUser) return;

    const user = mockUsers.find((u) => u.id === selectedUser);
    if (user) {
      localStorage.setItem('mockUser', JSON.stringify(user));
      navigate(user.role === 'admin' ? '/remediation/admin' : '/remediation/dashboard');
    }
  };

  const selectedUserData = mockUsers.find((u) => u.id === selectedUser);

  return (
    <div className="min-h-screen flex">
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12 text-primary-foreground">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-10 w-10" />
            <span className="text-2xl font-bold tracking-tight">RAP System</span>
          </div>
          <p className="text-primary-foreground/70 text-sm">Remediation Action Plan</p>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl font-bold leading-tight">
            Governance, Risk<br />& Compliance<br />Management
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-md leading-relaxed">
            Track, manage, and resolve security findings with a streamlined remediation workflow.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary-foreground/80">
              <ShieldCheck className="h-5 w-5 flex-shrink-0" />
              <span>Centralized finding management</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/80">
              <UserCheck className="h-5 w-5 flex-shrink-0" />
              <span>Role-based access control</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/80">
              <Lock className="h-5 w-5 flex-shrink-0" />
              <span>Audit-ready compliance tracking</span>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-primary-foreground/50">© 2026 GRC System. Upstream Digital Center.</p>

        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full border-2 border-primary-foreground" />
          <div className="absolute bottom-32 right-32 w-96 h-96 rounded-full border border-primary-foreground" />
          <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full border border-primary-foreground" />
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex justify-between items-center">
            <div className="lg:hidden flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">RAP System</span>
            </div>
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                <Home className="h-4 w-4" /> Home
              </Button>
            </Link>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
              Select a demo user to explore the interface
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="user" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Demo User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger id="user" className="h-11">
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map((user) =>
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span>{user.name}</span>
                        <span className="text-muted-foreground text-xs">
                          ({user.role === 'admin' ? 'GRC Analyst' : 'Proponent'})
                        </span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedUserData &&
              <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                    {selectedUserData.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedUserData.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedUserData.email}</p>
                  </div>
                </div>
              </div>
            }

            <Button className="w-full h-11 font-medium" onClick={handleLogin} disabled={!selectedUser}>
              Sign In
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Prototype with mock data · Backend integration required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemediationLogin;
