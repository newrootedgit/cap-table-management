'use client'

import { useState } from 'react'
import {
  BarChart3,
  FileText,
  Download,
  ArrowRightLeft,
  Calendar,
  PieChart,
} from 'lucide-react'
import {
  demoShareholders,
  demoEquityClasses,
  demoEquityGrants,
  demoOptionGrants,
  demoVestingPlans,
  demoTransactions,
  getCapTableSummary,
} from '@/lib/demo-data'
import { formatNumber, formatPercent, formatCurrency } from '@/lib/calculations'
import { formatDate } from '@/lib/utils'
import StatusBadge from '@/components/StatusBadge'

type ReportType = 'summary' | 'extended' | 'secondary' | 'vesting'

interface ReportCard {
  id: ReportType
  title: string
  description: string
  icon: typeof BarChart3
}

const reportCards: ReportCard[] = [
  {
    id: 'summary',
    title: 'Summary Cap Table',
    description: 'Ownership breakdown by equity class with shareholder detail and fully-diluted percentages.',
    icon: PieChart,
  },
  {
    id: 'extended',
    title: 'Extended Cap Table',
    description: 'Full cap table with options, warrants, convertibles, and dilution analysis per holder.',
    icon: FileText,
  },
  {
    id: 'secondary',
    title: 'Secondary Transactions',
    description: 'History of share transfers, exercises, and conversions between shareholders.',
    icon: ArrowRightLeft,
  },
  {
    id: 'vesting',
    title: 'Vesting Report',
    description: 'Shareholder vesting progress showing vested, unvested, and upcoming cliff dates.',
    icon: Calendar,
  },
]

function getShareholder(id: string) {
  return demoShareholders.find((s) => s.id === id)
}

function getEquityClass(id: string) {
  return demoEquityClasses.find((c) => c.id === id)
}

function getVestingPlan(id?: string) {
  if (!id) return null
  return demoVestingPlans.find((v) => v.id === id)
}

function computeVestingProgress(grantDate: string, totalMonths: number, cliffMonths: number): { vestedPct: number; monthsElapsed: number } {
  const start = new Date(grantDate)
  const now = new Date()
  const monthsElapsed = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()))
  if (monthsElapsed < cliffMonths) return { vestedPct: 0, monthsElapsed }
  const vestedPct = Math.min(100, (monthsElapsed / totalMonths) * 100)
  return { vestedPct, monthsElapsed }
}

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState<Record<string, string>>({})
  const [dateTo, setDateTo] = useState<Record<string, string>>({})
  const [activeReport, setActiveReport] = useState<ReportType | null>(null)

  const summary = getCapTableSummary()

  function renderSummaryReport() {
    return (
      <div className="space-y-6">
        {/* Class breakdown */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Ownership by Class</h4>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">Class</th>
                    <th className="table-header">Type</th>
                    <th className="table-header text-right">Outstanding</th>
                    <th className="table-header text-right">% Outstanding</th>
                    <th className="table-header text-right">% Fully Diluted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {summary.classSummary.map((cls) => (
                    <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-medium text-gray-900">{cls.name}</td>
                      <td className="table-cell"><StatusBadge status={cls.type} /></td>
                      <td className="table-cell text-right font-medium">{formatNumber(cls.outstandingShares)}</td>
                      <td className="table-cell text-right">{formatPercent(cls.ownershipPercent)}</td>
                      <td className="table-cell text-right">{formatPercent(cls.fullyDilutedPercent)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="table-cell text-gray-900">Total</td>
                    <td className="table-cell" />
                    <td className="table-cell text-right text-gray-900">{formatNumber(summary.totalOutstanding)}</td>
                    <td className="table-cell text-right text-gray-900">100.00%</td>
                    <td className="table-cell text-right text-gray-900">{formatPercent((summary.totalOutstanding / summary.fullyDiluted) * 100)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Shareholder detail */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Shareholder Detail</h4>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">Shareholder</th>
                    <th className="table-header">Role</th>
                    <th className="table-header">Class</th>
                    <th className="table-header text-right">Shares</th>
                    <th className="table-header text-right">Options</th>
                    <th className="table-header text-right">Warrants</th>
                    <th className="table-header text-right">Fully Diluted</th>
                    <th className="table-header text-right">% Ownership</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {summary.shareholderSummary.map((sh) => (
                    <tr key={sh.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">{sh.name}</div>
                        <div className="text-xs text-gray-500">{sh.email}</div>
                      </td>
                      <td className="table-cell"><StatusBadge status={sh.role} /></td>
                      <td className="table-cell text-gray-600">{sh.equityClass}</td>
                      <td className="table-cell text-right font-medium">{formatNumber(sh.totalShares)}</td>
                      <td className="table-cell text-right text-gray-600">{sh.totalOptions > 0 ? formatNumber(sh.totalOptions) : '-'}</td>
                      <td className="table-cell text-right text-gray-600">{sh.totalWarrants > 0 ? formatNumber(sh.totalWarrants) : '-'}</td>
                      <td className="table-cell text-right font-medium text-primary-600">{formatNumber(sh.fullyDilutedShares)}</td>
                      <td className="table-cell text-right font-medium">{formatPercent(sh.fullyDilutedPercent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderExtendedReport() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Authorized</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{formatNumber(summary.totalAuthorized)}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Outstanding</p>
            <p className="mt-1 text-xl font-bold text-primary-600">{formatNumber(summary.totalOutstanding)}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Options (Unvested)</p>
            <p className="mt-1 text-xl font-bold text-accent-600">{formatNumber(summary.totalOptions)}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fully Diluted</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{formatNumber(summary.fullyDiluted)}</p>
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Shareholder</th>
                  <th className="table-header text-right">Common</th>
                  <th className="table-header text-right">Preferred</th>
                  <th className="table-header text-right">Options</th>
                  <th className="table-header text-right">Warrants</th>
                  <th className="table-header text-right">FD Total</th>
                  <th className="table-header text-right">FD %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {summary.shareholderSummary.map((sh) => {
                  const commonGrants = demoEquityGrants.filter(g => g.shareholderId === sh.id && getEquityClass(g.equityClassId)?.type === 'common')
                  const prefGrants = demoEquityGrants.filter(g => g.shareholderId === sh.id && getEquityClass(g.equityClassId)?.type === 'preferred')
                  const commonTotal = commonGrants.reduce((s, g) => s + g.numberOfShares, 0)
                  const prefTotal = prefGrants.reduce((s, g) => s + g.numberOfShares, 0)
                  return (
                    <tr key={sh.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-medium text-gray-900">{sh.name}</td>
                      <td className="table-cell text-right">{commonTotal > 0 ? formatNumber(commonTotal) : '-'}</td>
                      <td className="table-cell text-right">{prefTotal > 0 ? formatNumber(prefTotal) : '-'}</td>
                      <td className="table-cell text-right">{sh.totalOptions > 0 ? formatNumber(sh.totalOptions) : '-'}</td>
                      <td className="table-cell text-right">{sh.totalWarrants > 0 ? formatNumber(sh.totalWarrants) : '-'}</td>
                      <td className="table-cell text-right font-medium text-primary-600">{formatNumber(sh.fullyDilutedShares)}</td>
                      <td className="table-cell text-right font-medium">{formatPercent(sh.fullyDilutedPercent)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  function renderSecondaryReport() {
    return (
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Type</th>
                <th className="table-header">From</th>
                <th className="table-header">To</th>
                <th className="table-header text-right">Shares</th>
                <th className="table-header text-right">Price/Share</th>
                <th className="table-header text-right">Total Value</th>
                <th className="table-header">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {demoTransactions.map((tx) => {
                const from = getShareholder(tx.fromShareholderId)
                const to = tx.toShareholderId ? getShareholder(tx.toShareholderId) : null
                return (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell text-gray-600">{formatDate(tx.date)}</td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                        {tx.type}
                      </span>
                    </td>
                    <td className="table-cell font-medium text-gray-900">{from?.name ?? '-'}</td>
                    <td className="table-cell font-medium text-gray-900">{to?.name ?? '-'}</td>
                    <td className="table-cell text-right font-medium">{formatNumber(tx.numberOfShares)}</td>
                    <td className="table-cell text-right">{formatCurrency(tx.pricePerShare)}</td>
                    <td className="table-cell text-right font-medium text-primary-600">{formatCurrency(tx.numberOfShares * tx.pricePerShare)}</td>
                    <td className="table-cell text-gray-500 text-xs">{tx.notes}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  function renderVestingReport() {
    const vestingRows = demoEquityGrants
      .filter((g) => g.vestingPlanId)
      .map((grant) => {
        const sh = getShareholder(grant.shareholderId)
        const plan = getVestingPlan(grant.vestingPlanId)
        if (!plan) return null
        const { vestedPct, monthsElapsed } = computeVestingProgress(grant.grantDate, plan.totalDurationMonths, plan.cliffMonths)
        const vestedShares = Math.floor((vestedPct / 100) * grant.numberOfShares)
        const unvestedShares = grant.numberOfShares - vestedShares
        const cliffDate = new Date(grant.grantDate)
        cliffDate.setMonth(cliffDate.getMonth() + plan.cliffMonths)
        const pastCliff = monthsElapsed >= plan.cliffMonths
        return { grant, sh, plan, vestedPct, vestedShares, unvestedShares, cliffDate, pastCliff, monthsElapsed }
      })
      .filter(Boolean)

    // Also include option grants with vesting
    const optionVestingRows = demoOptionGrants
      .filter((g) => g.vestingPlanId)
      .map((grant) => {
        const sh = getShareholder(grant.shareholderId)
        const plan = getVestingPlan(grant.vestingPlanId)
        if (!plan) return null
        const { vestedPct, monthsElapsed } = computeVestingProgress(grant.grantDate, plan.totalDurationMonths, plan.cliffMonths)
        const vestedOptions = Math.floor((vestedPct / 100) * grant.numberOfOptions)
        const unvestedOptions = grant.numberOfOptions - vestedOptions
        const cliffDate = new Date(grant.grantDate)
        cliffDate.setMonth(cliffDate.getMonth() + plan.cliffMonths)
        const pastCliff = monthsElapsed >= plan.cliffMonths
        return { grant, sh, plan, vestedPct, vestedOptions, unvestedOptions, cliffDate, pastCliff, monthsElapsed, isOption: true }
      })
      .filter(Boolean)

    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Equity Vesting Progress</h4>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">Shareholder</th>
                    <th className="table-header">Plan</th>
                    <th className="table-header">Grant Date</th>
                    <th className="table-header text-right">Total Shares</th>
                    <th className="table-header text-right">Vested</th>
                    <th className="table-header text-right">Unvested</th>
                    <th className="table-header">Cliff Date</th>
                    <th className="table-header">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vestingRows.map((row) => {
                    if (!row) return null
                    return (
                      <tr key={row.grant.id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-cell font-medium text-gray-900">{row.sh?.name ?? 'Unknown'}</td>
                        <td className="table-cell text-gray-600 text-xs">{row.plan.name}</td>
                        <td className="table-cell text-gray-600">{formatDate(row.grant.grantDate)}</td>
                        <td className="table-cell text-right font-medium">{formatNumber(row.grant.numberOfShares)}</td>
                        <td className="table-cell text-right font-medium text-green-600">{formatNumber(row.vestedShares)}</td>
                        <td className="table-cell text-right text-gray-500">{formatNumber(row.unvestedShares)}</td>
                        <td className="table-cell">
                          <span className={`text-xs font-medium ${row.pastCliff ? 'text-green-600' : 'text-yellow-600'}`}>
                            {formatDate(row.cliffDate)}
                            {row.pastCliff ? ' (passed)' : ' (pending)'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-accent-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(row.vestedPct, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600">{row.vestedPct.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Option Vesting Progress</h4>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">Shareholder</th>
                    <th className="table-header">Plan</th>
                    <th className="table-header">Grant Date</th>
                    <th className="table-header text-right">Total Options</th>
                    <th className="table-header text-right">Vested</th>
                    <th className="table-header text-right">Unvested</th>
                    <th className="table-header">Cliff Date</th>
                    <th className="table-header">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {optionVestingRows.map((row) => {
                    if (!row) return null
                    return (
                      <tr key={row.grant.id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-cell font-medium text-gray-900">{row.sh?.name ?? 'Unknown'}</td>
                        <td className="table-cell text-gray-600 text-xs">{row.plan.name}</td>
                        <td className="table-cell text-gray-600">{formatDate(row.grant.grantDate)}</td>
                        <td className="table-cell text-right font-medium">{formatNumber(row.grant.numberOfOptions)}</td>
                        <td className="table-cell text-right font-medium text-green-600">{formatNumber(row.vestedOptions)}</td>
                        <td className="table-cell text-right text-gray-500">{formatNumber(row.unvestedOptions)}</td>
                        <td className="table-cell">
                          <span className={`text-xs font-medium ${row.pastCliff ? 'text-green-600' : 'text-yellow-600'}`}>
                            {formatDate(row.cliffDate)}
                            {row.pastCliff ? ' (passed)' : ' (pending)'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-primary-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(row.vestedPct, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600">{row.vestedPct.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderReport() {
    switch (activeReport) {
      case 'summary': return renderSummaryReport()
      case 'extended': return renderExtendedReport()
      case 'secondary': return renderSecondaryReport()
      case 'vesting': return renderVestingReport()
      default: return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate and export cap table reports, transaction histories, and vesting summaries.
        </p>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportCards.map((report) => {
          const Icon = report.icon
          const isActive = activeReport === report.id
          return (
            <div
              key={report.id}
              className={`card hover:shadow-md transition-all ${isActive ? 'ring-2 ring-primary-500 border-primary-200' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-primary-100' : 'bg-gray-100'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{report.description}</p>

                  {/* Date filters */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">From</label>
                      <input
                        type="date"
                        className="input-field text-xs"
                        value={dateFrom[report.id] || ''}
                        onChange={(e) => setDateFrom({ ...dateFrom, [report.id]: e.target.value })}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">To</label>
                      <input
                        type="date"
                        className="input-field text-xs"
                        value={dateTo[report.id] || ''}
                        onChange={(e) => setDateTo({ ...dateTo, [report.id]: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setActiveReport(report.id)}
                      className="btn-primary text-sm flex items-center gap-1.5"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      Generate PDF
                    </button>
                    <button className="btn-secondary text-sm flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Report Preview */}
      {activeReport && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Report Preview: {reportCards.find((r) => r.id === activeReport)?.title}
            </h2>
            <button
              onClick={() => setActiveReport(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close Preview
            </button>
          </div>
          {renderReport()}
        </div>
      )}
    </div>
  )
}
