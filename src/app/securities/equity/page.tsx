'use client'

import { useState } from 'react'
import {
  Shield,
  Plus,
  FileText,
  Vote,
  DollarSign,
  Layers,
  ChevronRight,
} from 'lucide-react'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import {
  demoEquityClasses,
  demoEquityGrants,
  demoShareholders,
  demoVestingPlans,
} from '@/lib/demo-data'
import { formatNumber, formatCurrency } from '@/lib/calculations'
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

function formatAntiDilution(value: string) {
  const labels: Record<string, string> = {
    none: 'None',
    broad_weighted_avg: 'Broad Weighted Avg',
    narrow_weighted_avg: 'Narrow Weighted Avg',
    full_ratchet: 'Full Ratchet',
  }
  return labels[value] || value
}

export default function EquityPage() {
  const [showClassModal, setShowClassModal] = useState(false)
  const [showGrantModal, setShowGrantModal] = useState(false)

  // Form state for Add Equity Class
  const [newClass, setNewClass] = useState({
    name: '',
    type: 'common',
    authorizedShares: '',
    parValue: '',
    votingRights: true,
    liquidationPreference: '',
    antidilutionProtection: 'none',
  })

  // Form state for Issue Shares
  const [newGrant, setNewGrant] = useState({
    shareholderId: '',
    equityClassId: '',
    numberOfShares: '',
    pricePerShare: '',
    grantDate: '',
    certificateNumber: '',
  })

  const totalAuthorized = demoEquityClasses.reduce(
    (sum, c) => sum + c.authorizedShares,
    0
  )
  const totalIssued = demoEquityGrants.reduce(
    (sum, g) => sum + g.numberOfShares,
    0
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Equity Classes & Grants
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your share classes and track all equity issuances.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowClassModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            Add Equity Class
          </button>
          <button
            onClick={() => setShowGrantModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Issue Shares
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Equity Classes
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {demoEquityClasses.length}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Total Authorized
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {formatNumber(totalAuthorized)}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Total Issued
          </p>
          <p className="mt-1 text-2xl font-bold text-primary-600">
            {formatNumber(totalIssued)}
          </p>
        </div>
      </div>

      {/* Equity Classes Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Share Classes
        </h2>
        {demoEquityClasses.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No equity classes"
            description="Create your first equity class to get started."
            action={{
              label: 'Add Equity Class',
              onClick: () => setShowClassModal(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {demoEquityClasses.map((ec) => {
              const classGrants = demoEquityGrants.filter(
                (g) => g.equityClassId === ec.id
              )
              const issued = classGrants.reduce(
                (sum, g) => sum + g.numberOfShares,
                0
              )
              const available = ec.authorizedShares - issued
              const pctIssued =
                ec.authorizedShares > 0
                  ? (issued / ec.authorizedShares) * 100
                  : 0

              return (
                <div key={ec.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {ec.name}
                      </h3>
                      <StatusBadge status={ec.type} />
                    </div>
                    <Shield className="w-5 h-5 text-primary-400" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Authorized</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(ec.authorizedShares)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Issued</span>
                      <span className="font-medium text-primary-600">
                        {formatNumber(issued)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Available</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(available)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Utilization</span>
                        <span>{pctIssued.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(pctIssued, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Par Value</span>
                        <span className="font-medium">
                          {formatCurrency(ec.parValue)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Voting Rights</span>
                        <span className="font-medium">
                          {ec.votingRights ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <Vote className="w-3.5 h-3.5" /> Yes
                            </span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </span>
                      </div>
                      {ec.type === 'preferred' && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Liq. Pref</span>
                            <span className="font-medium">
                              {ec.liquidationMultiple}x
                              {ec.participatingPreferred
                                ? ' (Participating)'
                                : ' (Non-Part.)'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Anti-Dilution</span>
                            <span className="font-medium">
                              {formatAntiDilution(ec.antidilutionProtection)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Equity Grants Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Equity Grants
          </h2>
          <span className="text-sm text-gray-500">
            {demoEquityGrants.length} grant{demoEquityGrants.length !== 1 && 's'}
          </span>
        </div>

        {demoEquityGrants.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={FileText}
              title="No equity grants"
              description="Issue shares to create your first grant."
              action={{
                label: 'Issue Shares',
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
                    <th className="table-header">Certificate #</th>
                    <th className="table-header">Shareholder</th>
                    <th className="table-header">Class</th>
                    <th className="table-header">Grant Date</th>
                    <th className="table-header text-right">Shares</th>
                    <th className="table-header text-right">Price/Share</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Vesting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {demoEquityGrants.map((grant) => {
                    const shareholder = getShareholder(grant.shareholderId)
                    const eqClass = getEquityClass(grant.equityClassId)
                    const vesting = getVestingPlan(grant.vestingPlanId)

                    return (
                      <tr
                        key={grant.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="table-cell font-mono text-xs font-medium text-primary-600">
                          {grant.certificateNumber}
                        </td>
                        <td className="table-cell">
                          <div className="font-medium text-gray-900">
                            {shareholder?.name ?? 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {shareholder?.email}
                          </div>
                        </td>
                        <td className="table-cell">
                          <StatusBadge status={eqClass?.type ?? 'common'} />
                          <span className="ml-2 text-sm text-gray-700">
                            {eqClass?.name}
                          </span>
                        </td>
                        <td className="table-cell text-gray-600">
                          {formatDate(grant.grantDate)}
                        </td>
                        <td className="table-cell text-right font-medium">
                          {formatNumber(grant.numberOfShares)}
                        </td>
                        <td className="table-cell text-right font-medium">
                          {formatCurrency(grant.pricePerShare)}
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

      {/* Add Equity Class Modal */}
      <Modal
        open={showClassModal}
        onClose={() => setShowClassModal(false)}
        title="Add Equity Class"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setShowClassModal(false)
          }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Class Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Series C Preferred"
                value={newClass.name}
                onChange={(e) =>
                  setNewClass({ ...newClass, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                className="select-field"
                value={newClass.type}
                onChange={(e) =>
                  setNewClass({ ...newClass, type: e.target.value })
                }
              >
                <option value="common">Common</option>
                <option value="preferred">Preferred</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Authorized Shares</label>
              <input
                type="number"
                className="input-field"
                placeholder="1,000,000"
                value={newClass.authorizedShares}
                onChange={(e) =>
                  setNewClass({
                    ...newClass,
                    authorizedShares: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <label className="label">Par Value ($)</label>
              <input
                type="number"
                step="0.0001"
                className="input-field"
                placeholder="0.0001"
                value={newClass.parValue}
                onChange={(e) =>
                  setNewClass({ ...newClass, parValue: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Voting Rights</label>
              <select
                className="select-field"
                value={newClass.votingRights ? 'yes' : 'no'}
                onChange={(e) =>
                  setNewClass({
                    ...newClass,
                    votingRights: e.target.value === 'yes',
                  })
                }
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label className="label">Anti-Dilution Protection</label>
              <select
                className="select-field"
                value={newClass.antidilutionProtection}
                onChange={(e) =>
                  setNewClass({
                    ...newClass,
                    antidilutionProtection: e.target.value,
                  })
                }
              >
                <option value="none">None</option>
                <option value="broad_weighted_avg">Broad Weighted Average</option>
                <option value="narrow_weighted_avg">
                  Narrow Weighted Average
                </option>
                <option value="full_ratchet">Full Ratchet</option>
              </select>
            </div>
          </div>

          {newClass.type === 'preferred' && (
            <div>
              <label className="label">Liquidation Preference ($)</label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                placeholder="1.00"
                value={newClass.liquidationPreference}
                onChange={(e) =>
                  setNewClass({
                    ...newClass,
                    liquidationPreference: e.target.value,
                  })
                }
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowClassModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Class
            </button>
          </div>
        </form>
      </Modal>

      {/* Issue Shares Modal */}
      <Modal
        open={showGrantModal}
        onClose={() => setShowGrantModal(false)}
        title="Issue Shares"
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
              <label className="label">Equity Class</label>
              <select
                className="select-field"
                value={newGrant.equityClassId}
                onChange={(e) =>
                  setNewGrant({
                    ...newGrant,
                    equityClassId: e.target.value,
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Number of Shares</label>
              <input
                type="number"
                className="input-field"
                placeholder="100,000"
                value={newGrant.numberOfShares}
                onChange={(e) =>
                  setNewGrant({
                    ...newGrant,
                    numberOfShares: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <label className="label">Price per Share ($)</label>
              <input
                type="number"
                step="0.0001"
                className="input-field"
                placeholder="1.00"
                value={newGrant.pricePerShare}
                onChange={(e) =>
                  setNewGrant({
                    ...newGrant,
                    pricePerShare: e.target.value,
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
                value={newGrant.grantDate}
                onChange={(e) =>
                  setNewGrant({ ...newGrant, grantDate: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="label">Certificate Number</label>
              <input
                type="text"
                className="input-field"
                placeholder="CS-006"
                value={newGrant.certificateNumber}
                onChange={(e) =>
                  setNewGrant({
                    ...newGrant,
                    certificateNumber: e.target.value,
                  })
                }
              />
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
              <DollarSign className="w-4 h-4" />
              Issue Shares
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
