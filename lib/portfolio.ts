export type ContactForm = {
  name: string;
  email: string;
  message: string;
};

export type CodolioStats = {
  rank: string;
  problemsSolved: number;
  dsaProblems: number;
  easy: number;
  medium: number;
  hard: number;
  contests: number;
  rating: number;
  streak: number;
  activeDays: number;
  submissions: number;
  awards: number;
  lastUpdated?: string;
};

export const sections = [
  "Home",
  "About",
  "Skills",
  "Projects",
  "Experience",
  "Resume",
  "Achievements",
  "Contact",
] as const;

// Fallback values — kept in sync with /app/api/codolio/route.ts
// Last synced: 2026-05-08 from https://codolio.com/profile/artist_hks
export const codolioStats: CodolioStats = {
  rank: "Specialist",
  problemsSolved: 464,
  dsaProblems: 380,
  easy: 162,
  medium: 156,
  hard: 62,
  contests: 5,
  rating: 1414,
  streak: 49,
  activeDays: 93,
  submissions: 674,
  awards: 27,
};

export function createEmptyContactForm(): ContactForm {
  return {
    name: "",
    email: "",
    message: "",
  };
}
