import { ShieldAlert, ShieldCheck, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface KPICardsProps {
  openCount: number;
  closedCount: number;
  totalCount: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

function DonutChart({ value, max, color, bgColor }: { value: number; max: number; color: string; bgColor: string }) {
  const filled = max > 0 ? value : 0;
  const empty = max > 0 ? Math.max(0, max - value) : 1;
  const data = [
    { name: "filled", value: filled },
    { name: "empty", value: empty },
  ];

  return (
    <div className="relative h-20 w-20 flex-shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={26} outerRadius={36} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0} animationDuration={1000} animationEasing="ease-out">
            <Cell fill={color} />
            <Cell fill={bgColor} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{value}</span>
      </div>
    </div>
  );
}

export function ViolationKPICards({ openCount, closedCount, totalCount }: KPICardsProps) {
  return (
    <motion.div className="grid grid-cols-1 gap-5 sm:grid-cols-3" variants={container} initial="hidden" animate="visible">
      <motion.div variants={cardVariants}>
        <Card className="group border bg-amber-500/5 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
          <CardContent className="flex items-center gap-5 p-6">
            <DonutChart value={openCount} max={totalCount} color="hsl(38, 92%, 50%)" bgColor="hsl(38, 92%, 90%)" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">Open</p>
              </div>
              <p className="text-sm text-muted-foreground">{totalCount > 0 ? Math.round((openCount / totalCount) * 100) : 0}% of total</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="group border bg-emerald-500/5 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
          <CardContent className="flex items-center gap-5 p-6">
            <DonutChart value={closedCount} max={totalCount} color="hsl(152, 60%, 42%)" bgColor="hsl(152, 60%, 88%)" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Closed</p>
              </div>
              <p className="text-sm text-muted-foreground">{totalCount > 0 ? Math.round((closedCount / totalCount) * 100) : 0}% resolved</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="group border bg-red-500/5 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
          <CardContent className="flex items-center gap-5 p-6">
            <DonutChart value={totalCount} max={totalCount} color="hsl(15, 100%, 50%)" bgColor="hsl(15, 100%, 90%)" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</p>
              </div>
              <p className="text-sm text-muted-foreground">All violations issued</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
