export interface AlgCategory {
  key: "mastered" | "reviewing" | "learning" | "remaining" | "locked";
  header: string;
  color: string;
  borderColor: string;
}
export const ALG_CATEGORIES: AlgCategory[] = [
  { key: "mastered", header: "Mastered", color: "bg-accent", borderColor: "#CB30E0" },
  { key: "reviewing", header: "Reviewing", color: "bg-green-400", borderColor: "#4ade80" },
  { key: "learning", header: "Learning", color: "bg-blue-400", borderColor: "#60a5fa" },
  { key: "remaining", header: "Remaining", color: "bg-gray-400", borderColor: "#9ca3af" },
  { key: "locked", header: "Locked", color: "bg-gray-400", borderColor: "#9ca3af" },
];

