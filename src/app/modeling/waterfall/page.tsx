'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  TrendingUp, DollarSign, Calculator, BarChart3, Table2, Info, Layers
} from 'lucide-react'
import { demoEquityClasses, demoShareholders, demoEquityGrants, getCapTableSummary } from '@/lib/demo-data'
import {
  calculateWaterfall, formatCurrency, formatNumber, formatPercent,
  type WaterfallInput, type WaterfallOutput
} from '@/lib/calculations'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid
} from 'recharts'

const COLORS = ['#7c3aed', '#8b5cf6', '#14b8a6', '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4', '#10b981', '#f97316', '#a855f7']
const PRESET_VALUES = [10_000_000, 25_000_000, 50_000_000, 100_000_000, 250_000_000, 500_000_000]

function formatShort(val: number): string {
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(0)}M`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`
  return `$${val}`
}

export default function WaterfallPage() {
  const summary = useMemo(() => getCapTableSummary(), [])

  const [exitValue, setExitValue] = useState(100_000_000)
  const [transactionFees, setTransactionFees] = useState(2)
  const [uncoveredDebt, setUncoveredDebt] = useState(0)
  const [result, setResult] = useState<WaterfallOutput | null>(null)
  const [calculated, setCalculated] = useState(false)

  // Auto-populate preferred tiers from demo data
  const preferredTiers = useMemo(() => {
    return demoEquityClasses
      .filter(ec => ec.type === 'preferred')
      .sort((a, b) => b.seniorityLevel - a.seniorityLevel)
      .map(ec => {
        const grants = demoEquityGrants.filter(g => g.equityClassId === ec.id)
        const totalShares = grants.reduce((sum, g) => sum + g.numberOfShares, 0)
        return {
          name: ec.name,
          shares: totalShares,
          liquidationPreference: ec.parValue,
          liquidationMultiple: ec.liquidationMultiple,
          participating: ec.participatingPreferred,
          conversionRatio: ec.conversionRatio,
        }
      })
  }, [])

  // Auto-populate common holders
  const commonHolders = useMemo(() => {
    return demoShareholders
      .filter(s => s.equityClass === 'Common')
      .map(s => ({ name: s.name, shares: s.shares }))
  }, [])

  const totalCommonShares = useMemo(() => {
    return commonHolders.reduce((sum, h) => sum + h.shares, 0)
  }, [commonHolders])

  const buildInput = useCallback((exit: number): WaterfallInput => ({
    exitValue: exit,
    transactionFees: exit * (transactionFees / 100),
    uncoveredDebt,
    preferredTiers,
    commonShares: totalCommonShares,
    commonHolders,
  }), [transactionFees, uncoveredDebt, preferredTiers, totalCommonShares, commonHolders])

  const handleCalculate = () => {
    setResult(calculateWaterfall(buildInput(exitValue)))
    setCalculated(true)
  }

  // Sensitivity table - payouts at multiple exit values
  const sensitivityData = useMemo(() => {
    if (!calculated) return []
    return PRESET_VALUES.map(ev => {
      const r = calculateWaterfall(buildInput(ev))
      const row: Record<string, string | number> = { exitValue: ev, exitLabel: formatShort(ev) }
      r.distributions.forEach(d => {
        row[d.name] = d.payout
      })
      row['Net Proceeds'] = r.netExitValue
      return row
    })
  }, [calculated, buildInput])

  // Stacked bar chart data
  const barChartData = useMemo(() => {
    if (!calculated) return []
    return PRESET_VALUES.map(ev => {
      const r = calculateWaterfall(buildInput(ev))
      const entry: Record<string, string | number> = { name: formatShort(ev) }
      r.distributions.forEach(d => {
        entry[d.name] = Math.round(d.payout)
      })
      return entry
    })
  }, [calculated, buildInput])

  // Unique distribution names for chart series
  const distributionNames = useMemo(() => {
    if (!result) return []
    return result.distributions.map(d => d.name)
  }, [result])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Waterfall Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">Model how exit proceeds are distributed across shareholders based on liquidation preferences.</p>
      </div>

      {/* Input Form */}
      <div className="card space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-5 h-5 text-primary-600" />
          <h2 className="text-base font-semibold text-gray-900">Exit Scenario</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-3">
            <label className="label">Exit Value</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_VALUES.map(val => (
                <button
                  key={val}
                  onClick={() => { setExitValue(val); setCalculated(false) }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    exitValue === val
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {formatShort(val)}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                value={exitValue}
                onChange={e => { setExitValue(Number(e.target.value)); setCalculated(false) }}
                className="input-field pl-7"
                step={1000000}
              />
            </div>
          </div>

          <div>
            <label className="label">Transaction Fees %</label>
            <div className="relative">
              <input
                type="number"
                value={transactionFees}
                onChange={e => { setTransactionFees(Number(e.target.value)); setCalculated(false) }}
                className="input-field pr-8"
                step={0.5}
                min={0}
                max={100}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">{formatCurrency(exitValue * transactionFees / 100)} in fees</span>
          </div>

          <div>
            <label className="label">Uncovered Debt</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                value={uncoveredDebt}
                onChange={e => { setUncoveredDebt(Number(e.target.value)); setCalculated(false) }}
                className="input-field pl-7"
                step={100000}
              />
            </div>
          </div>

          <div className="flex items-end">
            <button onClick={handleCalculate} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
              <Calculator className="w-4 h-4" />
              Calculate Waterfall
            </button>
          </div>
        </div>
      </div>

      {/* Preferred Tiers (auto-populated) */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-semibold text-gray-900">Liquidation Preference Stack</h3>
            <span className="text-xs text-gray-400">(auto-populated from equity classes)</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">Tier / Class</th>
                <th className="table-header text-right">Shares</th>
                <th className="table-header text-right">Liq. Pref ($/share)</th>
                <th className="table-header text-right">Multiple</th>
                <th className="table-header text-center">Participating</th>
                <th className="table-header text-right">Total Preference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {preferredTiers.map((tier, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="font-medium text-gray-900">{tier.name}</span>
                    </div>
                  </td>
                  <td className="table-cell text-right font-mono">{formatNumber(tier.shares)}</td>
                  <td className="table-cell text-right font-mono">{formatCurrency(tier.liquidationPreference)}</td>
                  <td className="table-cell text-right font-mono">{tier.liquidationMultiple}x</td>
                  <td className="table-cell text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      tier.participating ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tier.participating ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="table-cell text-right font-mono font-medium">
                    {formatCurrency(tier.liquidationPreference * tier.liquidationMultiple * tier.shares)}
                  </td>
                </tr>
              ))}
              <tr className="hover:bg-gray-50">
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span className="font-medium text-gray-900">Common Shareholders</span>
                  </div>
                </td>
                <td className="table-cell text-right font-mono">{formatNumber(totalCommonShares)}</td>
                <td className="table-cell text-right text-gray-400">&mdash;</td>
                <td className="table-cell text-right text-gray-400">&mdash;</td>
                <td className="table-cell text-center text-gray-400">&mdash;</td>
                <td className="table-cell text-right text-gray-400">&mdash;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Results */}
      {!calculated ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Ready to Analyze</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Set an exit value and parameters above, then click Calculate to see how proceeds flow through the waterfall.
          </p>
        </div>
      ) : result && (
        <>
          {/* Net Proceeds Banner */}
          <div className="card bg-gradient-to-r from-primary-600 to-primary-800 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm font-medium text-primary-200">Exit Value</p>
                <p className="text-2xl font-bold">{formatCurrency(exitValue)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary-200">Net Distributable Proceeds</p>
                <p className="text-2xl font-bold">{formatCurrency(result.netExitValue)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary-200">Common Price/Share</p>
                <p className="text-2xl font-bold">{formatCurrency(result.commonPricePerShare)}</p>
              </div>
            </div>
          </div>

          {/* Stacked Bar Chart */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <h3 className="text-base font-semibold text-gray-900">Distribution by Exit Value</h3>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(val: number) => formatShort(val)}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                    labelFormatter={(label: string) => `Exit: ${label}`}
                  />
                  <Legend />
                  {distributionNames.map((name, i) => (
                    <Bar
                      key={name}
                      dataKey={name}
                      stackId="waterfall"
                      fill={COLORS[i % COLORS.length]}
                      radius={i === distributionNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Table */}
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Table2 className="w-5 h-5 text-primary-600" />
                <h3 className="text-base font-semibold text-gray-900">
                  Distribution Detail @ {formatShort(exitValue)} Exit
                </h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">Tier / Holder</th>
                    <th className="table-header text-right">Payout</th>
                    <th className="table-header text-right">Price / Share</th>
                    <th className="table-header text-right">ROI</th>
                    <th className="table-header">Distribution Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.distributions.map((d, i) => {
                    const pctOfTotal = result.netExitValue > 0 ? (d.payout / result.netExitValue) * 100 : 0
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="font-medium text-gray-900">{d.name}</span>
                          </div>
                        </td>
                        <td className="table-cell text-right font-mono font-medium">{formatCurrency(d.payout)}</td>
                        <td className="table-cell text-right font-mono">{formatCurrency(d.pricePerShare)}</td>
                        <td className="table-cell text-right">
                          {d.roi > 0 ? (
                            <span className={`font-mono font-medium ${d.roi >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                              {d.roi.toFixed(2)}x
                            </span>
                          ) : (
                            <span className="text-gray-400">&mdash;</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(pctOfTotal, 100)}%`, backgroundColor: COLORS[i % COLORS.length] }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-12 text-right">{pctOfTotal.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="table-cell text-gray-900">Total Distributed</td>
                    <td className="table-cell text-right font-mono">
                      {formatCurrency(result.distributions.reduce((s, d) => s + d.payout, 0))}
                    </td>
                    <td className="table-cell" />
                    <td className="table-cell" />
                    <td className="table-cell" />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sensitivity Table */}
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-semibold text-gray-900">Sensitivity Analysis</h3>
                <span className="text-xs text-gray-400">Payouts across multiple exit values</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">Exit Value</th>
                    <th className="table-header text-right">Net Proceeds</th>
                    {distributionNames.map((name, i) => (
                      <th key={name} className="table-header text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          {name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sensitivityData.map((row, i) => {
                    const isSelected = row.exitValue === exitValue
                    return (
                      <tr key={i} className={isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'}>
                        <td className="table-cell">
                          <span className={`font-medium ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                            {row.exitLabel as string}
                          </span>
                          {isSelected && (
                            <span className="ml-2 px-1.5 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                              Selected
                            </span>
                          )}
                        </td>
                        <td className="table-cell text-right font-mono font-medium">{formatCurrency(row['Net Proceeds'] as number)}</td>
                        {distributionNames.map(name => (
                          <td key={name} className="table-cell text-right font-mono">
                            {formatCurrency((row[name] as number) || 0)}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info callout */}
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900">How the Waterfall Works</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Proceeds are distributed top-down: transaction fees and debt are deducted first, then
                  preferred shareholders receive their liquidation preference (senior tiers first).
                  Participating preferred holders receive their preference plus a pro-rata share of remaining proceeds.
                  Non-participating preferred holders receive the greater of their preference or their as-converted common share.
                  Remaining proceeds are distributed pro-rata to common shareholders.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
