export type ContactForm = {
  name: string;
  email: string;
  message: string;
};

export type CodolioStats = {
  rank: string;
  problemsSolved: number;
  contests: number;
  rating: number;
  streak: number;
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

export const codolioStats: CodolioStats = {
  rank: "Expert",
  problemsSolved: 150,
  contests: 25,
  rating: 1850,
  streak: 12,
};

export function createEmptyContactForm(): ContactForm {
  return {
    name: "",
    email: "",
    message: "",
  };
}
