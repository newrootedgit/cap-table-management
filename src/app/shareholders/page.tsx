'use client'

import { useState, useMemo, Fragment } from 'react'
import {
  Users, Building2, UserCircle, Search, Plus, ChevronDown, ChevronRight,
  Download, Filter, Briefcase, Shield, Award, UserPlus,
} from 'lucide-react'
import {
  demoShareholders, demoEquityGrants, demoOptionGrants, demoWarrants,
  demoEquityClasses, getCapTableSummary,
} from '@/lib/demo-data'
import { formatNumber, formatPercent } from '@/lib/calculations'
import { formatDate } from '@/lib/utils'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'

interface Shareholder {
  id: string
  name: string
  email: string
  type: string
  role: string
  shares: number
  equityClass: string
  phone?: string
}

export default function ShareholdersPage() {
  const [shareholders, setShareholders] = useState<Shareholder[]>(demoShareholders)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'individual',
    role: 'employee',
  })

  const capSummary = useMemo(() => getCapTableSummary(), [])

  // Build enriched shareholder data with holdings
  const enrichedShareholders = useMemo(() => {
    return shareholders.map(sh => {
      const summary = capSummary.shareholderSummary.find(s => s.id === sh.id)
      return {
        ...sh,
        totalShares: summary?.totalShares ?? 0,
        totalOptions: summary?.totalOptions ?? 0,
        totalWarrants: summary?.totalWarrants ?? 0,
        fullyDilutedShares: summary?.fullyDilutedShares ?? 0,
        fullyDilutedPercent: summary?.fullyDilutedPercent ?? 0,
      }
    })
  }, [shareholders, capSummary])

  // Apply filters
  const filteredShareholders = useMemo(() => {
    return enrichedShareholders.filter(sh => {
      const matchesSearch =
        searchQuery === '' ||
        sh.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sh.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === 'all' || sh.type === typeFilter
      const matchesRole = roleFilter === 'all' || sh.role === roleFilter
      return matchesSearch && matchesType && matchesRole
    })
  }, [enrichedShareholders, searchQuery, typeFilter, roleFilter])

  // Stats
  const stats = useMemo(() => {
    const total = shareholders.length
    const individuals = shareholders.filter(s => s.type === 'individual').length
    const institutions = shareholders.filter(s => s.type === 'institution').length
    const roleCounts: Record<string, number> = {}
    shareholders.forEach(s => {
      roleCounts[s.role] = (roleCounts[s.role] || 0) + 1
    })
    return { total, individuals, institutions, roleCounts }
  }, [shareholders])

  // Get holdings detail for expanded row
  function getHoldings(shareholderId: string) {
    const equity = demoEquityGrants.filter(g => g.shareholderId === shareholderId)
    const options = demoOptionGrants.filter(g => g.shareholderId === shareholderId)
    const warrants = demoWarrants.filter(w => w.shareholderId === shareholderId)
    return { equity, options, warrants }
  }

  function getEquityClassName(classId: string) {
    return demoEquityClasses.find(c => c.id === classId)?.name ?? classId
  }

  function handleAddShareholder() {
    if (!formData.name.trim()) return
    const newShareholder: Shareholder = {
      id: `sh-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      type: formData.type,
      role: formData.role,
      shares: 0,
      equityClass: 'Common',
    }
    setShareholders(prev => [...prev, newShareholder])
    setFormData({ name: '', email: '', phone: '', type: 'individual', role: 'employee' })
    setShowAddModal(false)
  }

  const roleIcons: Record<string, typeof Users> = {
    founder: Award,
    employee: Briefcase,
    investor: Building2,
    advisor: Shield,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shareholders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage equity holders, track ownership, and view detailed holdings</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Shareholder
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Shareholders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Individuals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.individuals}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Institutions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.institutions}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">By Role</p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                {Object.entries(stats.roleCounts).map(([role, count]) => (
                  <span key={role} className="text-xs text-gray-600">
                    {role.charAt(0).toUpperCase() + role.slice(1)}: <span className="font-semibold text-gray-900">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card !p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="select-field text-sm"
              >
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
                <option value="institution">Institution</option>
              </select>
            </div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="select-field text-sm"
            >
              <option value="all">All Roles</option>
              <option value="founder">Founder</option>
              <option value="employee">Employee</option>
              <option value="investor">Investor</option>
              <option value="advisor">Advisor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shareholders Table */}
      <div className="card !p-0 overflow-hidden">
        {filteredShareholders.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No shareholders found"
            description={searchQuery || typeFilter !== 'all' || roleFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by adding your first shareholder.'}
            action={!searchQuery && typeFilter === 'all' && roleFilter === 'all' ? {
              label: 'Add Shareholder',
              onClick: () => setShowAddModal(true),
            } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header w-8"></th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Role</th>
                  <th className="table-header text-right">Equity Shares</th>
                  <th className="table-header text-right">Options</th>
                  <th className="table-header text-right">Warrants</th>
                  <th className="table-header text-right">Fully Diluted</th>
                  <th className="table-header text-right">% Ownership</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredShareholders.map(sh => {
                  const isExpanded = expandedRow === sh.id
                  const holdings = isExpanded ? getHoldings(sh.id) : null
                  const RoleIcon = roleIcons[sh.role] || Users

                  return (
                    <Fragment key={sh.id}>
                      <tr
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setExpandedRow(isExpanded ? null : sh.id)}
                      >
                        <td className="table-cell">
                          {isExpanded
                            ? <ChevronDown className="w-4 h-4 text-gray-400" />
                            : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-semibold">
                              {sh.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="font-medium text-gray-900">{sh.name}</span>
                          </div>
                        </td>
                        <td className="table-cell text-gray-500">{sh.email}</td>
                        <td className="table-cell">
                          <StatusBadge status={sh.type} />
                        </td>
                        <td className="table-cell">
                          <StatusBadge status={sh.role} />
                        </td>
                        <td className="table-cell text-right font-mono text-sm">
                          {formatNumber(sh.totalShares)}
                        </td>
                        <td className="table-cell text-right font-mono text-sm">
                          {sh.totalOptions > 0 ? formatNumber(sh.totalOptions) : <span className="text-gray-300">&mdash;</span>}
                        </td>
                        <td className="table-cell text-right font-mono text-sm">
                          {sh.totalWarrants > 0 ? formatNumber(sh.totalWarrants) : <span className="text-gray-300">&mdash;</span>}
                        </td>
                        <td className="table-cell text-right font-mono text-sm font-semibold">
                          {formatNumber(sh.fullyDilutedShares)}
                        </td>
                        <td className="table-cell text-right">
                          <span className="font-mono text-sm font-semibold text-primary-700">
                            {formatPercent(sh.fullyDilutedPercent)}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Holdings Detail */}
                      {isExpanded && holdings && (
                        <tr>
                          <td colSpan={10} className="bg-gray-50/50">
                            <div className="px-8 py-5 space-y-4">
                              {/* Equity Grants */}
                              {holdings.equity.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                                    Equity Grants
                                  </h4>
                                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <table className="w-full">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Certificate</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Class</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Grant Date</th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Shares</th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Price/Share</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {holdings.equity.map(g => (
                                          <tr key={g.id}>
                                            <td className="px-4 py-2 text-sm font-mono text-gray-700">{g.certificateNumber}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{getEquityClassName(g.equityClassId)}</td>
                                            <td className="px-4 py-2 text-sm text-gray-500">{formatDate(g.grantDate)}</td>
                                            <td className="px-4 py-2 text-sm text-right font-mono">{formatNumber(g.numberOfShares)}</td>
                                            <td className="px-4 py-2 text-sm text-right font-mono">${g.pricePerShare.toFixed(4)}</td>
                                            <td className="px-4 py-2"><StatusBadge status={g.status} /></td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Option Grants */}
                              {holdings.options.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent-500"></div>
                                    Option Grants
                                  </h4>
                                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <table className="w-full">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Grant Date</th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Options</th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Exercised</th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Outstanding</th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Exercise Price</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Expiration</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {holdings.options.map(g => (
                                          <tr key={g.id}>
                                            <td className="px-4 py-2 text-sm text-gray-500">{formatDate(g.grantDate)}</td>
                                            <td className="px-4 py-2 text-sm text-right font-mono">{formatNumber(g.numberOfOptions)}</td>
                                            <td className="px-4 py-2 text-sm text-right font-mono">{formatNumber(g.exercisedShares)}</td>
                                            <td className="px-4 py-2 text-sm text-right font-mono font-semibold">
                                              {formatNumber(g.numberOfOptions - g.exercisedShares)}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right font-mono">${g.exercisePrice.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-sm text-gray-500">{formatDate(g.expirationDate)}</td>
                                            <td className="px-4 py-2"><StatusBadge status={g.status} /></td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Warrants */}
                              {holdings.warrants.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                    Warrants
                                  </h4>
                                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <table className="w-full">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Grant Date</th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Shares</th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Exercise Price</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Expiration</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {holdings.warrants.map(w => (
                                          <tr key={w.id}>
                                            <td className="px-4 py-2 text-sm text-gray-500">{formatDate(w.grantDate)}</td>
                                            <td className="px-4 py-2 text-sm text-right font-mono">{formatNumber(w.numberOfShares)}</td>
                                            <td className="px-4 py-2 text-sm text-right font-mono">${w.exercisePrice.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-sm text-gray-500">{formatDate(w.expirationDate)}</td>
                                            <td className="px-4 py-2"><StatusBadge status={w.status} /></td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {holdings.equity.length === 0 && holdings.options.length === 0 && holdings.warrants.length === 0 && (
                                <p className="text-sm text-gray-400 italic">No holdings on record for this shareholder.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Shareholder Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Shareholder" size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input-field"
              placeholder="e.g. Jane Smith or Acme Ventures"
            />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="input-field"
              placeholder="jane@company.com"
            />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="input-field"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Shareholder Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="select-field"
              >
                <option value="individual">Individual</option>
                <option value="institution">Institution</option>
              </select>
            </div>
            <div>
              <label className="label">Role</label>
              <select
                value={formData.role}
                onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="select-field"
              >
                <option value="founder">Founder</option>
                <option value="employee">Employee</option>
                <option value="investor">Investor</option>
                <option value="advisor">Advisor</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setShowAddModal(false)} className="btn-secondary text-sm">
              Cancel
            </button>
            <button
              onClick={handleAddShareholder}
              disabled={!formData.name.trim()}
              className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              Add Shareholder
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

