export interface AlgCategory {
  key: "mastered" | "reviewing" | "learning" | "remaining" | "locked" | "focused";
  header: string;
  color: string;
  borderColor: string;
  bgColor: string;
}
