import { NextResponse } from "next/server";

// ─── Codolio Stats API ────────────────────────────────────────────────────────
//
// Codolio has no public API and renders data via client-side JavaScript.
// This route serves as the single source of truth for live stats.
//
// Stats last synced: 2026-05-08
// Source: https://codolio.com/profile/artist_hks
//
// To update, change the values below and push — the frontend auto-fetches
// from this endpoint on every page load with built-in fallbacks.

export const revalidate = 0; // always fresh, no caching

export async function GET() {
  const stats = {
    // Aggregate across all connected platforms
    problemsSolved: 464,     // Total Questions (LeetCode + CodeStudio + GFG + HackerRank + CodeChef)
    dsaProblems: 380,        // DSA: Easy 162 + Medium 156 + Hard 62
    easy: 162,
    medium: 156,
    hard: 62,
    contests: 5,             // Total Contests (LeetCode: 1, CodeStudio: 4)
    rating: 1414,            // LeetCode Rating (Biweekly Contest 181, Rank 18485)
    streak: 49,              // Current Streak (Max Streak: 49)
    activeDays: 93,          // Total Active Days
    submissions: 674,        // Total Submissions
    awards: 27,              // Awards count
    rank: "Specialist",      // CodeStudio rank
    lastUpdated: new Date().toISOString(),
  };

  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
