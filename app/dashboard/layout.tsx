"use client";

import AiChatButton from "../components/AiChatButton";
import { BabyProvider, useBaby } from "../components/BabyContext";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { activeBabyId } = useBaby();

  return (
    <div className="relative">
      {children}
      <AiChatButton babyId={activeBabyId ?? undefined} />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BabyProvider>
      <DashboardContent>{children}</DashboardContent>
    </BabyProvider>
  );
}
