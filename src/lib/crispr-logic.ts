// =====================================================
// CRISPR Logic - 100% preserved from original code
// =====================================================

// CRISPR Cas systems and PAMs (literature-based, educational)
export const CAS_PAM_TABLE: Record<string, string> = {
  "SpCas9 (S. pyogenes, Type II)": "NGG",
  "SaCas9 (S. aureus, Type II-A)": "NNGRRT",
  "StCas9 (S. thermophilus, Type II-A)": "NNAGAA",
  "S. solfataricus (Type I-A1)": "CCN",
  "S. solfataricus (Type I-A2)": "TCN",
  "H. walsbyi (Type I-B)": "TTC",
  "E. coli (Type I-E)": "AWG",
  "E. coli (Type I-F)": "CC",
  "P. aeruginosa (Type I-F)": "CC",
  "FnCas12a (F. novicida, Type V-A)": "TTTN",
  "AsCas12a (Acidaminococcus, Type V-A)": "TTTN",
};

// IUPAC ambiguity codes
export const IUPAC_CODES: Record<string, string[]> = {
  "A": ["A"],
  "T": ["T"],
  "G": ["G"],
  "C": ["C"],
  "N": ["A", "T", "G", "C"],
  "R": ["A", "G"],
  "Y": ["C", "T"],
  "W": ["A", "T"],
  "V": ["A", "C", "G"],
};

export function pamMatches(seqFragment: string, pamPattern: string): boolean {
  if (seqFragment.length !== pamPattern.length) {
    return false;
  }
  for (let i = 0; i < seqFragment.length; i++) {
    const base = seqFragment[i];
    const pattern = pamPattern[i];
    const allowed = IUPAC_CODES[pattern] || [];
    if (!allowed.includes(base)) {
      return false;
    }
  }
  return true;
}

export function cleanSequence(seq: string): string {
  const upper = seq.toUpperCase();
  return upper.split("").filter(b => ["A", "T", "G", "C"].includes(b)).join("");
}

export function parseFasta(text: string): string {
  return text
    .split("\n")
    .filter(l => l.trim() && !l.startsWith(">"))
    .map(l => l.trim())
    .join("");
}

export function gcContent(seq: string): number {
  if (!seq) return 0.0;
  const gc = seq.split("").filter(b => b === "G" || b === "C").length;
  return (gc / seq.length) * 100;
}

export function complement(b: string): string {
  const map: Record<string, string> = { "A": "T", "T": "A", "G": "C", "C": "G" };
  return map[b] || "N";
}

export function revComplement(seq: string): string {
  return seq.split("").reverse().map(complement).join("");
}

export function selfComplementarityScore(seq: string, window: number = 4): number {
  // simple heuristic: count short reverse-complement windows that appear within the guide
  let score = 0;
  if (seq.length < window) {
    return 0;
  }
  for (let i = 0; i <= seq.length - window; i++) {
    const w = seq.slice(i, i + window);
    if (seq.includes(revComplement(w))) {
      score += 1;
    }
  }
  return score;
}

export function offTargetScore(
  seq: string,
  guide: string,
  startIdx: number,
  maxMismatches: number = 5
): number {
  // educational-only heuristic: scan same input sequence for similar matches
  let score = 0;
  const L = guide.length;
  for (let i = 0; i <= seq.length - L; i++) {
    if (i === startIdx) {
      continue;
    }
    let mismatches = 0;
    for (let j = 0; j < L; j++) {
      if (seq[i + j] !== guide[j]) {
        mismatches++;
      }
    }
    if (mismatches <= maxMismatches) {
      score += 1;
    }
  }
  return score;
}

export interface GuideMeta {
  guideStart: number;
  guideEnd: number; // 0-based, exclusive
  pamStart: number;
  pamEnd: number; // exclusive
  guideSeq: string;
  pamSeq: string;
}

export function findGuidesForward(seq: string, guideLen: number, pam: string): GuideMeta[] {
  const guides: GuideMeta[] = [];
  const pamLen = pam.length;
  for (let i = 0; i <= seq.length - guideLen - pamLen; i++) {
    const pamSeq = seq.slice(i + guideLen, i + guideLen + pamLen);
    if (pamMatches(pamSeq, pam)) {
      guides.push({
        guideStart: i,
        guideEnd: i + guideLen,
        pamStart: i + guideLen,
        pamEnd: i + guideLen + pamLen,
        guideSeq: seq.slice(i, i + guideLen),
        pamSeq: pamSeq,
      });
    }
  }
  return guides;
}

export interface GuideRow {
  rank: number;
  guideStart: number;
  guideEnd: number;
  guideSeq: string;
  pamPattern: string;
  matchedPam: string;
  gcPercent: number;
  selfComplementarity: number | null;
  offTargetLikeMatches: number | null;
  totalScore: number;
}

export function computeGuideTable(
  seq: string,
  guideLen: number,
  pam: string,
  advanced: boolean = true
): GuideRow[] {
  const rows: GuideRow[] = [];
  const guides = findGuidesForward(seq, guideLen, pam);

  for (const g of guides) {
    const gc = gcContent(g.guideSeq);
    const selfC = advanced ? selfComplementarityScore(g.guideSeq) : null;
    const offT = advanced ? offTargetScore(seq, g.guideSeq, g.guideStart) : null;

    // total heuristic: keep it simple, explainable
    const total =
      Math.abs(gc - 50) / 5 +
      (selfC !== null ? selfC : 0) +
      (offT !== null ? offT * 2 : 0);

    rows.push({
      rank: 0, // filled later
      guideStart: g.guideStart,
      guideEnd: g.guideEnd,
      guideSeq: g.guideSeq,
      pamPattern: pam,
      matchedPam: g.pamSeq,
      gcPercent: Math.round(gc * 100) / 100,
      selfComplementarity: selfC,
      offTargetLikeMatches: offT,
      totalScore: Math.round(total * 100) / 100,
    });
  }

  // Sort by total score ascending (lower is better)
  rows.sort((a, b) => a.totalScore - b.totalScore);

  // Assign ranks
  rows.forEach((r, i) => {
    r.rank = i + 1;
  });

  return rows;
}

export interface PositionType {
  type: "normal" | "guide" | "pam";
}

export function getSequencePositionTypes(
  seq: string,
  guidesMeta: GuideMeta[]
): PositionType[] {
  const pos: PositionType[] = Array(seq.length).fill(null).map(() => ({ type: "normal" }));

  for (const g of guidesMeta) {
    for (let i = Math.max(0, g.guideStart); i < Math.min(seq.length, g.guideEnd); i++) {
      pos[i] = { type: "guide" };
    }
    for (let i = Math.max(0, g.pamStart); i < Math.min(seq.length, g.pamEnd); i++) {
      pos[i] = { type: "pam" };
    }
  }

  return pos;
}

export function sliceContext(
  seq: string,
  guideStart: number,
  guideEnd: number,
  pamEnd: number,
  flank: number = 12
): { context: string; left: number; right: number } {
  const left = Math.max(0, guideStart - flank);
  const right = Math.min(seq.length, pamEnd + flank);
  return {
    context: seq.slice(left, right),
    left,
    right,
  };
}
