'use client'

import { useState } from 'react'
import {
  DollarSign,
  Plus,
  TrendingUp,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import Modal from '@/components/Modal'
import { demoValuations } from '@/lib/demo-data'
import { formatCurrency } from '@/lib/calculations'
import { formatDate } from '@/lib/utils'

export default function ValuationPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newValuation, setNewValuation] = useState({
    effectiveDate: '',
    fairMarketValue: '',
    method: '409A - Option Pricing Method',
    notes: '',
  })

  // Sort valuations by date
  const sorted = [...demoValuations].sort(
    (a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime()
  )
  const current = sorted[sorted.length - 1]

  // Chart data
  const chartData = sorted.map((v) => ({
    date: formatDate(v.effectiveDate),
    fmv: v.fairMarketValue,
  }))

  // Calculate days since last valuation
  const daysSinceLast = Math.floor(
    (Date.now() - new Date(current.effectiveDate).getTime()) / (1000 * 60 * 60 * 24)
  )
  const isStale = daysSinceLast > 365

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">409A Valuation</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track fair market value history and manage 409A valuations for option pricing.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Valuation
        </button>
      </div>

      {/* Current FMV Card */}
      <div className="card bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
              Current Fair Market Value
            </p>
            <p className="mt-2 text-4xl font-bold text-gray-900">
              {formatCurrency(current.fairMarketValue)}
            </p>
            <p className="text-sm text-gray-500 mt-1">per share</p>
          </div>
          <div className="text-right">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-2">
              <DollarSign className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-primary-200/50 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">Effective Date</p>
            <p className="text-sm font-semibold text-gray-900">{formatDate(current.effectiveDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Method</p>
            <p className="text-sm font-semibold text-gray-900">{current.method}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Days Since Valuation</p>
            <div className="flex items-center gap-1.5">
              <p className={`text-sm font-semibold ${isStale ? 'text-red-600' : 'text-gray-900'}`}>{daysSinceLast}</p>
              {isStale && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
            </div>
          </div>
        </div>
        {isStale && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-700">
              This valuation is over 12 months old. A new 409A valuation should be obtained before issuing new option grants.
            </p>
          </div>
        )}
      </div>

      {/* Note */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
        <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          All option grants should reference the active 409A valuation as the floor for exercise price. The exercise price must be at or above the current FMV to avoid Section 409A penalties.
        </p>
      </div>

      {/* FMV Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">FMV History</h2>
            <p className="text-sm text-gray-500">Fair market value per share over time</p>
          </div>
          <TrendingUp className="w-5 h-5 text-accent-500" />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  fontSize: '13px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'FMV/Share']}
              />
              <Line
                type="monotone"
                dataKey="fmv"
                stroke="#7c3aed"
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Valuation History Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Valuation History</h2>
          <span className="text-sm text-gray-500">{sorted.length} valuation{sorted.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Effective Date</th>
                  <th className="table-header text-right">FMV / Share</th>
                  <th className="table-header">Method</th>
                  <th className="table-header">Notes</th>
                  <th className="table-header text-right">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...sorted].reverse().map((val, idx) => {
                  const reverseSorted = [...sorted].reverse()
                  const prev = idx < reverseSorted.length - 1 ? reverseSorted[idx + 1] : null
                  const change = prev ? ((val.fairMarketValue - prev.fairMarketValue) / prev.fairMarketValue) * 100 : null
                  const isCurrent = val.id === current.id
                  return (
                    <tr key={val.id} className={`hover:bg-gray-50 transition-colors ${isCurrent ? 'bg-primary-50/30' : ''}`}>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{formatDate(val.effectiveDate)}</span>
                          {isCurrent && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-100 text-primary-700 uppercase">
                              Current
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="table-cell text-right font-semibold text-primary-600">{formatCurrency(val.fairMarketValue)}</td>
                      <td className="table-cell">
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                          {val.method}
                        </span>
                      </td>
                      <td className="table-cell text-gray-500 text-sm">{val.notes}</td>
                      <td className="table-cell text-right">
                        {change !== null ? (
                          <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">--</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Valuation Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Valuation" size="md">
        <form
          onSubmit={(e) => { e.preventDefault(); setShowAddModal(false) }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Effective Date</label>
              <input
                type="date"
                className="input-field"
                value={newValuation.effectiveDate}
                onChange={(e) => setNewValuation({ ...newValuation, effectiveDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Fair Market Value ($/share)</label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                placeholder="3.50"
                value={newValuation.fairMarketValue}
                onChange={(e) => setNewValuation({ ...newValuation, fairMarketValue: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Valuation Method</label>
            <select
              className="select-field"
              value={newValuation.method}
              onChange={(e) => setNewValuation({ ...newValuation, method: e.target.value })}
            >
              <option value="409A - Option Pricing Method">409A OPM (Option Pricing Method)</option>
              <option value="409A - Backsolve Method">409A Backsolve</option>
              <option value="409A - Market Comparable">409A Market Comparable</option>
              <option value="Par Value">Par Value</option>
            </select>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Context for this valuation..."
              value={newValuation.notes}
              onChange={(e) => setNewValuation({ ...newValuation, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Add Valuation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
