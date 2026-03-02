import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DroppableDayProps {
  date: Date;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function DroppableDay({ date, children, className, onClick }: DroppableDayProps) {
  const { isOver, setNodeRef } = useDroppable({ id: date.toISOString(), data: { date } });

  return (
    <div ref={setNodeRef} onClick={onClick} className={cn(className, "transition-all duration-300 ease-out", isOver && "bg-gradient-to-br from-white/15 via-white/10 to-white/5 ring-2 ring-white/40 ring-inset scale-[1.02] shadow-xl shadow-white/10")}>
      {children}
    </div>
  );
}
