export interface AlgCategory {
  key: "mastered" | "reviewing" | "learning" | "remaining";
  header: string;
  color: string;
}

export const ALG_CATEGORIES: AlgCategory[] = [
  { key: "mastered", header: "Mastered", color: "bg-accent" },
  { key: "reviewing", header: "Reviewing", color: "bg-green-400" },
  { key: "learning", header: "Learning", color: "bg-blue-400" },
  { key: "remaining", header: "Remaining", color: "bg-gray-400" },
];
