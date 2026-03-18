// Demo data for the application when no database is connected.
// This allows the app to work on Vercel without a database for demonstration purposes.

export const demoCompany = {
  id: 'demo-company',
  name: 'TechVentures Inc.',
  incorporationDate: '2023-01-15',
  state: 'Delaware',
  country: 'US',
  authorizedCommon: 10000000,
  authorizedPreferred: 5000000,
  parValue: 0.0001,
  fiscalYearEnd: '12/31',
  industry: 'Technology',
}

export const demoShareholders = [
  { id: 'sh-1', name: 'Alice Chen', email: 'alice@techventures.com', type: 'individual', role: 'founder', shares: 4000000, equityClass: 'Common' },
  { id: 'sh-2', name: 'Bob Martinez', email: 'bob@techventures.com', type: 'individual', role: 'founder', shares: 3000000, equityClass: 'Common' },
  { id: 'sh-3', name: 'Carol Davis', email: 'carol@techventures.com', type: 'individual', role: 'employee', shares: 500000, equityClass: 'Common' },
  { id: 'sh-4', name: 'Sequoia Capital', email: 'deals@sequoiacap.com', type: 'institution', role: 'investor', shares: 1500000, equityClass: 'Series A Preferred' },
  { id: 'sh-5', name: 'a16z', email: 'deals@a16z.com', type: 'institution', role: 'investor', shares: 2000000, equityClass: 'Series B Preferred' },
  { id: 'sh-6', name: 'Dave Wilson', email: 'dave@techventures.com', type: 'individual', role: 'employee', shares: 200000, equityClass: 'Common' },
  { id: 'sh-7', name: 'Emily Park', email: 'emily@techventures.com', type: 'individual', role: 'advisor', shares: 100000, equityClass: 'Common' },
  { id: 'sh-8', name: 'First Round Capital', email: 'invest@firstround.com', type: 'institution', role: 'investor', shares: 800000, equityClass: 'Series A Preferred' },
]

export const demoEquityClasses = [
  { id: 'ec-1', name: 'Common', type: 'common', authorizedShares: 10000000, parValue: 0.0001, votingRights: true, liquidationPreference: 0, liquidationMultiple: 0, participatingPreferred: false, conversionRatio: 1, antidilutionProtection: 'none', seniorityLevel: 0 },
  { id: 'ec-2', name: 'Series A Preferred', type: 'preferred', authorizedShares: 2500000, parValue: 1.0, votingRights: true, liquidationPreference: 1.0, liquidationMultiple: 1.0, participatingPreferred: false, conversionRatio: 1, antidilutionProtection: 'broad_weighted_avg', seniorityLevel: 1 },
  { id: 'ec-3', name: 'Series B Preferred', type: 'preferred', authorizedShares: 2500000, parValue: 3.5, votingRights: true, liquidationPreference: 1.0, liquidationMultiple: 1.0, participatingPreferred: true, conversionRatio: 1, antidilutionProtection: 'broad_weighted_avg', seniorityLevel: 2 },
]

export const demoEquityGrants = [
  { id: 'eg-1', equityClassId: 'ec-1', shareholderId: 'sh-1', grantDate: '2023-01-15', numberOfShares: 4000000, pricePerShare: 0.0001, status: 'active', certificateNumber: 'CS-001' },
  { id: 'eg-2', equityClassId: 'ec-1', shareholderId: 'sh-2', grantDate: '2023-01-15', numberOfShares: 3000000, pricePerShare: 0.0001, status: 'active', certificateNumber: 'CS-002' },
  { id: 'eg-3', equityClassId: 'ec-1', shareholderId: 'sh-3', grantDate: '2023-06-01', numberOfShares: 500000, pricePerShare: 0.10, status: 'active', vestingPlanId: 'vp-1', certificateNumber: 'CS-003' },
  { id: 'eg-4', equityClassId: 'ec-2', shareholderId: 'sh-4', grantDate: '2024-03-15', numberOfShares: 1500000, pricePerShare: 1.0, status: 'active', certificateNumber: 'PA-001' },
  { id: 'eg-5', equityClassId: 'ec-3', shareholderId: 'sh-5', grantDate: '2025-06-01', numberOfShares: 2000000, pricePerShare: 3.5, status: 'active', certificateNumber: 'PB-001' },
  { id: 'eg-6', equityClassId: 'ec-1', shareholderId: 'sh-6', grantDate: '2024-01-15', numberOfShares: 200000, pricePerShare: 0.50, status: 'active', vestingPlanId: 'vp-1', certificateNumber: 'CS-004' },
  { id: 'eg-7', equityClassId: 'ec-1', shareholderId: 'sh-7', grantDate: '2024-06-01', numberOfShares: 100000, pricePerShare: 0.50, status: 'active', vestingPlanId: 'vp-2', certificateNumber: 'CS-005' },
  { id: 'eg-8', equityClassId: 'ec-2', shareholderId: 'sh-8', grantDate: '2024-03-15', numberOfShares: 800000, pricePerShare: 1.0, status: 'active', certificateNumber: 'PA-002' },
]

export const demoOptionPools = [
  { id: 'op-1', name: '2023 Equity Incentive Plan', totalPoolShares: 2000000, issuedShares: 850000, equityClassOnExerciseId: 'ec-1', boardApprovalDate: '2023-01-15' },
]

export const demoOptionGrants = [
  { id: 'og-1', optionPoolId: 'op-1', shareholderId: 'sh-3', grantDate: '2023-09-01', numberOfOptions: 300000, exercisePrice: 0.25, vestingPlanId: 'vp-1', expirationDate: '2033-09-01', status: 'active', exercisedShares: 0 },
  { id: 'og-2', optionPoolId: 'op-1', shareholderId: 'sh-6', grantDate: '2024-03-01', numberOfOptions: 400000, exercisePrice: 0.50, vestingPlanId: 'vp-1', expirationDate: '2034-03-01', status: 'active', exercisedShares: 50000 },
  { id: 'og-3', optionPoolId: 'op-1', shareholderId: 'sh-7', grantDate: '2024-09-01', numberOfOptions: 150000, exercisePrice: 0.75, vestingPlanId: 'vp-2', expirationDate: '2034-09-01', status: 'active', exercisedShares: 0 },
]

export const demoWarrants = [
  { id: 'w-1', shareholderId: 'sh-4', grantDate: '2024-03-15', numberOfShares: 200000, exercisePrice: 1.25, expirationDate: '2029-03-15', equityClassOnExerciseId: 'ec-1', status: 'active' },
  { id: 'w-2', shareholderId: 'sh-8', grantDate: '2024-03-15', numberOfShares: 100000, exercisePrice: 1.25, expirationDate: '2029-03-15', equityClassOnExerciseId: 'ec-1', status: 'active' },
]

export const demoConvertibles = [
  { id: 'ci-1', shareholderId: 'sh-4', instrumentType: 'SAFE', instrumentName: 'Pre-Seed SAFE', issueDate: '2023-06-01', principalAmount: 250000, interestRate: null, valuationCap: 5000000, discountPercent: 20, maturityDate: null, conversionBasis: 'post_money', status: 'converted' },
  { id: 'ci-2', shareholderId: 'sh-8', instrumentType: 'convertible_note', instrumentName: 'Bridge Note', issueDate: '2023-09-01', principalAmount: 150000, interestRate: 5, valuationCap: 8000000, discountPercent: 15, maturityDate: '2025-09-01', conversionBasis: 'pre_money', status: 'outstanding' },
]

export const demoVestingPlans = [
  { id: 'vp-1', name: '4yr / 1yr Cliff (Monthly)', totalDurationMonths: 48, cliffMonths: 12, vestingFrequency: 'monthly', accelerationTrigger: 'none' },
  { id: 'vp-2', name: '2yr / 6mo Cliff (Quarterly)', totalDurationMonths: 24, cliffMonths: 6, vestingFrequency: 'quarterly', accelerationTrigger: 'single_trigger' },
  { id: 'vp-3', name: '3yr / 1yr Cliff (Monthly)', totalDurationMonths: 36, cliffMonths: 12, vestingFrequency: 'monthly', accelerationTrigger: 'double_trigger' },
]

export const demoTransactions = [
  { id: 'tx-1', type: 'exercise', fromShareholderId: 'sh-6', date: '2025-01-15', numberOfShares: 50000, pricePerShare: 0.50, notes: 'Partial option exercise' },
  { id: 'tx-2', type: 'transfer', fromShareholderId: 'sh-1', toShareholderId: 'sh-7', date: '2024-12-01', numberOfShares: 25000, pricePerShare: 0.75, notes: 'Advisory grant secondary' },
  { id: 'tx-3', type: 'conversion', fromShareholderId: 'sh-4', date: '2024-03-15', numberOfShares: 250000, pricePerShare: 1.0, notes: 'Pre-Seed SAFE conversion at Series A' },
]

export const demoTimeline = [
  { id: 'te-1', action: 'Company Incorporated', description: 'TechVentures Inc. incorporated in Delaware', date: '2023-01-15', entityType: 'company' },
  { id: 'te-2', action: 'Founder Shares Issued', description: '7,000,000 common shares issued to founders', date: '2023-01-15', entityType: 'equity_grant' },
  { id: 'te-3', action: 'Option Pool Created', description: '2023 Equity Incentive Plan - 2,000,000 shares', date: '2023-01-15', entityType: 'option_pool' },
  { id: 'te-4', action: 'SAFE Issued', description: '$250K Pre-Seed SAFE to Sequoia Capital', date: '2023-06-01', entityType: 'convertible' },
  { id: 'te-5', action: 'Employee Grant', description: '500,000 common shares to Carol Davis', date: '2023-06-01', entityType: 'equity_grant' },
  { id: 'te-6', action: 'Options Granted', description: '300,000 options to Carol Davis @ $0.25', date: '2023-09-01', entityType: 'option_grant' },
  { id: 'te-7', action: 'Series A Closed', description: '$2.3M Series A round led by Sequoia Capital', date: '2024-03-15', entityType: 'equity_grant' },
  { id: 'te-8', action: 'SAFE Converted', description: 'Pre-Seed SAFE converted to Series A shares', date: '2024-03-15', entityType: 'transaction' },
  { id: 'te-9', action: 'Warrants Issued', description: '300,000 warrants to Series A investors', date: '2024-03-15', entityType: 'warrant' },
  { id: 'te-10', action: 'Series B Closed', description: '$7M Series B round led by a16z', date: '2025-06-01', entityType: 'equity_grant' },
  { id: 'te-11', action: 'Option Exercise', description: 'Dave Wilson exercised 50,000 options', date: '2025-01-15', entityType: 'transaction' },
]

export const demoValuations = [
  { id: 'v-1', effectiveDate: '2023-01-15', fairMarketValue: 0.0001, method: 'Par Value', notes: 'Incorporation FMV' },
  { id: 'v-2', effectiveDate: '2023-08-01', fairMarketValue: 0.25, method: '409A - Option Pricing Method', notes: 'Post pre-seed' },
  { id: 'v-3', effectiveDate: '2024-03-15', fairMarketValue: 1.0, method: '409A - Backsolve Method', notes: 'Series A pricing' },
  { id: 'v-4', effectiveDate: '2025-06-01', fairMarketValue: 3.5, method: '409A - Backsolve Method', notes: 'Series B pricing' },
]

// ─── Aggregated data for cap table ──────────────────────────

export function getCapTableSummary() {
  const totalOutstanding = demoEquityGrants.reduce((sum, g) => sum + g.numberOfShares, 0)
  const totalOptions = demoOptionGrants.reduce((sum, g) => sum + (g.numberOfOptions - g.exercisedShares), 0)
  const totalWarrants = demoWarrants.filter(w => w.status === 'active').reduce((sum, w) => sum + w.numberOfShares, 0)
  const totalConvertible = demoConvertibles.filter(c => c.status === 'outstanding').reduce((sum, c) => sum + Math.floor(c.principalAmount / 1), 0) // simplified
  const fullyDiluted = totalOutstanding + totalOptions + totalWarrants

  const classSummary = demoEquityClasses.map(ec => {
    const grants = demoEquityGrants.filter(g => g.equityClassId === ec.id)
    const outstanding = grants.reduce((sum, g) => sum + g.numberOfShares, 0)
    return {
      ...ec,
      outstandingShares: outstanding,
      fullyDilutedShares: outstanding,
      ownershipPercent: totalOutstanding > 0 ? (outstanding / totalOutstanding) * 100 : 0,
      fullyDilutedPercent: fullyDiluted > 0 ? (outstanding / fullyDiluted) * 100 : 0,
    }
  })

  const shareholderSummary = demoShareholders.map(sh => {
    const grants = demoEquityGrants.filter(g => g.shareholderId === sh.id)
    const totalShares = grants.reduce((sum, g) => sum + g.numberOfShares, 0)
    const options = demoOptionGrants.filter(g => g.shareholderId === sh.id)
    const totalOptionsHeld = options.reduce((sum, g) => sum + (g.numberOfOptions - g.exercisedShares), 0)
    const warrants = demoWarrants.filter(w => w.shareholderId === sh.id && w.status === 'active')
    const totalWarrantsHeld = warrants.reduce((sum, w) => sum + w.numberOfShares, 0)
    return {
      ...sh,
      totalShares,
      totalOptions: totalOptionsHeld,
      totalWarrants: totalWarrantsHeld,
      fullyDilutedShares: totalShares + totalOptionsHeld + totalWarrantsHeld,
      ownershipPercent: totalOutstanding > 0 ? (totalShares / totalOutstanding) * 100 : 0,
      fullyDilutedPercent: fullyDiluted > 0 ? ((totalShares + totalOptionsHeld + totalWarrantsHeld) / fullyDiluted) * 100 : 0,
    }
  })

  return {
    totalAuthorized: demoCompany.authorizedCommon + demoCompany.authorizedPreferred,
    totalOutstanding,
    totalOptions,
    totalWarrants,
    totalConvertible,
    fullyDiluted,
    available: (demoCompany.authorizedCommon + demoCompany.authorizedPreferred) - totalOutstanding,
    classSummary,
    shareholderSummary,
  }
}
