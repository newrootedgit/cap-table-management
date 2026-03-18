import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.vestingEvent.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.agreement.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.optionGrant.deleteMany()
  await prisma.equityGrant.deleteMany()
  await prisma.optionPool.deleteMany()
  await prisma.warrant.deleteMany()
  await prisma.convertibleInstrument.deleteMany()
  await prisma.vestingPlan.deleteMany()
  await prisma.equityClass.deleteMany()
  await prisma.shareholder.deleteMany()
  await prisma.timelineEvent.deleteMany()
  await prisma.valuation.deleteMany()
  await prisma.boardResolution.deleteMany()
  await prisma.template.deleteMany()
  await prisma.document.deleteMany()
  await prisma.folder.deleteMany()
  await prisma.company.deleteMany()

  console.log('Cleaned existing data')

  // Create company
  const company = await prisma.company.create({
    data: {
      id: 'demo-company',
      name: 'TechVentures Inc.',
      incorporationDate: new Date('2023-01-15'),
      state: 'Delaware',
      country: 'US',
      authorizedCommon: 10000000,
      authorizedPreferred: 5000000,
      parValue: 0.0001,
      fiscalYearEnd: '12/31',
      industry: 'Technology',
      address: '123 Innovation Blvd, San Francisco, CA 94105',
    },
  })
  console.log(`Created company: ${company.name}`)

  // Create equity classes
  const common = await prisma.equityClass.create({
    data: {
      id: 'ec-1',
      companyId: company.id,
      name: 'Common',
      type: 'common',
      authorizedShares: 10000000,
      parValue: 0.0001,
      votingRights: true,
      liquidationPreference: 0,
      liquidationMultiple: 0,
      participatingPreferred: false,
      conversionRatio: 1,
      antidilutionProtection: 'none',
      seniorityLevel: 0,
    },
  })

  const seriesA = await prisma.equityClass.create({
    data: {
      id: 'ec-2',
      companyId: company.id,
      name: 'Series A Preferred',
      type: 'preferred',
      authorizedShares: 2500000,
      parValue: 1.0,
      votingRights: true,
      liquidationPreference: 1.0,
      liquidationMultiple: 1.0,
      participatingPreferred: false,
      conversionRatio: 1,
      antidilutionProtection: 'broad_weighted_avg',
      seniorityLevel: 1,
    },
  })

  const seriesB = await prisma.equityClass.create({
    data: {
      id: 'ec-3',
      companyId: company.id,
      name: 'Series B Preferred',
      type: 'preferred',
      authorizedShares: 2500000,
      parValue: 3.5,
      votingRights: true,
      liquidationPreference: 1.0,
      liquidationMultiple: 1.0,
      participatingPreferred: true,
      conversionRatio: 1,
      antidilutionProtection: 'broad_weighted_avg',
      seniorityLevel: 2,
    },
  })
  console.log('Created equity classes')

  // Create shareholders
  const shareholders = await Promise.all([
    prisma.shareholder.create({
      data: { id: 'sh-1', companyId: company.id, name: 'Alice Chen', email: 'alice@techventures.com', type: 'individual', role: 'founder', accessLevel: 'manage' },
    }),
    prisma.shareholder.create({
      data: { id: 'sh-2', companyId: company.id, name: 'Bob Martinez', email: 'bob@techventures.com', type: 'individual', role: 'founder', accessLevel: 'manage' },
    }),
    prisma.shareholder.create({
      data: { id: 'sh-3', companyId: company.id, name: 'Carol Davis', email: 'carol@techventures.com', type: 'individual', role: 'employee', accessLevel: 'view' },
    }),
    prisma.shareholder.create({
      data: { id: 'sh-4', companyId: company.id, name: 'Sequoia Capital', email: 'deals@sequoiacap.com', type: 'institution', role: 'investor', isCompany: true, accessLevel: 'view' },
    }),
    prisma.shareholder.create({
      data: { id: 'sh-5', companyId: company.id, name: 'a16z', email: 'deals@a16z.com', type: 'institution', role: 'investor', isCompany: true, accessLevel: 'view' },
    }),
    prisma.shareholder.create({
      data: { id: 'sh-6', companyId: company.id, name: 'Dave Wilson', email: 'dave@techventures.com', type: 'individual', role: 'employee', accessLevel: 'view' },
    }),
    prisma.shareholder.create({
      data: { id: 'sh-7', companyId: company.id, name: 'Emily Park', email: 'emily@techventures.com', type: 'individual', role: 'advisor', accessLevel: 'view' },
    }),
    prisma.shareholder.create({
      data: { id: 'sh-8', companyId: company.id, name: 'First Round Capital', email: 'invest@firstround.com', type: 'institution', role: 'investor', isCompany: true, accessLevel: 'view' },
    }),
  ])
  console.log(`Created ${shareholders.length} shareholders`)

  // Create vesting plans
  const vp1 = await prisma.vestingPlan.create({
    data: { id: 'vp-1', companyId: company.id, name: '4yr / 1yr Cliff (Monthly)', totalDurationMonths: 48, cliffMonths: 12, vestingFrequency: 'monthly', accelerationTrigger: 'none' },
  })
  const vp2 = await prisma.vestingPlan.create({
    data: { id: 'vp-2', companyId: company.id, name: '2yr / 6mo Cliff (Quarterly)', totalDurationMonths: 24, cliffMonths: 6, vestingFrequency: 'quarterly', accelerationTrigger: 'single_trigger' },
  })
  await prisma.vestingPlan.create({
    data: { id: 'vp-3', companyId: company.id, name: '3yr / 1yr Cliff (Monthly)', totalDurationMonths: 36, cliffMonths: 12, vestingFrequency: 'monthly', accelerationTrigger: 'double_trigger' },
  })
  console.log('Created vesting plans')

  // Create equity grants
  await Promise.all([
    prisma.equityGrant.create({
      data: { id: 'eg-1', companyId: company.id, equityClassId: common.id, shareholderId: 'sh-1', grantDate: new Date('2023-01-15'), numberOfShares: 4000000, pricePerShare: 0.0001, status: 'active', certificateNumber: 'CS-001', boardApprovalDate: new Date('2023-01-15') },
    }),
    prisma.equityGrant.create({
      data: { id: 'eg-2', companyId: company.id, equityClassId: common.id, shareholderId: 'sh-2', grantDate: new Date('2023-01-15'), numberOfShares: 3000000, pricePerShare: 0.0001, status: 'active', certificateNumber: 'CS-002', boardApprovalDate: new Date('2023-01-15') },
    }),
    prisma.equityGrant.create({
      data: { id: 'eg-3', companyId: company.id, equityClassId: common.id, shareholderId: 'sh-3', grantDate: new Date('2023-06-01'), numberOfShares: 500000, pricePerShare: 0.10, status: 'active', vestingPlanId: vp1.id, certificateNumber: 'CS-003' },
    }),
    prisma.equityGrant.create({
      data: { id: 'eg-4', companyId: company.id, equityClassId: seriesA.id, shareholderId: 'sh-4', grantDate: new Date('2024-03-15'), numberOfShares: 1500000, pricePerShare: 1.0, status: 'active', certificateNumber: 'PA-001', boardApprovalDate: new Date('2024-03-10') },
    }),
    prisma.equityGrant.create({
      data: { id: 'eg-5', companyId: company.id, equityClassId: seriesB.id, shareholderId: 'sh-5', grantDate: new Date('2025-06-01'), numberOfShares: 2000000, pricePerShare: 3.5, status: 'active', certificateNumber: 'PB-001', boardApprovalDate: new Date('2025-05-28') },
    }),
    prisma.equityGrant.create({
      data: { id: 'eg-6', companyId: company.id, equityClassId: common.id, shareholderId: 'sh-6', grantDate: new Date('2024-01-15'), numberOfShares: 200000, pricePerShare: 0.50, status: 'active', vestingPlanId: vp1.id, certificateNumber: 'CS-004' },
    }),
    prisma.equityGrant.create({
      data: { id: 'eg-7', companyId: company.id, equityClassId: common.id, shareholderId: 'sh-7', grantDate: new Date('2024-06-01'), numberOfShares: 100000, pricePerShare: 0.50, status: 'active', vestingPlanId: vp2.id, certificateNumber: 'CS-005' },
    }),
    prisma.equityGrant.create({
      data: { id: 'eg-8', companyId: company.id, equityClassId: seriesA.id, shareholderId: 'sh-8', grantDate: new Date('2024-03-15'), numberOfShares: 800000, pricePerShare: 1.0, status: 'active', certificateNumber: 'PA-002', boardApprovalDate: new Date('2024-03-10') },
    }),
  ])
  console.log('Created equity grants')

  // Create option pool
  const optionPool = await prisma.optionPool.create({
    data: { id: 'op-1', companyId: company.id, name: '2023 Equity Incentive Plan', totalPoolShares: 2000000, issuedShares: 850000, equityClassOnExerciseId: common.id, boardApprovalDate: new Date('2023-01-15') },
  })

  // Create option grants
  await Promise.all([
    prisma.optionGrant.create({
      data: { id: 'og-1', companyId: company.id, optionPoolId: optionPool.id, shareholderId: 'sh-3', grantDate: new Date('2023-09-01'), numberOfOptions: 300000, exercisePrice: 0.25, vestingPlanId: vp1.id, expirationDate: new Date('2033-09-01'), status: 'active', exercisedShares: 0 },
    }),
    prisma.optionGrant.create({
      data: { id: 'og-2', companyId: company.id, optionPoolId: optionPool.id, shareholderId: 'sh-6', grantDate: new Date('2024-03-01'), numberOfOptions: 400000, exercisePrice: 0.50, vestingPlanId: vp1.id, expirationDate: new Date('2034-03-01'), status: 'active', exercisedShares: 50000 },
    }),
    prisma.optionGrant.create({
      data: { id: 'og-3', companyId: company.id, optionPoolId: optionPool.id, shareholderId: 'sh-7', grantDate: new Date('2024-09-01'), numberOfOptions: 150000, exercisePrice: 0.75, vestingPlanId: vp2.id, expirationDate: new Date('2034-09-01'), status: 'active', exercisedShares: 0 },
    }),
  ])
  console.log('Created option pool and grants')

  // Create warrants
  await Promise.all([
    prisma.warrant.create({
      data: { id: 'w-1', companyId: company.id, shareholderId: 'sh-4', grantDate: new Date('2024-03-15'), numberOfShares: 200000, exercisePrice: 1.25, expirationDate: new Date('2029-03-15'), equityClassOnExerciseId: common.id, status: 'active' },
    }),
    prisma.warrant.create({
      data: { id: 'w-2', companyId: company.id, shareholderId: 'sh-8', grantDate: new Date('2024-03-15'), numberOfShares: 100000, exercisePrice: 1.25, expirationDate: new Date('2029-03-15'), equityClassOnExerciseId: common.id, status: 'active' },
    }),
  ])
  console.log('Created warrants')

  // Create convertible instruments
  await Promise.all([
    prisma.convertibleInstrument.create({
      data: { id: 'ci-1', companyId: company.id, shareholderId: 'sh-4', instrumentType: 'SAFE', instrumentName: 'Pre-Seed SAFE', issueDate: new Date('2023-06-01'), principalAmount: 250000, valuationCap: 5000000, discountPercent: 20, conversionBasis: 'post_money', status: 'converted' },
    }),
    prisma.convertibleInstrument.create({
      data: { id: 'ci-2', companyId: company.id, shareholderId: 'sh-8', instrumentType: 'convertible_note', instrumentName: 'Bridge Note', issueDate: new Date('2023-09-01'), principalAmount: 150000, interestRate: 5, valuationCap: 8000000, discountPercent: 15, maturityDate: new Date('2025-09-01'), conversionBasis: 'pre_money', status: 'outstanding' },
    }),
  ])
  console.log('Created convertible instruments')

  // Create transactions
  await Promise.all([
    prisma.transaction.create({
      data: { id: 'tx-1', companyId: company.id, type: 'exercise', fromShareholderId: 'sh-6', date: new Date('2025-01-15'), numberOfShares: 50000, pricePerShare: 0.50, notes: 'Partial option exercise', optionGrantId: 'og-2' },
    }),
    prisma.transaction.create({
      data: { id: 'tx-2', companyId: company.id, type: 'transfer', fromShareholderId: 'sh-1', toShareholderId: 'sh-7', date: new Date('2024-12-01'), numberOfShares: 25000, pricePerShare: 0.75, notes: 'Advisory grant secondary', boardApprovalDate: new Date('2024-11-28') },
    }),
    prisma.transaction.create({
      data: { id: 'tx-3', companyId: company.id, type: 'conversion', fromShareholderId: 'sh-4', date: new Date('2024-03-15'), numberOfShares: 250000, pricePerShare: 1.0, notes: 'Pre-Seed SAFE conversion at Series A', convertibleId: 'ci-1' },
    }),
  ])
  console.log('Created transactions')

  // Create timeline events
  const timelineEvents = [
    { action: 'Company Incorporated', description: 'TechVentures Inc. incorporated in Delaware', date: new Date('2023-01-15'), entityType: 'company' },
    { action: 'Founder Shares Issued', description: '7,000,000 common shares issued to founders', date: new Date('2023-01-15'), entityType: 'equity_grant' },
    { action: 'Option Pool Created', description: '2023 Equity Incentive Plan - 2,000,000 shares', date: new Date('2023-01-15'), entityType: 'option_pool' },
    { action: 'SAFE Issued', description: '$250K Pre-Seed SAFE to Sequoia Capital', date: new Date('2023-06-01'), entityType: 'convertible' },
    { action: 'Employee Grant', description: '500,000 common shares to Carol Davis', date: new Date('2023-06-01'), entityType: 'equity_grant' },
    { action: 'Options Granted', description: '300,000 options to Carol Davis @ $0.25', date: new Date('2023-09-01'), entityType: 'option_grant' },
    { action: 'Series A Closed', description: '$2.3M Series A round led by Sequoia Capital', date: new Date('2024-03-15'), entityType: 'equity_grant' },
    { action: 'SAFE Converted', description: 'Pre-Seed SAFE converted to Series A shares', date: new Date('2024-03-15'), entityType: 'transaction' },
    { action: 'Warrants Issued', description: '300,000 warrants to Series A investors', date: new Date('2024-03-15'), entityType: 'warrant' },
    { action: 'Series B Closed', description: '$7M Series B round led by a16z', date: new Date('2025-06-01'), entityType: 'equity_grant' },
    { action: 'Option Exercise', description: 'Dave Wilson exercised 50,000 options', date: new Date('2025-01-15'), entityType: 'transaction' },
  ]
  await prisma.timelineEvent.createMany({
    data: timelineEvents.map((e, i) => ({ id: `te-${i + 1}`, companyId: company.id, ...e })),
  })
  console.log('Created timeline events')

  // Create valuations
  await prisma.valuation.createMany({
    data: [
      { id: 'v-1', companyId: company.id, effectiveDate: new Date('2023-01-15'), fairMarketValue: 0.0001, method: 'Par Value', notes: 'Incorporation FMV' },
      { id: 'v-2', companyId: company.id, effectiveDate: new Date('2023-08-01'), fairMarketValue: 0.25, method: '409A - Option Pricing Method', notes: 'Post pre-seed' },
      { id: 'v-3', companyId: company.id, effectiveDate: new Date('2024-03-15'), fairMarketValue: 1.0, method: '409A - Backsolve Method', notes: 'Series A pricing' },
      { id: 'v-4', companyId: company.id, effectiveDate: new Date('2025-06-01'), fairMarketValue: 3.5, method: '409A - Backsolve Method', notes: 'Series B pricing' },
    ],
  })
  console.log('Created valuations')

  // Create board resolutions
  await prisma.boardResolution.createMany({
    data: [
      { companyId: company.id, title: 'Incorporation & Initial Share Issuance', date: new Date('2023-01-15'), description: 'Approved incorporation and issuance of founder shares', status: 'approved' },
      { companyId: company.id, title: '2023 Equity Incentive Plan', date: new Date('2023-01-15'), description: 'Approved creation of 2,000,000 share option pool', status: 'approved' },
      { companyId: company.id, title: 'Series A Financing', date: new Date('2024-03-10'), description: 'Approved Series A preferred stock financing of $2.3M', status: 'approved' },
      { companyId: company.id, title: 'Series B Financing', date: new Date('2025-05-28'), description: 'Approved Series B preferred stock financing of $7M', status: 'approved' },
    ],
  })
  console.log('Created board resolutions')

  console.log('\nSeed complete!')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
