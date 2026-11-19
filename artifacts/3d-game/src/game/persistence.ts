const BEST_SCORE_KEY = "crossy-road.best-score.v1";

export function loadBestScore(): number {
  try {
    const saved = window.localStorage.getItem(BEST_SCORE_KEY);
    const value = Number(saved);
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(score: number): void {
  if (!Number.isFinite(score) || score < 0) return;
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(Math.floor(score)));
  } catch {
    // Play continues if browser storage is unavailable or full.
  }
}
