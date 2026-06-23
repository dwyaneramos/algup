export interface AlgCategory {
  key: "mastered" | "reviewing" | "learning" | "remaining" | "locked" | "focused";
  header: string;
  color: string;
  borderColor: string;
  bgColor: string;
}

export const ALG_CATEGORIES: AlgCategory[] = [
  { key: "focused", header: "Focused", color: "bg-amber-400", borderColor: "#F59E0B", bgColor: "#F59E0B" },
  { key: "mastered", header: "Mastered", color: "bg-accent", borderColor: "#CB30E0", bgColor: "#CB30E0" },
  { key: "reviewing", header: "Reviewing", color: "bg-green-400", borderColor: "#4ade80", bgColor: "#4ade80" },
  { key: "learning", header: "Learning", color: "bg-blue-400", borderColor: "#60a5fa", bgColor: "#60a5fa" },
  { key: "remaining", header: "Remaining", color: "bg-gray-400", borderColor: "#9ca3af", bgColor: "#9ca3af" },
  { key: "locked", header: "Locked", color: "bg-gray-400", borderColor: "#9ca3af", bgColor: "#9ca3af" },
];
