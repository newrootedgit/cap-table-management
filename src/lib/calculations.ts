// ─── Ownership Calculations ─────────────────────────────────
export function basicOwnership(shareholderShares: number, totalOutstanding: number): number {
  if (totalOutstanding === 0) return 0
  return (shareholderShares / totalOutstanding) * 100
}

export function fullyDilutedOwnership(
  outstandingShares: number,
  vestedOptions: number,
  warrantShares: number,
  convertedNoteShares: number,
  fullyDilutedTotal: number
): number {
  if (fullyDilutedTotal === 0) return 0
  const total = outstandingShares + vestedOptions + warrantShares + convertedNoteShares
  return (total / fullyDilutedTotal) * 100
}

// ─── SAFE Conversion (Post-Money) ───────────────────────────
export function safeConversion(
  principal: number,
  valuationCap: number | null,
  discountPercent: number | null,
  pricePerShare: number,
  fullyDilutedCapitalization: number
): number {
  const shares: number[] = []

  if (valuationCap && fullyDilutedCapitalization > 0) {
    const capPrice = valuationCap / fullyDilutedCapitalization
    shares.push(principal / capPrice)
  }

  if (discountPercent) {
    const discountPrice = pricePerShare * (1 - discountPercent / 100)
    if (discountPrice > 0) shares.push(principal / discountPrice)
  }

  if (shares.length === 0 && pricePerShare > 0) {
    return principal / pricePerShare
  }

  return Math.max(...shares, 0)
}

// ─── Convertible Note Conversion ────────────────────────────
export function convertibleNoteConversion(
  principal: number,
  annualRate: number,
  daysElapsed: number,
  valuationCap: number | null,
  discountPercent: number | null,
  roundPrice: number,
  preMoneyCapitalization: number
): { conversionShares: number; accruedInterest: number; totalConverting: number } {
  const accruedInterest = principal * (annualRate / 100) * (daysElapsed / 365)
  const totalConverting = principal + accruedInterest

  const prices: number[] = []

  if (valuationCap && preMoneyCapitalization > 0) {
    prices.push(valuationCap / preMoneyCapitalization)
  }

  if (discountPercent) {
    prices.push(roundPrice * (1 - discountPercent / 100))
  }

  const conversionPrice = prices.length > 0 ? Math.min(...prices) : roundPrice
  const conversionShares = conversionPrice > 0 ? totalConverting / conversionPrice : 0

  return { conversionShares: Math.floor(conversionShares), accruedInterest, totalConverting }
}

// ─── Vesting Calculation ────────────────────────────────────
export function calculateVesting(
  totalShares: number,
  totalMonths: number,
  cliffMonths: number,
  monthsElapsed: number
): number {
  if (monthsElapsed < cliffMonths) return 0

  const cliffShares = Math.floor(totalShares * (cliffMonths / totalMonths))
  const postCliffMonths = monthsElapsed - cliffMonths
  const monthlyVest = totalShares / totalMonths
  const vested = cliffShares + Math.floor(postCliffMonths * monthlyVest)

  return Math.min(vested, totalShares)
}

export function generateVestingSchedule(
  totalShares: number,
  totalMonths: number,
  cliffMonths: number,
  grantDate: Date,
  frequency: 'monthly' | 'quarterly' | 'annually' = 'monthly'
): Array<{ date: Date; sharesVested: number; cumulativeVested: number }> {
  const schedule: Array<{ date: Date; sharesVested: number; cumulativeVested: number }> = []
  const step = frequency === 'monthly' ? 1 : frequency === 'quarterly' ? 3 : 12
  let prevVested = 0

  for (let month = step; month <= totalMonths; month += step) {
    const vested = calculateVesting(totalShares, totalMonths, cliffMonths, month)
    if (vested > prevVested) {
      const date = new Date(grantDate)
      date.setMonth(date.getMonth() + month)
      schedule.push({
        date,
        sharesVested: vested - prevVested,
        cumulativeVested: vested,
      })
      prevVested = vested
    }
  }

  return schedule
}

// ─── Round Modeling ─────────────────────────────────────────
export interface RoundModelInput {
  preMoneyValuation: number
  investmentAmount: number
  existingShares: number
  optionPoolPercent: number
  convertibles: Array<{
    principal: number
    interestRate: number
    daysElapsed: number
    valuationCap: number | null
    discountPercent: number | null
  }>
}

export interface RoundModelOutput {
  preMoneyValuation: number
  postMoneyValuation: number
  pricePerShare: number
  newSharesIssued: number
  convertedShares: number
  optionPoolShares: number
  totalPostRoundShares: number
  investorOwnership: number
  existingOwnership: number
  optionPoolOwnership: number
  convertedOwnership: number
}

export function modelRound(input: RoundModelInput): RoundModelOutput {
  const { preMoneyValuation, investmentAmount, existingShares, optionPoolPercent, convertibles } = input

  const postMoneyValuation = preMoneyValuation + investmentAmount
  const pricePerShare = existingShares > 0 ? preMoneyValuation / existingShares : 1

  // Convert convertibles
  let totalConvertedShares = 0
  for (const c of convertibles) {
    const { conversionShares } = convertibleNoteConversion(
      c.principal, c.interestRate, c.daysElapsed,
      c.valuationCap, c.discountPercent,
      pricePerShare, existingShares
    )
    totalConvertedShares += conversionShares
  }

  const newSharesIssued = pricePerShare > 0 ? Math.floor(investmentAmount / pricePerShare) : 0
  const prePoolTotal = existingShares + totalConvertedShares + newSharesIssued
  const optionPoolShares = Math.floor(prePoolTotal * (optionPoolPercent / 100) / (1 - optionPoolPercent / 100))
  const totalPostRoundShares = prePoolTotal + optionPoolShares

  return {
    preMoneyValuation,
    postMoneyValuation,
    pricePerShare,
    newSharesIssued,
    convertedShares: totalConvertedShares,
    optionPoolShares,
    totalPostRoundShares,
    investorOwnership: totalPostRoundShares > 0 ? (newSharesIssued / totalPostRoundShares) * 100 : 0,
    existingOwnership: totalPostRoundShares > 0 ? (existingShares / totalPostRoundShares) * 100 : 0,
    optionPoolOwnership: totalPostRoundShares > 0 ? (optionPoolShares / totalPostRoundShares) * 100 : 0,
    convertedOwnership: totalPostRoundShares > 0 ? (totalConvertedShares / totalPostRoundShares) * 100 : 0,
  }
}

// ─── Waterfall Analysis ─────────────────────────────────────
export interface WaterfallInput {
  exitValue: number
  transactionFees: number
  uncoveredDebt: number
  preferredTiers: Array<{
    name: string
    shares: number
    liquidationPreference: number
    liquidationMultiple: number
    participating: boolean
    conversionRatio: number
  }>
  commonShares: number
  commonHolders: Array<{ name: string; shares: number }>
}

export interface WaterfallOutput {
  netExitValue: number
  distributions: Array<{
    name: string
    payout: number
    shares: number
    pricePerShare: number
    roi: number
  }>
  commonPricePerShare: number
}

export function calculateWaterfall(input: WaterfallInput): WaterfallOutput {
  let remaining = input.exitValue - input.transactionFees - input.uncoveredDebt
  const distributions: WaterfallOutput['distributions'] = []

  const totalCommon = input.commonShares + input.preferredTiers.reduce(
    (sum, t) => sum + t.shares * t.conversionRatio, 0
  )

  // Pay preferred tiers (senior → junior by order)
  for (const tier of input.preferredTiers) {
    const preference = tier.liquidationPreference * tier.liquidationMultiple * tier.shares
    const asConverted = totalCommon > 0
      ? (remaining * (tier.shares * tier.conversionRatio) / totalCommon)
      : 0

    let payout: number
    if (tier.participating) {
      const prefPayout = Math.min(preference, remaining)
      remaining -= prefPayout
      const participationShare = totalCommon > 0
        ? (remaining * (tier.shares * tier.conversionRatio) / totalCommon)
        : 0
      payout = prefPayout + participationShare
      remaining -= participationShare
    } else {
      payout = Math.max(Math.min(preference, remaining), asConverted)
      remaining -= Math.min(payout, remaining)
    }

    distributions.push({
      name: tier.name,
      payout,
      shares: tier.shares,
      pricePerShare: tier.shares > 0 ? payout / tier.shares : 0,
      roi: tier.liquidationPreference > 0
        ? payout / (tier.liquidationPreference * tier.shares)
        : 0,
    })
  }

  // Distribute remainder to common
  const commonPricePerShare = input.commonShares > 0 ? remaining / input.commonShares : 0

  for (const holder of input.commonHolders) {
    const payout = holder.shares * commonPricePerShare
    distributions.push({
      name: holder.name,
      payout,
      shares: holder.shares,
      pricePerShare: commonPricePerShare,
      roi: 0,
    })
  }

  return {
    netExitValue: input.exitValue - input.transactionFees - input.uncoveredDebt,
    distributions,
    commonPricePerShare,
  }
}

// ─── Formatting Utilities ───────────────────────────────────
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercent(pct: number): string {
  return `${pct.toFixed(2)}%`
}
