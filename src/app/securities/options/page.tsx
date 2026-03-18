'use client'

import { useState } from 'react'
import {
  Target,
  Plus,
  FileText,
  CalendarCheck,
  ChevronRight,
} from 'lucide-react'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import {
  demoOptionPools,
  demoOptionGrants,
  demoShareholders,
  demoEquityClasses,
  demoVestingPlans,
} from '@/lib/demo-data'
import { formatNumber, formatCurrency, formatPercent } from '@/lib/calculations'
import { formatDate } from '@/lib/utils'

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

export default function OptionsPage() {
  const [showPoolModal, setShowPoolModal] = useState(false)
  const [showGrantModal, setShowGrantModal] = useState(false)

  // Form state for Create Pool
  const [newPool, setNewPool] = useState({
    name: '',
    totalPoolShares: '',
    equityClassOnExerciseId: '',
    boardApprovalDate: '',
  })

  // Form state for Grant Options
  const [newGrant, setNewGrant] = useState({
    shareholderId: '',
    optionPoolId: '',
    numberOfOptions: '',
    exercisePrice: '',
    grantDate: '',
    expirationDate: '',
    vestingPlanId: '',
  })

  const totalPoolShares = demoOptionPools.reduce(
    (sum, p) => sum + p.totalPoolShares,
    0
  )
  const totalIssued = demoOptionPools.reduce(
    (sum, p) => sum + p.issuedShares,
    0
  )
  const totalAvailable = totalPoolShares - totalIssued

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Option Pools & Grants
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage equity incentive plans and track individual option grants.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPoolModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Create Pool
          </button>
          <button
            onClick={() => setShowGrantModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Grant Options
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Total Pool Size
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {formatNumber(totalPoolShares)}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Issued / Granted
          </p>
          <p className="mt-1 text-2xl font-bold text-primary-600">
            {formatNumber(totalIssued)}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Available
          </p>
          <p className="mt-1 text-2xl font-bold text-accent-600">
            {formatNumber(totalAvailable)}
          </p>
        </div>
      </div>

      {/* Option Pool Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Option Pools
        </h2>
        {demoOptionPools.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No option pools"
            description="Create an equity incentive plan to start granting options."
            action={{
              label: 'Create Pool',
              onClick: () => setShowPoolModal(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {demoOptionPools.map((pool) => {
              const available = pool.totalPoolShares - pool.issuedShares
              const pctIssued =
                pool.totalPoolShares > 0
                  ? (pool.issuedShares / pool.totalPoolShares) * 100
                  : 0
              const exerciseClass = getEquityClass(
                pool.equityClassOnExerciseId
              )

              return (
                <div
                  key={pool.id}
                  className="card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {pool.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Converts to {exerciseClass?.name ?? 'Unknown'}
                      </p>
                    </div>
                    <Target className="w-5 h-5 text-accent-500" />
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-sm font-bold text-gray-900">
                          {formatNumber(pool.totalPoolShares)}
                        </p>
                      </div>
                      <div className="bg-primary-50 rounded-lg p-2">
                        <p className="text-xs text-primary-600">Issued</p>
                        <p className="text-sm font-bold text-primary-700">
                          {formatNumber(pool.issuedShares)}
                        </p>
                      </div>
                      <div className="bg-accent-50 rounded-lg p-2">
                        <p className="text-xs text-accent-600">Available</p>
                        <p className="text-sm font-bold text-accent-700">
                          {formatNumber(available)}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Pool Utilization</span>
                        <span>{pctIssued.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(pctIssued, 100)}%`,
                            background:
                              'linear-gradient(90deg, #7c3aed, #14b8a6)',
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t border-gray-100">
                      <CalendarCheck className="w-3.5 h-3.5" />
                      Board Approved: {formatDate(pool.boardApprovalDate)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Option Grants Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Option Grants
          </h2>
          <span className="text-sm text-gray-500">
            {demoOptionGrants.length} grant
            {demoOptionGrants.length !== 1 && 's'}
          </span>
        </div>

        {demoOptionGrants.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={FileText}
              title="No option grants"
              description="Grant options from a pool to create the first grant."
              action={{
                label: 'Grant Options',
                onClick: () => setShowGrantModal(true),
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
                    <th className="table-header">Pool</th>
                    <th className="table-header">Grant Date</th>
                    <th className="table-header text-right">Options</th>
                    <th className="table-header text-right">Exercise Price</th>
                    <th className="table-header text-right">Exercised</th>
                    <th className="table-header">Expiration</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Vesting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {demoOptionGrants.map((grant) => {
                    const shareholder = getShareholder(grant.shareholderId)
                    const pool = demoOptionPools.find(
                      (p) => p.id === grant.optionPoolId
                    )
                    const vesting = getVestingPlan(grant.vestingPlanId)
                    const exercisedPct =
                      grant.numberOfOptions > 0
                        ? (grant.exercisedShares / grant.numberOfOptions) * 100
                        : 0

                    return (
                      <tr
                        key={grant.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="table-cell">
                          <div className="font-medium text-gray-900">
                            {shareholder?.name ?? 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {shareholder?.role &&
                              shareholder.role.charAt(0).toUpperCase() +
                                shareholder.role.slice(1)}
                          </div>
                        </td>
                        <td className="table-cell text-sm text-gray-700">
                          {pool?.name ?? 'Unknown'}
                        </td>
                        <td className="table-cell text-gray-600">
                          {formatDate(grant.grantDate)}
                        </td>
                        <td className="table-cell text-right font-medium">
                          {formatNumber(grant.numberOfOptions)}
                        </td>
                        <td className="table-cell text-right font-medium">
                          {formatCurrency(grant.exercisePrice)}
                        </td>
                        <td className="table-cell text-right">
                          <div className="font-medium">
                            {formatNumber(grant.exercisedShares)}
                          </div>
                          {grant.exercisedShares > 0 && (
                            <div className="text-xs text-gray-500">
                              {formatPercent(exercisedPct)}
                            </div>
                          )}
                        </td>
                        <td className="table-cell text-gray-600">
                          {formatDate(grant.expirationDate)}
                        </td>
                        <td className="table-cell">
                          <StatusBadge status={grant.status} />
                        </td>
                        <td className="table-cell">
                          {vesting ? (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                              <ChevronRight className="w-3 h-3" />
                              {vesting.name}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Immediate
                            </span>
                          )}
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

      {/* Create Pool Modal */}
      <Modal
        open={showPoolModal}
        onClose={() => setShowPoolModal(false)}
        title="Create Option Pool"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setShowPoolModal(false)
          }}
          className="space-y-5"
        >
          <div>
            <label className="label">Plan Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. 2025 Equity Incentive Plan"
              value={newPool.name}
              onChange={(e) =>
                setNewPool({ ...newPool, name: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Total Pool Shares</label>
              <input
                type="number"
                className="input-field"
                placeholder="2,000,000"
                value={newPool.totalPoolShares}
                onChange={(e) =>
                  setNewPool({
                    ...newPool,
                    totalPoolShares: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <label className="label">Equity Class on Exercise</label>
              <select
                className="select-field"
                value={newPool.equityClassOnExerciseId}
                onChange={(e) =>
                  setNewPool({
                    ...newPool,
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
          </div>

          <div>
            <label className="label">Board Approval Date</label>
            <input
              type="date"
              className="input-field"
              value={newPool.boardApprovalDate}
              onChange={(e) =>
                setNewPool({
                  ...newPool,
                  boardApprovalDate: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowPoolModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Pool
            </button>
          </div>
        </form>
      </Modal>

      {/* Grant Options Modal */}
      <Modal
        open={showGrantModal}
        onClose={() => setShowGrantModal(false)}
        title="Grant Options"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setShowGrantModal(false)
          }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Shareholder</label>
              <select
                className="select-field"
                value={newGrant.shareholderId}
                onChange={(e) =>
                  setNewGrant({
                    ...newGrant,
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
            <div>
              <label className="label">Option Pool</label>
              <select
                className="select-field"
                value={newGrant.optionPoolId}
                onChange={(e) =>
                  setNewGrant({
                    ...newGrant,
                    optionPoolId: e.target.value,
                  })
                }
                required
              >
                <option value="">Select pool...</option>
                {demoOptionPools.map((pool) => (
                  <option key={pool.id} value={pool.id}>
                    {pool.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Number of Options</label>
              <input
                type="number"
                className="input-field"
                placeholder="50,000"
                value={newGrant.numberOfOptions}
                onChange={(e) =>
                  setNewGrant({
                    ...newGrant,
                    numberOfOptions: e.target.value,
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
                placeholder="3.50"
                value={newGrant.exercisePrice}
                onChange={(e) =>
                  setNewGrant({
                    ...newGrant,
                    exercisePrice: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Grant Date</label>
              <input
                type="date"
                className="input-field"
                value={newGrant.grantDate}
                onChange={(e) =>
                  setNewGrant({ ...newGrant, grantDate: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="label">Expiration Date</label>
              <input
                type="date"
                className="input-field"
                value={newGrant.expirationDate}
                onChange={(e) =>
                  setNewGrant({
                    ...newGrant,
                    expirationDate: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <label className="label">Vesting Schedule</label>
              <select
                className="select-field"
                value={newGrant.vestingPlanId}
                onChange={(e) =>
                  setNewGrant({
                    ...newGrant,
                    vestingPlanId: e.target.value,
                  })
                }
              >
                <option value="">None (Immediate)</option>
                {demoVestingPlans.map((vp) => (
                  <option key={vp.id} value={vp.id}>
                    {vp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowGrantModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Grant Options
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
