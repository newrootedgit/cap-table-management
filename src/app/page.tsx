'use client'

import { useState, useMemo, Fragment, type ReactNode } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  ChevronDown, ChevronRight, TrendingUp, Users, Layers, BarChart3,
} from 'lucide-react'
import {
  getCapTableSummary,
  demoCompany,
  demoOptionPools,
} from '@/lib/demo-data'
import StatusBadge from '@/components/StatusBadge'
import { formatNumber, formatPercent, formatCurrency } from '@/lib/calculations'

const CHART_COLORS = [
  '#7c3aed', '#14b8a6', '#f59e0b', '#ef4444',
  '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4',
]

type ViewMode = 'basic' | 'fully_diluted'

// Custom tooltip for the pie chart
function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { percent: number } }> }) {
  if (!active || !payload || payload.length === 0) return null
  const entry = payload[0]
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3">
      <p className="text-sm font-semibold text-gray-900">{entry.name}</p>
      <p className="text-sm text-gray-600">
        {formatNumber(entry.value)} shares
      </p>
      <p className="text-sm font-medium text-primary-600">
        {formatPercent(entry.payload.percent)}
      </p>
    </div>
  )
}

// Custom legend renderer
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderLegend(props: any) {
  const payload = props?.payload as Array<{ value: string; color?: string }> | undefined
  if (!payload) return null
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-4">
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color ?? '#6b7280' }}
          />
          {entry.value}
        </div>
      ))}
    </div>
  )
}

export default function CapTableDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('basic')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const summary = useMemo(() => getCapTableSummary(), [])

  const optionPoolTotal = demoOptionPools.reduce((sum, p) => sum + p.totalPoolShares, 0)
  const optionPoolIssued = demoOptionPools.reduce((sum, p) => sum + p.issuedShares, 0)
  const optionPoolAvailable = optionPoolTotal - optionPoolIssued

  const isFullyDiluted = viewMode === 'fully_diluted'
  const denominatorTotal = isFullyDiluted ? summary.fullyDiluted : summary.totalOutstanding

  // Pie chart data -- ownership by equity class + options/warrants if fully diluted
  const pieData = useMemo(() => {
    const slices = summary.classSummary.map((cls) => ({
      name: cls.name,
      value: cls.outstandingShares,
      percent: denominatorTotal > 0 ? (cls.outstandingShares / denominatorTotal) * 100 : 0,
    }))

    if (isFullyDiluted) {
      if (summary.totalOptions > 0) {
        slices.push({
          name: 'Unexercised Options',
          value: summary.totalOptions,
          percent: denominatorTotal > 0 ? (summary.totalOptions / denominatorTotal) * 100 : 0,
        })
      }
      if (summary.totalWarrants > 0) {
        slices.push({
          name: 'Warrants',
          value: summary.totalWarrants,
          percent: denominatorTotal > 0 ? (summary.totalWarrants / denominatorTotal) * 100 : 0,
        })
      }
    }

    return slices
  }, [summary, isFullyDiluted, denominatorTotal])

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Summary table rows (security classes + option pool + warrants)
  const summaryTableRows = useMemo(() => {
    const rows: Array<{
      id: string
      name: string
      type: string
      authorized: number
      outstanding: number
      fullyDiluted: number
      pctOwnership: number
    }> = []

    for (const cls of summary.classSummary) {
      rows.push({
        id: cls.id,
        name: cls.name,
        type: cls.type,
        authorized: cls.authorizedShares,
        outstanding: cls.outstandingShares,
        fullyDiluted: cls.fullyDilutedShares,
        pctOwnership: isFullyDiluted ? cls.fullyDilutedPercent : cls.ownershipPercent,
      })
    }

    // Option pool row
    rows.push({
      id: 'option-pool',
      name: 'Employee Option Pool',
      type: 'options',
      authorized: optionPoolTotal,
      outstanding: optionPoolIssued,
      fullyDiluted: summary.totalOptions,
      pctOwnership: denominatorTotal > 0 ? (summary.totalOptions / denominatorTotal) * 100 : 0,
    })

    // Warrants row
    if (summary.totalWarrants > 0) {
      rows.push({
        id: 'warrants',
        name: 'Outstanding Warrants',
        type: 'warrants',
        authorized: summary.totalWarrants,
        outstanding: summary.totalWarrants,
        fullyDiluted: summary.totalWarrants,
        pctOwnership: denominatorTotal > 0 ? (summary.totalWarrants / denominatorTotal) * 100 : 0,
      })
    }

    return rows
  }, [summary, isFullyDiluted, denominatorTotal, optionPoolTotal, optionPoolIssued])

  // Shareholder detail rows sorted by fully diluted desc
  const shareholderRows = useMemo(() => {
    return [...summary.shareholderSummary].sort(
      (a, b) => b.fullyDilutedShares - a.fullyDilutedShares
    )
  }, [summary])

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cap Table</h1>
          <p className="text-sm text-gray-500 mt-1">
            {demoCompany.name} &middot; {demoCompany.state} &middot; Incorporated{' '}
            {new Date(demoCompany.incorporationDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Toggle */}
        <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5">
          <button
            onClick={() => setViewMode('basic')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'basic'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Basic
          </button>
          <button
            onClick={() => setViewMode('fully_diluted')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'fully_diluted'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Fully Diluted
          </button>
        </div>
      </div>

      {/* ── Summary Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Authorized"
          value={formatNumber(summary.totalAuthorized)}
          sub={`Par value: ${formatCurrency(demoCompany.parValue)}`}
          icon={<Layers className="w-5 h-5 text-primary-600" />}
          accent="primary"
        />
        <StatCard
          label="Outstanding Shares"
          value={formatNumber(summary.totalOutstanding)}
          sub={`${formatPercent((summary.totalOutstanding / summary.totalAuthorized) * 100)} of authorized`}
          icon={<BarChart3 className="w-5 h-5 text-teal-600" />}
          accent="teal"
        />
        <StatCard
          label="Available Shares"
          value={formatNumber(summary.available)}
          sub={`${formatNumber(optionPoolAvailable)} in option pool`}
          icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
          accent="amber"
        />
        <StatCard
          label="Fully Diluted Total"
          value={formatNumber(summary.fullyDiluted)}
          sub={`${formatNumber(summary.totalOptions)} options + ${formatNumber(summary.totalWarrants)} warrants`}
          icon={<Users className="w-5 h-5 text-blue-600" />}
          accent="blue"
        />
      </div>

      {/* ── Chart + Security Summary Table ─────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Donut chart */}
        <div className="card xl:col-span-2 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Ownership Breakdown
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            {isFullyDiluted ? 'Fully diluted basis' : 'Outstanding shares only'}
          </p>
          <div className="flex-1 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {pieData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security summary table */}
        <div className="card xl:col-span-3 overflow-hidden p-0">
          <div className="px-6 pt-6 pb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Securities Summary
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Breakdown by security class
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="table-header">Security Class</th>
                  <th className="table-header text-right">Authorized</th>
                  <th className="table-header text-right">Outstanding</th>
                  {isFullyDiluted && (
                    <th className="table-header text-right">Fully Diluted</th>
                  )}
                  <th className="table-header text-right">% Ownership</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {summaryTableRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {row.name}
                        </span>
                        <StatusBadge status={row.type} />
                      </div>
                    </td>
                    <td className="table-cell text-right font-mono text-gray-700">
                      {formatNumber(row.authorized)}
                    </td>
                    <td className="table-cell text-right font-mono text-gray-700">
                      {formatNumber(row.outstanding)}
                    </td>
                    {isFullyDiluted && (
                      <td className="table-cell text-right font-mono text-gray-700">
                        {formatNumber(row.fullyDiluted)}
                      </td>
                    )}
                    <td className="table-cell text-right">
                      <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                        {formatPercent(row.pctOwnership)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td className="table-cell font-semibold text-gray-900">
                    Total
                  </td>
                  <td className="table-cell text-right font-mono font-semibold text-gray-900">
                    {formatNumber(
                      summaryTableRows.reduce((s, r) => s + r.authorized, 0)
                    )}
                  </td>
                  <td className="table-cell text-right font-mono font-semibold text-gray-900">
                    {formatNumber(
                      summaryTableRows.reduce((s, r) => s + r.outstanding, 0)
                    )}
                  </td>
                  {isFullyDiluted && (
                    <td className="table-cell text-right font-mono font-semibold text-gray-900">
                      {formatNumber(
                        summaryTableRows.reduce((s, r) => s + r.fullyDiluted, 0)
                      )}
                    </td>
                  )}
                  <td className="table-cell text-right font-semibold text-gray-900">
                    {formatPercent(
                      summaryTableRows.reduce((s, r) => s + r.pctOwnership, 0)
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ── Shareholder Detail Table ───────────────────────────── */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 pt-6 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Shareholder Details
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {shareholderRows.length} shareholders &middot;{' '}
              {isFullyDiluted ? 'Fully diluted' : 'Basic'} view
            </p>
          </div>
          <button
            onClick={() => {
              if (expandedRows.size === shareholderRows.length) {
                setExpandedRows(new Set())
              } else {
                setExpandedRows(new Set(shareholderRows.map((s) => s.id)))
              }
            }}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            {expandedRows.size === shareholderRows.length
              ? 'Collapse All'
              : 'Expand All'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="table-header w-8" />
                <th className="table-header">Shareholder</th>
                <th className="table-header">Type / Role</th>
                <th className="table-header text-right">Shares</th>
                <th className="table-header text-right">Options</th>
                <th className="table-header text-right">Warrants</th>
                <th className="table-header text-right">
                  {isFullyDiluted ? 'Fully Diluted' : 'Total'}
                </th>
                <th className="table-header text-right">% Ownership</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shareholderRows.map((sh) => {
                const isExpanded = expandedRows.has(sh.id)
                const pctValue = isFullyDiluted
                  ? sh.fullyDilutedPercent
                  : sh.ownershipPercent
                const totalValue = isFullyDiluted
                  ? sh.fullyDilutedShares
                  : sh.totalShares

                return (
                  <Fragment key={sh.id}>
                    <tr
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toggleRow(sh.id)}
                    >
                      <td className="table-cell">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{
                              backgroundColor:
                                sh.type === 'institution'
                                  ? '#7c3aed'
                                  : '#14b8a6',
                            }}
                          >
                            {sh.name
                              .split(' ')
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {sh.name}
                            </p>
                            <p className="text-xs text-gray-500">{sh.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={sh.type} />
                          <StatusBadge status={sh.role} />
                        </div>
                      </td>
                      <td className="table-cell text-right font-mono text-gray-700">
                        {formatNumber(sh.totalShares)}
                      </td>
                      <td className="table-cell text-right font-mono text-gray-700">
                        {sh.totalOptions > 0
                          ? formatNumber(sh.totalOptions)
                          : <span className="text-gray-300">&mdash;</span>}
                      </td>
                      <td className="table-cell text-right font-mono text-gray-700">
                        {sh.totalWarrants > 0
                          ? formatNumber(sh.totalWarrants)
                          : <span className="text-gray-300">&mdash;</span>}
                      </td>
                      <td className="table-cell text-right font-mono font-semibold text-gray-900">
                        {formatNumber(totalValue)}
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5 hidden sm:block">
                            <div
                              className="h-1.5 rounded-full bg-primary-500"
                              style={{
                                width: `${Math.min(pctValue, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="font-semibold text-gray-900 min-w-[60px] text-right">
                            {formatPercent(pctValue)}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr className="bg-gray-50/70">
                        <td />
                        <td colSpan={7} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {/* Shares breakdown */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Equity Holdings
                              </h4>
                              <div className="space-y-2">
                                <DetailLine
                                  label="Direct Shares"
                                  value={formatNumber(sh.totalShares)}
                                />
                                <DetailLine
                                  label="Equity Class"
                                  value={sh.equityClass}
                                />
                                <DetailLine
                                  label="Basic Ownership"
                                  value={formatPercent(sh.ownershipPercent)}
                                />
                              </div>
                            </div>

                            {/* Options & warrants */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Options & Warrants
                              </h4>
                              <div className="space-y-2">
                                <DetailLine
                                  label="Unexercised Options"
                                  value={formatNumber(sh.totalOptions)}
                                />
                                <DetailLine
                                  label="Active Warrants"
                                  value={formatNumber(sh.totalWarrants)}
                                />
                                <DetailLine
                                  label="Total Convertible"
                                  value={formatNumber(
                                    sh.totalOptions + sh.totalWarrants
                                  )}
                                />
                              </div>
                            </div>

                            {/* Fully diluted summary */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Fully Diluted
                              </h4>
                              <div className="space-y-2">
                                <DetailLine
                                  label="Total FD Shares"
                                  value={formatNumber(sh.fullyDilutedShares)}
                                />
                                <DetailLine
                                  label="FD Ownership"
                                  value={formatPercent(
                                    sh.fullyDilutedPercent
                                  )}
                                />
                                <DetailLine
                                  label="FD Value (at last 409A)"
                                  value={formatCurrency(
                                    sh.fullyDilutedShares * 3.5
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td className="table-cell" />
                <td className="table-cell font-semibold text-gray-900">
                  Total ({shareholderRows.length} shareholders)
                </td>
                <td className="table-cell" />
                <td className="table-cell text-right font-mono font-semibold text-gray-900">
                  {formatNumber(
                    shareholderRows.reduce((s, sh) => s + sh.totalShares, 0)
                  )}
                </td>
                <td className="table-cell text-right font-mono font-semibold text-gray-900">
                  {formatNumber(
                    shareholderRows.reduce((s, sh) => s + sh.totalOptions, 0)
                  )}
                </td>
                <td className="table-cell text-right font-mono font-semibold text-gray-900">
                  {formatNumber(
                    shareholderRows.reduce((s, sh) => s + sh.totalWarrants, 0)
                  )}
                </td>
                <td className="table-cell text-right font-mono font-semibold text-gray-900">
                  {formatNumber(
                    isFullyDiluted
                      ? shareholderRows.reduce(
                          (s, sh) => s + sh.fullyDilutedShares,
                          0
                        )
                      : shareholderRows.reduce(
                          (s, sh) => s + sh.totalShares,
                          0
                        )
                  )}
                </td>
                <td className="table-cell text-right font-semibold text-gray-900">
                  {formatPercent(
                    shareholderRows.reduce(
                      (s, sh) =>
                        s +
                        (isFullyDiluted
                          ? sh.fullyDilutedPercent
                          : sh.ownershipPercent),
                      0
                    )
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Helper Components ────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string
  value: string
  sub: string
  icon: ReactNode
  accent: 'primary' | 'teal' | 'amber' | 'blue'
}) {
  const ringColor = {
    primary: 'ring-primary-100',
    teal: 'ring-teal-100',
    amber: 'ring-amber-100',
    blue: 'ring-blue-100',
  }[accent]

  const bgColor = {
    primary: 'bg-primary-50',
    teal: 'bg-teal-50',
    amber: 'bg-amber-50',
    blue: 'bg-blue-50',
  }[accent]

  return (
    <div className="card flex items-start gap-4">
      <div
        className={`w-10 h-10 rounded-lg ${bgColor} ring-1 ${ringColor} flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xl font-bold text-gray-900 mt-0.5 truncate">
          {value}
        </p>
        <p className="text-xs text-gray-500 mt-1">{sub}</p>
      </div>
    </div>
  )
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
