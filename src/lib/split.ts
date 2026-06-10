export type SplitMode = 'equal' | 'custom'
export type ShareUnit = '%' | 'thb'

export interface ShareInput {
  value: number
  unit: ShareUnit
}

export interface Share extends ShareInput {
  amount: number
}

export interface AmountChangeDetail {
  amount: number
  totalAmount: number
  noOfPeople: number
  mode?: SplitMode
  shares?: Share[]
  balanced?: boolean
}

// One satang of float/rounding drift tolerated when checking balance.
export const EPSILON = 0.01

export const round2 = (n: number) => Math.round(n * 100) / 100

export function computeShares(total: number, rows: ShareInput[]): Share[] {
  const shares = rows.map((r) => ({
    ...r,
    amount: round2(r.unit === '%' ? (r.value / 100) * total : r.value),
  }))
  // Within EPSILON, the last person absorbs the remainder so amounts sum
  // exactly to the total (e.g. 33.33% x 3 of 100 -> last pays 33.34).
  const sum = shares.reduce((s, x) => s + x.amount, 0)
  const diff = round2(total - sum)
  if (diff !== 0 && Math.abs(diff) <= EPSILON && shares.length > 0) {
    const last = shares[shares.length - 1]
    last.amount = round2(last.amount + diff)
  }
  return shares
}

export function remainingOf(total: number, shares: Share[]) {
  const sum = shares.reduce((s, x) => s + x.amount, 0)
  const remaining = round2(total - sum)
  return {
    remaining,
    remainingPct: total > 0 ? round2((remaining / total) * 100) : 0,
    balanced: total > 0 && Math.abs(remaining) <= EPSILON,
  }
}
