'use client'

import { useState, useMemo } from 'react'
import {
  Calculator, TrendingUp, PieChart as PieChartIcon, DollarSign,
  Users, Briefcase, RefreshCw, Info, ChevronRight
} from 'lucide-react'
import { demoConvertibles, demoShareholders, demoEquityGrants, getCapTableSummary } from '@/lib/demo-data'
import { modelRound, formatCurrency, formatNumber, formatPercent, type RoundModelInput, type RoundModelOutput } from '@/lib/calculations'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#7c3aed', '#14b8a6', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981']

export default function RoundModelingPage() {
  const summary = useMemo(() => getCapTableSummary(), [])

  const [preMoneyValuation, setPreMoneyValuation] = useState(40000000)
  const [investmentAmount, setInvestmentAmount] = useState(10000000)
  const [optionPoolPercent, setOptionPoolPercent] = useState(15)
  const [includedConvertibles, setIncludedConvertibles] = useState<Record<string, boolean>>(
    Object.fromEntries(demoConvertibles.filter(c => c.status === 'outstanding').map(c => [c.id, true]))
  )
  const [result, setResult] = useState<RoundModelOutput | null>(null)
  const [calculated, setCalculated] = useState(false)

  const existingShares = summary.totalOutstanding

  const toggleConvertible = (id: string) => {
    setIncludedConvertibles(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCalculate = () => {
    const convertibles = demoConvertibles
      .filter(c => includedConvertibles[c.id])
      .map(c => {
        const issueDate = new Date(c.issueDate)
        const now = new Date()
        const daysElapsed = Math.floor((now.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24))
        return {
          principal: c.principalAmount,
          interestRate: c.interestRate || 0,
          daysElapsed,
          valuationCap: c.valuationCap,
          discountPercent: c.discountPercent,
        }
      })

    const input: RoundModelInput = {
      preMoneyValuation,
      investmentAmount,
      existingShares,
      optionPoolPercent,
      convertibles,
    }

    setResult(modelRound(input))
    setCalculated(true)
  }

  const pieData = useMemo(() => {
    if (!result) return []
    return [
      { name: 'Existing Holders', value: result.existingOwnership, shares: existingShares },
      { name: 'New Investor', value: result.investorOwnership, shares: result.newSharesIssued },
      { name: 'Option Pool', value: result.optionPoolOwnership, shares: result.optionPoolShares },
      ...(result.convertedShares > 0
        ? [{ name: 'Converted Notes', value: result.convertedOwnership, shares: result.convertedShares }]
        : []),
    ]
  }, [result, existingShares])

  const ownershipRows = useMemo(() => {
    if (!result) return []
    const rows = [
      { name: 'Existing Shareholders', shares: existingShares, percent: result.existingOwnership, color: COLORS[0] },
      { name: 'New Investor', shares: result.newSharesIssued, percent: result.investorOwnership, color: COLORS[1] },
      { name: 'Option Pool (Post-Round)', shares: result.optionPoolShares, percent: result.optionPoolOwnership, color: COLORS[2] },
    ]
    if (result.convertedShares > 0) {
      rows.push({ name: 'Converted Instruments', shares: result.convertedShares, percent: result.convertedOwnership, color: COLORS[3] })
    }
    return rows
  }, [result, existingShares])

  const formatVal = (val: number) => {
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`
    return formatCurrency(val)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Round Modeling</h1>
        <p className="text-sm text-gray-500 mt-1">Model the impact of a new funding round on ownership and dilution.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Form - Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Valuation Inputs */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-primary-600" />
              <h2 className="text-base font-semibold text-gray-900">Round Parameters</h2>
            </div>

            <div>
              <label className="label">Pre-Money Valuation</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  value={preMoneyValuation}
                  onChange={e => { setPreMoneyValuation(Number(e.target.value)); setCalculated(false) }}
                  className="input-field pl-7"
                  step={1000000}
                />
              </div>
              <span className="text-xs text-gray-400 mt-1 block">{formatVal(preMoneyValuation)}</span>
            </div>

            <div>
              <label className="label">Investment Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={e => { setInvestmentAmount(Number(e.target.value)); setCalculated(false) }}
                  className="input-field pl-7"
                  step={1000000}
                />
              </div>
              <span className="text-xs text-gray-400 mt-1 block">{formatVal(investmentAmount)}</span>
            </div>

            <div>
              <label className="label">Existing Outstanding Shares</label>
              <div className="relative">
                <input
                  type="number"
                  value={existingShares}
                  readOnly
                  className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <span className="text-xs text-gray-400 mt-1 block">Pre-filled from current cap table</span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label mb-0">Post-Money Option Pool</label>
                <span className="text-sm font-semibold text-primary-600">{optionPoolPercent}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={20}
                step={0.5}
                value={optionPoolPercent}
                onChange={e => { setOptionPoolPercent(Number(e.target.value)); setCalculated(false) }}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-600 mt-2"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10%</span>
                <span>15%</span>
                <span>20%</span>
              </div>
            </div>
          </div>

          {/* Convertibles */}
          <div className="card space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-semibold text-gray-900">Convertible Instruments</h2>
            </div>
            <p className="text-xs text-gray-500">Select instruments to include in conversion at this round.</p>

            {demoConvertibles.map(c => {
              const sh = demoShareholders.find(s => s.id === c.shareholderId)
              const checked = includedConvertibles[c.id] || false
              return (
                <label
                  key={c.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    checked ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => { toggleConvertible(c.id); setCalculated(false) }}
                    className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{c.instrumentName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.status === 'outstanding' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {sh?.name} &middot; {formatCurrency(c.principalAmount)}
                      {c.valuationCap ? ` &middot; ${formatVal(c.valuationCap)} cap` : ''}
                      {c.discountPercent ? ` &middot; ${c.discountPercent}% discount` : ''}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
          >
            <Calculator className="w-5 h-5" />
            Calculate Round
          </button>
        </div>

        {/* Output - Right Column */}
        <div className="lg:col-span-3 space-y-5">
          {!calculated ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Configure Your Round</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Set the pre-money valuation, investment amount, and option pool, then click Calculate to see the impact.
              </p>
            </div>
          ) : result && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
                  <p className="text-sm font-medium text-primary-200">Pre-Money Valuation</p>
                  <p className="text-2xl font-bold mt-1">{formatVal(result.preMoneyValuation)}</p>
                </div>
                <div className="card bg-gradient-to-br from-accent-500 to-accent-700 text-white">
                  <p className="text-sm font-medium text-accent-200">Post-Money Valuation</p>
                  <p className="text-2xl font-bold mt-1">{formatVal(result.postMoneyValuation)}</p>
                </div>
                <div className="card">
                  <p className="text-sm font-medium text-gray-500">Price per Share</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(result.pricePerShare)}</p>
                </div>
                <div className="card">
                  <p className="text-sm font-medium text-gray-500">New Shares Issued</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(result.newSharesIssued)}</p>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <PieChartIcon className="w-5 h-5 text-primary-600" />
                  <h3 className="text-base font-semibold text-gray-900">Post-Round Ownership</h3>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                        labelLine={true}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string, props: { payload?: { shares?: number } }) => [
                          `${value.toFixed(2)}% (${formatNumber(props.payload?.shares || 0)} shares)`,
                          name,
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Ownership Table */}
              <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-600" />
                    <h3 className="text-base font-semibold text-gray-900">Ownership Breakdown</h3>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="table-header">Holder</th>
                        <th className="table-header text-right">Shares</th>
                        <th className="table-header text-right">Ownership %</th>
                        <th className="table-header">Visual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ownershipRows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />
                              <span className="font-medium text-gray-900">{row.name}</span>
                            </div>
                          </td>
                          <td className="table-cell text-right font-mono">{formatNumber(row.shares)}</td>
                          <td className="table-cell text-right font-mono font-medium">{formatPercent(row.percent)}</td>
                          <td className="table-cell">
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{ width: `${row.percent}%`, backgroundColor: row.color }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td className="table-cell text-gray-900">Total</td>
                        <td className="table-cell text-right font-mono">{formatNumber(result.totalPostRoundShares)}</td>
                        <td className="table-cell text-right font-mono">100.00%</td>
                        <td className="table-cell" />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Additional Details */}
              {result.convertedShares > 0 && (
                <div className="card bg-amber-50 border-amber-200">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900">Convertible Impact</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        {formatNumber(result.convertedShares)} shares issued from convertible instrument conversions
                        at a price of {formatCurrency(result.pricePerShare)} per share.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
