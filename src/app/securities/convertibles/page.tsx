'use client'

import { useState, useMemo } from 'react'
import {
  RefreshCw,
  Plus,
  ArrowRightLeft,
  DollarSign,
  FileText,
  Percent,
  Clock,
} from 'lucide-react'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import { demoConvertibles, demoShareholders } from '@/lib/demo-data'
import { formatNumber, formatCurrency, formatPercent } from '@/lib/calculations'
import { formatDate } from '@/lib/utils'

function getShareholder(id: string) {
  return demoShareholders.find((s) => s.id === id)
}

function calculateAccruedInterest(
  principal: number,
  annualRate: number | null,
  issueDate: string
): number {
  if (!annualRate) return 0
  const start = new Date(issueDate).getTime()
  const now = Date.now()
  const daysElapsed = (now - start) / (1000 * 60 * 60 * 24)
  return principal * (annualRate / 100) * (daysElapsed / 365)
}

function formatConversionBasis(basis: string) {
  const labels: Record<string, string> = {
    post_money: 'Post-Money',
    pre_money: 'Pre-Money',
  }
  return labels[basis] || basis
}

export default function ConvertiblesPage() {
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [newInstrument, setNewInstrument] = useState({
    instrumentName: '',
    instrumentType: 'SAFE',
    shareholderId: '',
    principalAmount: '',
    interestRate: '',
    valuationCap: '',
    discountPercent: '',
    maturityDate: '',
    conversionBasis: 'post_money',
  })

  // Summary calculations
  const stats = useMemo(() => {
    const outstanding = demoConvertibles.filter(
      (c) => c.status === 'outstanding'
    )
    const totalOutstanding = outstanding.reduce(
      (sum, c) => sum + c.principalAmount,
      0
    )
    const safes = demoConvertibles.filter((c) => c.instrumentType === 'SAFE')
    const notes = demoConvertibles.filter(
      (c) => c.instrumentType === 'convertible_note'
    )
    const safePrincipal = safes.reduce((sum, c) => sum + c.principalAmount, 0)
    const notePrincipal = notes.reduce((sum, c) => sum + c.principalAmount, 0)

    const totalAccruedInterest = outstanding.reduce((sum, c) => {
      return (
        sum +
        calculateAccruedInterest(c.principalAmount, c.interestRate, c.issueDate)
      )
    }, 0)

    return {
      totalOutstanding,
      safePrincipal,
      notePrincipal,
      safeCount: safes.length,
      noteCount: notes.length,
      totalAccruedInterest,
    }
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Convertible Instruments
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage SAFEs, convertible notes, and track conversion terms.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Instrument
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Outstanding
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {formatCurrency(stats.totalOutstanding)}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-teal-50 rounded-lg">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                SAFEs
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {formatCurrency(stats.safePrincipal)}
              </p>
              <p className="text-xs text-gray-500">
                {stats.safeCount} instrument{stats.safeCount !== 1 && 's'}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-orange-50 rounded-lg">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Convertible Notes
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {formatCurrency(stats.notePrincipal)}
              </p>
              <p className="text-xs text-gray-500">
                {stats.noteCount} instrument{stats.noteCount !== 1 && 's'}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-yellow-50 rounded-lg">
              <Percent className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Accrued Interest
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {formatCurrency(stats.totalAccruedInterest)}
              </p>
              <p className="text-xs text-gray-500">On outstanding notes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instruments List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            All Instruments
          </h2>
          <span className="text-sm text-gray-500">
            {demoConvertibles.length} instrument
            {demoConvertibles.length !== 1 && 's'}
          </span>
        </div>

        {demoConvertibles.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={RefreshCw}
              title="No convertible instruments"
              description="Add a SAFE or convertible note to track conversion terms."
              action={{
                label: 'Add Instrument',
                onClick: () => setShowModal(true),
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {demoConvertibles.map((instrument) => {
              const shareholder = getShareholder(instrument.shareholderId)
              const accruedInterest = calculateAccruedInterest(
                instrument.principalAmount,
                instrument.interestRate,
                instrument.issueDate
              )
              const isNote = instrument.instrumentType === 'convertible_note'

              return (
                <div
                  key={instrument.id}
                  className="card hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Left: Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {instrument.instrumentName}
                        </h3>
                        <StatusBadge status={instrument.instrumentType} />
                        <StatusBadge status={instrument.status} />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
                        <div>
                          <p className="text-xs text-gray-500">Shareholder</p>
                          <p className="text-sm font-medium text-gray-900">
                            {shareholder?.name ?? 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Principal</p>
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(instrument.principalAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            Valuation Cap
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {instrument.valuationCap
                              ? formatCurrency(instrument.valuationCap)
                              : '--'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Discount</p>
                          <p className="text-sm font-medium text-gray-900">
                            {instrument.discountPercent
                              ? formatPercent(instrument.discountPercent)
                              : '--'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Issue Date</p>
                          <p className="text-sm text-gray-700">
                            {formatDate(instrument.issueDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            Conversion Basis
                          </p>
                          <p className="text-sm text-gray-700">
                            {formatConversionBasis(instrument.conversionBasis)}
                          </p>
                        </div>
                        {isNote && (
                          <>
                            <div>
                              <p className="text-xs text-gray-500">
                                Interest Rate
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {instrument.interestRate
                                  ? `${instrument.interestRate}%`
                                  : '--'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Maturity</p>
                              <p className="text-sm text-gray-700">
                                {instrument.maturityDate
                                  ? formatDate(instrument.maturityDate)
                                  : '--'}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Accrued interest for notes */}
                      {isNote &&
                        instrument.status === 'outstanding' &&
                        accruedInterest > 0 && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-yellow-600" />
                              <span className="text-yellow-800">
                                Accrued interest:{' '}
                                <span className="font-bold">
                                  {formatCurrency(accruedInterest)}
                                </span>
                              </span>
                              <span className="text-yellow-600">
                                (Total converting:{' '}
                                {formatCurrency(
                                  instrument.principalAmount + accruedInterest
                                )}
                                )
                              </span>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Right: Actions */}
                    {instrument.status === 'outstanding' && (
                      <div className="flex-shrink-0">
                        <button className="btn-accent flex items-center gap-2 text-sm whitespace-nowrap">
                          <ArrowRightLeft className="w-4 h-4" />
                          Convert to Equity
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Instrument Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Add Convertible Instrument"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setShowModal(false)
          }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Instrument Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Seed SAFE"
                value={newInstrument.instrumentName}
                onChange={(e) =>
                  setNewInstrument({
                    ...newInstrument,
                    instrumentName: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                className="select-field"
                value={newInstrument.instrumentType}
                onChange={(e) =>
                  setNewInstrument({
                    ...newInstrument,
                    instrumentType: e.target.value,
                  })
                }
              >
                <option value="SAFE">SAFE</option>
                <option value="convertible_note">Convertible Note</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Shareholder</label>
            <select
              className="select-field"
              value={newInstrument.shareholderId}
              onChange={(e) =>
                setNewInstrument({
                  ...newInstrument,
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
              <label className="label">Principal Amount ($)</label>
              <input
                type="number"
                className="input-field"
                placeholder="250,000"
                value={newInstrument.principalAmount}
                onChange={(e) =>
                  setNewInstrument({
                    ...newInstrument,
                    principalAmount: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <label className="label">Valuation Cap ($)</label>
              <input
                type="number"
                className="input-field"
                placeholder="10,000,000"
                value={newInstrument.valuationCap}
                onChange={(e) =>
                  setNewInstrument({
                    ...newInstrument,
                    valuationCap: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Discount (%)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                placeholder="20"
                value={newInstrument.discountPercent}
                onChange={(e) =>
                  setNewInstrument({
                    ...newInstrument,
                    discountPercent: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="label">Conversion Basis</label>
              <select
                className="select-field"
                value={newInstrument.conversionBasis}
                onChange={(e) =>
                  setNewInstrument({
                    ...newInstrument,
                    conversionBasis: e.target.value,
                  })
                }
              >
                <option value="post_money">Post-Money</option>
                <option value="pre_money">Pre-Money</option>
              </select>
            </div>
          </div>

          {newInstrument.instrumentType === 'convertible_note' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  placeholder="5.0"
                  value={newInstrument.interestRate}
                  onChange={(e) =>
                    setNewInstrument({
                      ...newInstrument,
                      interestRate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="label">Maturity Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={newInstrument.maturityDate}
                  onChange={(e) =>
                    setNewInstrument({
                      ...newInstrument,
                      maturityDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Instrument
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
