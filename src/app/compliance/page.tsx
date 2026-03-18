'use client'

import { useState } from 'react'
import {
  Scale,
  ChevronDown,
  ChevronUp,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  FileText,
} from 'lucide-react'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import { demoOptionGrants, demoShareholders, demoEquityGrants } from '@/lib/demo-data'
import { formatNumber, formatCurrency } from '@/lib/calculations'
import { formatDate } from '@/lib/utils'

type ComplianceSection = 'form3921' | 'asc718' | 'rule701' | 'form83b'

interface Filing {
  id: string
  name: string
  status: 'filed' | 'pending' | 'not_required'
  dueDate: string
  notes: string
}

const form3921Filings: Filing[] = [
  { id: 'f-1', name: 'Form 3921 - Dave Wilson (50,000 options exercised)', status: 'pending', dueDate: '2026-01-31', notes: 'Exercise date: Jan 15, 2025. Must file by Jan 31 of following year.' },
  { id: 'f-2', name: 'Form 3921 - Annual Summary (Tax Year 2024)', status: 'not_required', dueDate: '2025-02-28', notes: 'No option exercises in tax year 2024.' },
]

const asc718Filings: Filing[] = [
  { id: 'a-1', name: 'ASC 718 Expense Report - Q4 2025', status: 'filed', dueDate: '2026-01-15', notes: 'Stock-based compensation expense recognized for all active grants.' },
  { id: 'a-2', name: 'ASC 718 Expense Report - Q1 2026', status: 'pending', dueDate: '2026-04-15', notes: 'Includes 3 active equity grants and 3 option grants.' },
  { id: 'a-3', name: 'Grant Date Fair Value Documentation', status: 'filed', dueDate: '2025-12-31', notes: 'Black-Scholes valuation for all option grants.' },
]

const rule701Filings: Filing[] = [
  { id: 'r-1', name: 'Rule 701 Annual Compliance Check - 2025', status: 'filed', dueDate: '2025-12-31', notes: 'Aggregate under threshold. No additional disclosure required.' },
  { id: 'r-2', name: 'Rule 701 Annual Compliance Check - 2026', status: 'pending', dueDate: '2026-12-31', notes: 'Must track aggregate securities sold within rolling 12-month period.' },
]

const form83bFilings: Filing[] = [
  { id: 'b-1', name: '83(b) Election - Carol Davis (500,000 shares)', status: 'filed', dueDate: '2023-07-01', notes: 'Filed within 30 days of grant date (Jun 1, 2023). Copy retained.' },
  { id: 'b-2', name: '83(b) Election - Dave Wilson (200,000 shares)', status: 'filed', dueDate: '2024-02-14', notes: 'Filed within 30 days of grant date (Jan 15, 2024). Copy retained.' },
  { id: 'b-3', name: '83(b) Election - Emily Park (100,000 shares)', status: 'not_required', dueDate: '2024-07-01', notes: 'Advisor shares with immediate vesting; no restricted property.' },
]

function getShareholder(id: string) {
  return demoShareholders.find((s) => s.id === id)
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'filed': return <CheckCircle2 className="w-4 h-4 text-green-500" />
    case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
    case 'not_required': return <Info className="w-4 h-4 text-gray-400" />
    default: return null
  }
}

export default function CompliancePage() {
  const [expandedSections, setExpandedSections] = useState<Set<ComplianceSection>>(new Set(['form3921' as ComplianceSection]))
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalSection, setAddModalSection] = useState<ComplianceSection>('form3921')

  const toggleSection = (section: ComplianceSection) => {
    const next = new Set(expandedSections)
    if (next.has(section)) next.delete(section)
    else next.add(section)
    setExpandedSections(next)
  }

  const openAddModal = (section: ComplianceSection) => {
    setAddModalSection(section)
    setShowAddModal(true)
  }

  // Rule 701 calculations
  const vestingGrants = demoEquityGrants.filter((g) => g.vestingPlanId)
  const optionGrantValue = demoOptionGrants.reduce((sum, g) => sum + g.numberOfOptions * g.exercisePrice, 0)
  const equityGrantValue = vestingGrants.reduce((sum, g) => sum + g.numberOfShares * g.pricePerShare, 0)
  const aggregateValue = optionGrantValue + equityGrantValue
  const rule701Threshold = 1000000 // $1M simplified threshold
  const rule701Pct = (aggregateValue / rule701Threshold) * 100

  // Option exercises for Form 3921
  const exercisedOptions = demoOptionGrants.filter((g) => g.exercisedShares > 0)

  // Count pending items
  const allFilings = [...form3921Filings, ...asc718Filings, ...rule701Filings, ...form83bFilings]
  const pendingCount = allFilings.filter((f) => f.status === 'pending').length
  const filedCount = allFilings.filter((f) => f.status === 'filed').length

  function renderFilingTable(filings: Filing[], section: ComplianceSection) {
    return (
      <div>
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header w-8" />
                  <th className="table-header">Filing</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Due Date</th>
                  <th className="table-header">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filings.map((filing) => (
                  <tr key={filing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">{getStatusIcon(filing.status)}</td>
                    <td className="table-cell font-medium text-gray-900">{filing.name}</td>
                    <td className="table-cell"><StatusBadge status={filing.status} /></td>
                    <td className="table-cell text-gray-600">{formatDate(filing.dueDate)}</td>
                    <td className="table-cell text-gray-500 text-xs max-w-xs">{filing.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-3">
          <button onClick={() => openAddModal(section)} className="btn-secondary text-sm flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add Filing
          </button>
        </div>
      </div>
    )
  }

  const sections: {
    id: ComplianceSection
    title: string
    description: string
    filings: Filing[]
    extra?: React.ReactNode
  }[] = [
    {
      id: 'form3921',
      title: 'Form 3921 - Exercise of Incentive Stock Options',
      description: 'Employers must file Form 3921 for each transfer of stock acquired through exercise of an incentive stock option (ISO) during the calendar year. File with the IRS and furnish to employees by January 31 of the following year.',
      filings: form3921Filings,
      extra: exercisedOptions.length > 0 ? (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-800">Option Exercises Requiring Reporting</span>
          </div>
          <div className="space-y-2">
            {exercisedOptions.map((og) => {
              const sh = getShareholder(og.shareholderId)
              return (
                <div key={og.id} className="flex items-center justify-between text-sm">
                  <span className="text-yellow-800">{sh?.name ?? 'Unknown'} - {formatNumber(og.exercisedShares)} shares exercised at {formatCurrency(og.exercisePrice)}</span>
                  <span className="text-xs text-yellow-600">Grant: {formatDate(og.grantDate)}</span>
                </div>
              )
            })}
          </div>
        </div>
      ) : null,
    },
    {
      id: 'asc718',
      title: 'ASC 718 - Stock-Based Compensation',
      description: 'ASC 718 requires companies to recognize the cost of employee stock-based compensation based on fair value at grant date. Expense is recognized over the requisite service period (typically the vesting period). Applies to stock options, restricted stock, RSUs, and other equity instruments.',
      filings: asc718Filings,
    },
    {
      id: 'rule701',
      title: 'Rule 701 - Securities Act Exemption',
      description: 'Rule 701 provides an exemption from SEC registration for securities issued under compensatory benefit plans (stock options, restricted stock, etc.). Aggregate sales cannot exceed the greater of: $1M, 15% of total assets, or 15% of outstanding securities. Additional disclosure is required if sales exceed $10M in a 12-month period.',
      filings: rule701Filings,
      extra: (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Aggregate Securities Sold (Compensatory)</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Option Grants (aggregate exercise value)</span>
              <span className="font-medium">{formatCurrency(optionGrantValue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Restricted Equity Grants (aggregate purchase price)</span>
              <span className="font-medium">{formatCurrency(equityGrantValue)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-2">
              <span className="text-gray-900">Total Aggregate Value</span>
              <span className="text-primary-600">{formatCurrency(aggregateValue)}</span>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress toward $1M threshold</span>
                <span>{rule701Pct.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${rule701Pct > 80 ? 'bg-yellow-500' : 'bg-accent-500'}`}
                  style={{ width: `${Math.min(rule701Pct, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'form83b',
      title: 'Form 83(b) - Election for Restricted Property',
      description: 'Section 83(b) allows employees who receive restricted stock to elect to include the fair market value at grant date in gross income, rather than at vesting. The election must be filed with the IRS within 30 days of the grant date. This is critical for founders and early employees with low FMV stock subject to vesting.',
      filings: form83bFilings,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track regulatory filings, tax reporting obligations, and securities compliance.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Filings</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{allFilings.length}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filed</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{filedCount}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rule 701 Utilization</p>
          <p className="mt-1 text-2xl font-bold text-primary-600">{rule701Pct.toFixed(0)}%</p>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.id)
          const sectionPending = section.filings.filter((f) => f.status === 'pending').length
          return (
            <div key={section.id} className="card p-0 overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-primary-500" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                    <span className="text-xs text-gray-500">{section.filings.length} filing{section.filings.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {sectionPending > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {sectionPending} pending
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mt-4 mb-4 leading-relaxed">{section.description}</p>
                  {renderFilingTable(section.filings, section.id)}
                  {section.extra}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Filing Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Filing" size="md">
        <form onSubmit={(e) => { e.preventDefault(); setShowAddModal(false) }} className="space-y-5">
          <div>
            <label className="label">Section</label>
            <select
              className="select-field"
              value={addModalSection}
              onChange={(e) => setAddModalSection(e.target.value as ComplianceSection)}
            >
              <option value="form3921">Form 3921</option>
              <option value="asc718">ASC 718</option>
              <option value="rule701">Rule 701</option>
              <option value="form83b">Form 83(b)</option>
            </select>
          </div>
          <div>
            <label className="label">Filing Name</label>
            <input type="text" className="input-field" placeholder="e.g. Form 3921 - John Smith" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select className="select-field" defaultValue="pending">
                <option value="filed">Filed</option>
                <option value="pending">Pending</option>
                <option value="not_required">Not Required</option>
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input-field" required />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input-field" rows={3} placeholder="Additional details..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Filing
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
