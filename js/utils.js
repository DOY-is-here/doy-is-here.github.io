export function classifyRatio(w, h) {
    const ratio = w / h;

    if (ratio >= 16/9) return "ratio-16-9";
    if (ratio >= 4/3 && ratio < 16/9) return "ratio-4-3";
    if (ratio > 3/4 && ratio < 4/3) return "ratio-1-1";
    if (ratio > 9/16 && ratio <= 3/4) return "ratio-3-4";
    return "ratio-9-16";
}
