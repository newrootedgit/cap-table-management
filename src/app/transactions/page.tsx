'use client'

import { useState, useMemo } from 'react'
import {
  ArrowRightLeft, Plus, Search, Filter, CheckCircle2, XCircle,
  ArrowUpRight, ArrowDownRight, RefreshCw, Trash2, Zap
} from 'lucide-react'
import { demoTransactions, demoShareholders, demoOptionGrants, demoWarrants, demoConvertibles } from '@/lib/demo-data'
import { formatCurrency, formatNumber } from '@/lib/calculations'
import { formatDate } from '@/lib/utils'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'

type TransactionType = 'exercise' | 'transfer' | 'conversion' | 'repurchase' | 'cancellation'

const typeConfig: Record<TransactionType, { label: string; icon: typeof ArrowRightLeft; color: string; badgeClass: string }> = {
  exercise: { label: 'Exercise', icon: Zap, color: 'text-green-600', badgeClass: 'bg-green-100 text-green-800' },
  transfer: { label: 'Transfer', icon: ArrowRightLeft, color: 'text-blue-600', badgeClass: 'bg-blue-100 text-blue-800' },
  conversion: { label: 'Conversion', icon: RefreshCw, color: 'text-purple-600', badgeClass: 'bg-purple-100 text-purple-800' },
  repurchase: { label: 'Repurchase', icon: ArrowDownRight, color: 'text-orange-600', badgeClass: 'bg-orange-100 text-orange-800' },
  cancellation: { label: 'Cancellation', icon: Trash2, color: 'text-red-600', badgeClass: 'bg-red-100 text-red-800' },
}

const allTransactionTypes: TransactionType[] = ['exercise', 'transfer', 'conversion', 'repurchase', 'cancellation']

interface Transaction {
  id: string
  type: string
  fromShareholderId: string
  toShareholderId?: string
  date: string
  numberOfShares: number
  pricePerShare: number
  notes: string
  boardApproval?: boolean
}

const enrichedTransactions: Transaction[] = [
  ...demoTransactions.map(t => ({ ...t, boardApproval: true })),
  { id: 'tx-4', type: 'repurchase', fromShareholderId: 'sh-3', date: '2025-02-01', numberOfShares: 10000, pricePerShare: 3.50, notes: 'Share repurchase upon departure', boardApproval: true },
  { id: 'tx-5', type: 'cancellation', fromShareholderId: 'sh-7', date: '2025-03-01', numberOfShares: 50000, pricePerShare: 0, notes: 'Unvested options cancelled', boardApproval: false },
]

function getShareholder(id: string) {
  return demoShareholders.find(s => s.id === id)
}

export default function TransactionsPage() {
  const [filterType, setFilterType] = useState<string>('all')
  const [filterShareholder, setFilterShareholder] = useState<string>('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [txType, setTxType] = useState<TransactionType>('exercise')

  // Form state
  const [formShareholder, setFormShareholder] = useState('')
  const [formToShareholder, setFormToShareholder] = useState('')
  const [formShares, setFormShares] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formGrant, setFormGrant] = useState('')
  const [formConvertible, setFormConvertible] = useState('')
  const [formNotes, setFormNotes] = useState('')

  const filteredTransactions = useMemo(() => {
    return enrichedTransactions.filter(tx => {
      if (filterType !== 'all' && tx.type !== filterType) return false
      if (filterShareholder !== 'all' && tx.fromShareholderId !== filterShareholder && tx.toShareholderId !== filterShareholder) return false
      if (filterDateFrom && tx.date < filterDateFrom) return false
      if (filterDateTo && tx.date > filterDateTo) return false
      if (searchQuery) {
        const from = getShareholder(tx.fromShareholderId)?.name || ''
        const to = tx.toShareholderId ? getShareholder(tx.toShareholderId)?.name || '' : ''
        const q = searchQuery.toLowerCase()
        if (!from.toLowerCase().includes(q) && !to.toLowerCase().includes(q) && !tx.notes.toLowerCase().includes(q)) return false
      }
      return true
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [filterType, filterShareholder, filterDateFrom, filterDateTo, searchQuery])

  const stats = useMemo(() => {
    const byType: Record<string, number> = {}
    enrichedTransactions.forEach(tx => {
      byType[tx.type] = (byType[tx.type] || 0) + 1
    })
    return { total: enrichedTransactions.length, byType }
  }, [])

  const resetForm = () => {
    setFormShareholder('')
    setFormToShareholder('')
    setFormShares('')
    setFormPrice('')
    setFormGrant('')
    setFormConvertible('')
    setFormNotes('')
    setTxType('exercise')
  }

  const handleOpenModal = () => {
    resetForm()
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">Record and track secondary transactions, exercises, conversions, and more.</p>
        </div>
        <button onClick={handleOpenModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Record Transaction
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card flex flex-col items-center justify-center py-4">
          <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
          <span className="text-xs text-gray-500 mt-1">Total Transactions</span>
        </div>
        {allTransactionTypes.map(type => {
          const config = typeConfig[type]
          const count = stats.byType[type] || 0
          return (
            <div key={type} className="card flex flex-col items-center justify-center py-4">
              <div className="flex items-center gap-1.5 mb-1">
                <config.icon className={`w-4 h-4 ${config.color}`} />
                <span className="text-2xl font-bold text-gray-900">{count}</span>
              </div>
              <span className="text-xs text-gray-500">{config.label}</span>
            </div>
          )
        })}
      </div>

      {/* Filter Bar */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="select-field w-auto"
          >
            <option value="all">All Types</option>
            {allTransactionTypes.map(t => (
              <option key={t} value={t}>{typeConfig[t].label}</option>
            ))}
          </select>
          <select
            value={filterShareholder}
            onChange={(e) => setFilterShareholder(e.target.value)}
            className="select-field w-auto"
          >
            <option value="all">All Shareholders</option>
            {demoShareholders.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="input-field w-auto text-xs"
              placeholder="From"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="input-field w-auto text-xs"
            />
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="input-field pl-9"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card p-0 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon={ArrowRightLeft}
            title="No transactions found"
            description="Try adjusting your filters or record a new transaction."
            action={{ label: 'Record Transaction', onClick: handleOpenModal }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Type</th>
                  <th className="table-header">From</th>
                  <th className="table-header">To</th>
                  <th className="table-header">Date</th>
                  <th className="table-header text-right">Shares</th>
                  <th className="table-header text-right">Price/Share</th>
                  <th className="table-header text-right">Total Value</th>
                  <th className="table-header">Notes</th>
                  <th className="table-header text-center">Board Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map(tx => {
                  const config = typeConfig[tx.type as TransactionType]
                  const from = getShareholder(tx.fromShareholderId)
                  const to = tx.toShareholderId ? getShareholder(tx.toShareholderId) : null
                  const total = tx.numberOfShares * tx.pricePerShare
                  const TypeIcon = config?.icon || ArrowRightLeft

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config?.badgeClass || 'bg-gray-100 text-gray-800'}`}>
                          <TypeIcon className="w-3 h-3" />
                          {config?.label || tx.type}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                            {from?.name.charAt(0) || '?'}
                          </div>
                          <span className="font-medium text-gray-900">{from?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        {to ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-600">
                              {to.name.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900">{to.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">&mdash;</span>
                        )}
                      </td>
                      <td className="table-cell text-gray-600">{formatDate(tx.date)}</td>
                      <td className="table-cell text-right font-mono font-medium">{formatNumber(tx.numberOfShares)}</td>
                      <td className="table-cell text-right font-mono">{formatCurrency(tx.pricePerShare)}</td>
                      <td className="table-cell text-right font-mono font-medium">
                        {total > 0 ? formatCurrency(total) : <span className="text-gray-400">&mdash;</span>}
                      </td>
                      <td className="table-cell text-gray-600 max-w-[200px] truncate">{tx.notes}</td>
                      <td className="table-cell text-center">
                        {tx.boardApproval ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Transaction Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Transaction" size="lg">
        <div className="space-y-6">
          {/* Transaction Type Selector */}
          <div>
            <label className="label">Transaction Type</label>
            <div className="grid grid-cols-5 gap-2">
              {allTransactionTypes.map(type => {
                const config = typeConfig[type]
                const Icon = config.icon
                const selected = txType === type
                return (
                  <button
                    key={type}
                    onClick={() => setTxType(type)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-xs font-medium ${
                      selected
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${selected ? 'text-primary-600' : 'text-gray-400'}`} />
                    {config.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            {/* Exercise Form */}
            {txType === 'exercise' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Shareholder</label>
                    <select value={formShareholder} onChange={e => setFormShareholder(e.target.value)} className="select-field">
                      <option value="">Select shareholder...</option>
                      {demoShareholders.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Grant (Option / Warrant)</label>
                    <select value={formGrant} onChange={e => setFormGrant(e.target.value)} className="select-field">
                      <option value="">Select grant...</option>
                      {demoOptionGrants.map(g => {
                        const sh = getShareholder(g.shareholderId)
                        return (
                          <option key={g.id} value={g.id}>
                            Option: {sh?.name} - {formatNumber(g.numberOfOptions - g.exercisedShares)} remaining @ {formatCurrency(g.exercisePrice)}
                          </option>
                        )
                      })}
                      {demoWarrants.map(w => {
                        const sh = getShareholder(w.shareholderId)
                        return (
                          <option key={w.id} value={w.id}>
                            Warrant: {sh?.name} - {formatNumber(w.numberOfShares)} @ {formatCurrency(w.exercisePrice)}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Shares to Exercise</label>
                  <input type="number" value={formShares} onChange={e => setFormShares(e.target.value)} className="input-field" placeholder="Number of shares" />
                </div>
              </div>
            )}

            {/* Transfer Form */}
            {txType === 'transfer' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">From Shareholder</label>
                    <select value={formShareholder} onChange={e => setFormShareholder(e.target.value)} className="select-field">
                      <option value="">Select seller...</option>
                      {demoShareholders.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">To Shareholder</label>
                    <select value={formToShareholder} onChange={e => setFormToShareholder(e.target.value)} className="select-field">
                      <option value="">Select buyer...</option>
                      {demoShareholders.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Shares</label>
                    <input type="number" value={formShares} onChange={e => setFormShares(e.target.value)} className="input-field" placeholder="Number of shares" />
                  </div>
                  <div>
                    <label className="label">Price per Share</label>
                    <input type="number" step="0.01" value={formPrice} onChange={e => setFormPrice(e.target.value)} className="input-field" placeholder="0.00" />
                  </div>
                </div>
              </div>
            )}

            {/* Conversion Form */}
            {txType === 'conversion' && (
              <div className="space-y-4">
                <div>
                  <label className="label">Convertible Instrument</label>
                  <select value={formConvertible} onChange={e => setFormConvertible(e.target.value)} className="select-field">
                    <option value="">Select instrument...</option>
                    {demoConvertibles.map(c => {
                      const sh = getShareholder(c.shareholderId)
                      return (
                        <option key={c.id} value={c.id}>
                          {c.instrumentName} - {sh?.name} ({formatCurrency(c.principalAmount)})
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Conversion Terms</h4>
                  {formConvertible ? (() => {
                    const conv = demoConvertibles.find(c => c.id === formConvertible)
                    if (!conv) return null
                    return (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-2 font-medium">{conv.instrumentType === 'SAFE' ? 'SAFE' : 'Convertible Note'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Principal:</span>
                          <span className="ml-2 font-medium">{formatCurrency(conv.principalAmount)}</span>
                        </div>
                        {conv.valuationCap && (
                          <div>
                            <span className="text-gray-500">Valuation Cap:</span>
                            <span className="ml-2 font-medium">{formatCurrency(conv.valuationCap)}</span>
                          </div>
                        )}
                        {conv.discountPercent && (
                          <div>
                            <span className="text-gray-500">Discount:</span>
                            <span className="ml-2 font-medium">{conv.discountPercent}%</span>
                          </div>
                        )}
                      </div>
                    )
                  })() : (
                    <p className="text-sm text-gray-400">Select an instrument to view terms</p>
                  )}
                </div>
              </div>
            )}

            {/* Repurchase Form */}
            {txType === 'repurchase' && (
              <div className="space-y-4">
                <div>
                  <label className="label">Shareholder</label>
                  <select value={formShareholder} onChange={e => setFormShareholder(e.target.value)} className="select-field">
                    <option value="">Select shareholder...</option>
                    {demoShareholders.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Shares to Repurchase</label>
                    <input type="number" value={formShares} onChange={e => setFormShares(e.target.value)} className="input-field" placeholder="Number of shares" />
                  </div>
                  <div>
                    <label className="label">Repurchase Price per Share</label>
                    <input type="number" step="0.01" value={formPrice} onChange={e => setFormPrice(e.target.value)} className="input-field" placeholder="0.00" />
                  </div>
                </div>
              </div>
            )}

            {/* Cancellation Form */}
            {txType === 'cancellation' && (
              <div className="space-y-4">
                <div>
                  <label className="label">Grant to Cancel</label>
                  <select value={formGrant} onChange={e => setFormGrant(e.target.value)} className="select-field">
                    <option value="">Select grant...</option>
                    {demoOptionGrants.map(g => {
                      const sh = getShareholder(g.shareholderId)
                      return (
                        <option key={g.id} value={g.id}>
                          Option: {sh?.name} - {formatNumber(g.numberOfOptions)} options @ {formatCurrency(g.exercisePrice)}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div>
                  <label className="label">Shares to Cancel</label>
                  <input type="number" value={formShares} onChange={e => setFormShares(e.target.value)} className="input-field" placeholder="Number of shares" />
                </div>
              </div>
            )}

            {/* Common Fields */}
            <div className="mt-4">
              <label className="label">Notes</label>
              <textarea
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Additional notes about this transaction..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button className="btn-primary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Record Transaction
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
