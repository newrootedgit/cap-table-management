'use client'

import { useState, useMemo } from 'react'
import {
  ScrollText,
  Plus,
  TrendingUp,
  Hash,
  DollarSign,
} from 'lucide-react'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import {
  demoWarrants,
  demoShareholders,
  demoEquityClasses,
} from '@/lib/demo-data'
import { formatNumber, formatCurrency } from '@/lib/calculations'
import { formatDate } from '@/lib/utils'

function getShareholder(id: string) {
  return demoShareholders.find((s) => s.id === id)
}

function getEquityClass(id: string) {
  return demoEquityClasses.find((c) => c.id === id)
}

export default function WarrantsPage() {
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [newWarrant, setNewWarrant] = useState({
    shareholderId: '',
    numberOfShares: '',
    exercisePrice: '',
    grantDate: '',
    expirationDate: '',
    equityClassOnExerciseId: '',
  })

  // Summary calculations
  const stats = useMemo(() => {
    const active = demoWarrants.filter((w) => w.status === 'active')
    const totalActive = active.length
    const totalShares = active.reduce((sum, w) => sum + w.numberOfShares, 0)
    const avgExercisePrice =
      totalActive > 0
        ? active.reduce((sum, w) => sum + w.exercisePrice, 0) / totalActive
        : 0

    return { totalActive, totalShares, avgExercisePrice }
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warrants</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track outstanding warrants, exercise prices, and expiration dates.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Issue Warrant
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-start gap-4">
          <div className="p-2.5 bg-primary-50 rounded-lg">
            <Hash className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Warrants
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {stats.totalActive}
            </p>
          </div>
        </div>
        <div className="card flex items-start gap-4">
          <div className="p-2.5 bg-accent-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-accent-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Shares
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatNumber(stats.totalShares)}
            </p>
          </div>
        </div>
        <div className="card flex items-start gap-4">
          <div className="p-2.5 bg-yellow-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Avg Exercise Price
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatCurrency(stats.avgExercisePrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Warrants Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            All Warrants
          </h2>
          <span className="text-sm text-gray-500">
            {demoWarrants.length} warrant{demoWarrants.length !== 1 && 's'}
          </span>
        </div>

        {demoWarrants.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={ScrollText}
              title="No warrants issued"
              description="Issue a warrant to give the right to purchase shares at a set price."
              action={{
                label: 'Issue Warrant',
                onClick: () => setShowModal(true),
              }}
            />
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">Shareholder</th>
                    <th className="table-header">Grant Date</th>
                    <th className="table-header text-right">Shares</th>
                    <th className="table-header text-right">Exercise Price</th>
                    <th className="table-header">Expiration</th>
                    <th className="table-header">Equity Class</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {demoWarrants.map((warrant) => {
                    const shareholder = getShareholder(warrant.shareholderId)
                    const eqClass = getEquityClass(
                      warrant.equityClassOnExerciseId
                    )
                    const isExpiringSoon =
                      warrant.status === 'active' &&
                      new Date(warrant.expirationDate).getTime() -
                        Date.now() <
                        365 * 24 * 60 * 60 * 1000

                    return (
                      <tr
                        key={warrant.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="table-cell">
                          <div className="font-medium text-gray-900">
                            {shareholder?.name ?? 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {shareholder?.type === 'institution'
                              ? 'Institution'
                              : 'Individual'}
                          </div>
                        </td>
                        <td className="table-cell text-gray-600">
                          {formatDate(warrant.grantDate)}
                        </td>
                        <td className="table-cell text-right font-medium">
                          {formatNumber(warrant.numberOfShares)}
                        </td>
                        <td className="table-cell text-right font-medium">
                          {formatCurrency(warrant.exercisePrice)}
                        </td>
                        <td className="table-cell">
                          <span
                            className={
                              isExpiringSoon
                                ? 'text-yellow-600 font-medium'
                                : 'text-gray-600'
                            }
                          >
                            {formatDate(warrant.expirationDate)}
                          </span>
                          {isExpiringSoon && (
                            <span className="ml-2 badge-yellow text-[10px]">
                              Expiring Soon
                            </span>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className="text-sm text-gray-700">
                            {eqClass?.name ?? 'Unknown'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <StatusBadge status={warrant.status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Issue Warrant Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Issue Warrant"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setShowModal(false)
          }}
          className="space-y-5"
        >
          <div>
            <label className="label">Shareholder</label>
            <select
              className="select-field"
              value={newWarrant.shareholderId}
              onChange={(e) =>
                setNewWarrant({
                  ...newWarrant,
                  shareholderId: e.target.value,
                })
              }
              required
            >
              <option value="">Select shareholder...</option>
              {demoShareholders.map((sh) => (
                <option key={sh.id} value={sh.id}>
                  {sh.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Number of Shares</label>
              <input
                type="number"
                className="input-field"
                placeholder="100,000"
                value={newWarrant.numberOfShares}
                onChange={(e) =>
                  setNewWarrant({
                    ...newWarrant,
                    numberOfShares: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <label className="label">Exercise Price ($)</label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                placeholder="1.25"
                value={newWarrant.exercisePrice}
                onChange={(e) =>
                  setNewWarrant({
                    ...newWarrant,
                    exercisePrice: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Grant Date</label>
              <input
                type="date"
                className="input-field"
                value={newWarrant.grantDate}
                onChange={(e) =>
                  setNewWarrant({
                    ...newWarrant,
                    grantDate: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <label className="label">Expiration Date</label>
              <input
                type="date"
                className="input-field"
                value={newWarrant.expirationDate}
                onChange={(e) =>
                  setNewWarrant({
                    ...newWarrant,
                    expirationDate: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Equity Class on Exercise</label>
            <select
              className="select-field"
              value={newWarrant.equityClassOnExerciseId}
              onChange={(e) =>
                setNewWarrant({
                  ...newWarrant,
                  equityClassOnExerciseId: e.target.value,
                })
              }
              required
            >
              <option value="">Select class...</option>
              {demoEquityClasses.map((ec) => (
                <option key={ec.id} value={ec.id}>
                  {ec.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <ScrollText className="w-4 h-4" />
              Issue Warrant
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
