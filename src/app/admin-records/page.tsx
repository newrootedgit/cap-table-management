'use client'

import { useState } from 'react'
import {
  Award,
  FileText,
  FilePlus,
  ScrollText,
  Shield,
  Edit3,
  Eye,
  Plus,
  Stamp,
  Handshake,
  Copy,
} from 'lucide-react'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import { demoShareholders, demoEquityGrants } from '@/lib/demo-data'
import { formatDate } from '@/lib/utils'

type AdminTab = 'templates' | 'resolutions' | 'certificates' | 'agreements'

// ─── Mock Data ──────────────────────────────────────────────

interface Template {
  id: string
  name: string
  description: string
  icon: typeof FileText
  lastModified: string
}

const mockTemplates: Template[] = [
  { id: 't-1', name: 'Stock Certificate', description: 'Standard stock certificate template for common and preferred shares.', icon: Stamp, lastModified: '2024-01-15' },
  { id: 't-2', name: 'Option Agreement', description: 'Incentive stock option agreement template under the equity incentive plan.', icon: FileText, lastModified: '2024-03-01' },
  { id: 't-3', name: 'SAFE Agreement', description: 'Simple Agreement for Future Equity (post-money SAFE) template.', icon: Handshake, lastModified: '2023-06-01' },
  { id: 't-4', name: 'Stock Purchase Agreement', description: 'Restricted stock purchase agreement template with vesting provisions.', icon: ScrollText, lastModified: '2024-02-20' },
]

interface Resolution {
  id: string
  title: string
  date: string
  description: string
  status: 'approved' | 'pending' | 'draft'
  document: string
}

const mockResolutions: Resolution[] = [
  { id: 'res-1', title: 'Authorization of 2023 Equity Incentive Plan', date: '2023-01-15', description: 'Unanimous written consent authorizing the adoption of the 2023 Equity Incentive Plan with 2,000,000 share reserve.', status: 'approved', document: 'board-resolution-eip.pdf' },
  { id: 'res-2', title: 'Series A Preferred Stock Authorization', date: '2024-03-10', description: 'Board resolution authorizing the issuance of up to 2,500,000 shares of Series A Preferred Stock.', status: 'approved', document: 'board-resolution-series-a.pdf' },
  { id: 'res-3', title: 'Series B Preferred Stock Authorization', date: '2025-05-20', description: 'Board resolution authorizing the issuance of up to 2,500,000 shares of Series B Preferred Stock.', status: 'approved', document: 'board-resolution-series-b.pdf' },
  { id: 'res-4', title: '409A Valuation Acceptance - Q1 2026', date: '2026-02-15', description: 'Board resolution accepting the independent 409A valuation report and setting FMV.', status: 'pending', document: '' },
]

interface Certificate {
  id: string
  number: string
  shareholderId: string
  grantId: string
  generatedDate: string
}

const mockCertificates: Certificate[] = [
  { id: 'cert-1', number: 'CS-001', shareholderId: 'sh-1', grantId: 'eg-1', generatedDate: '2023-01-15' },
  { id: 'cert-2', number: 'CS-002', shareholderId: 'sh-2', grantId: 'eg-2', generatedDate: '2023-01-15' },
  { id: 'cert-3', number: 'CS-003', shareholderId: 'sh-3', grantId: 'eg-3', generatedDate: '2023-06-01' },
  { id: 'cert-4', number: 'PA-001', shareholderId: 'sh-4', grantId: 'eg-4', generatedDate: '2024-03-15' },
  { id: 'cert-5', number: 'PB-001', shareholderId: 'sh-5', grantId: 'eg-5', generatedDate: '2025-06-01' },
  { id: 'cert-6', number: 'CS-004', shareholderId: 'sh-6', grantId: 'eg-6', generatedDate: '2024-01-15' },
  { id: 'cert-7', number: 'CS-005', shareholderId: 'sh-7', grantId: 'eg-7', generatedDate: '2024-06-01' },
  { id: 'cert-8', number: 'PA-002', shareholderId: 'sh-8', grantId: 'eg-8', generatedDate: '2024-03-15' },
]

interface Agreement {
  id: string
  type: string
  shareholderId: string
  status: 'signed' | 'pending' | 'draft'
  date: string
}

const mockAgreements: Agreement[] = [
  { id: 'agr-1', type: 'Stock Purchase Agreement', shareholderId: 'sh-1', status: 'signed', date: '2023-01-15' },
  { id: 'agr-2', type: 'Stock Purchase Agreement', shareholderId: 'sh-2', status: 'signed', date: '2023-01-15' },
  { id: 'agr-3', type: 'Restricted Stock Purchase Agreement', shareholderId: 'sh-3', status: 'signed', date: '2023-06-01' },
  { id: 'agr-4', type: 'Series A SPA', shareholderId: 'sh-4', status: 'signed', date: '2024-03-15' },
  { id: 'agr-5', type: 'Series B SPA', shareholderId: 'sh-5', status: 'signed', date: '2025-06-01' },
  { id: 'agr-6', type: 'Option Agreement', shareholderId: 'sh-6', status: 'signed', date: '2024-03-01' },
  { id: 'agr-7', type: 'Advisor Agreement', shareholderId: 'sh-7', status: 'pending', date: '2024-06-01' },
  { id: 'agr-8', type: 'Series A SPA', shareholderId: 'sh-8', status: 'signed', date: '2024-03-15' },
]

function getShareholder(id: string) {
  return demoShareholders.find((s) => s.id === id)
}

function getGrant(id: string) {
  return demoEquityGrants.find((g) => g.id === id)
}

const tabs: { id: AdminTab; label: string; icon: typeof FileText }[] = [
  { id: 'templates', label: 'Templates', icon: Copy },
  { id: 'resolutions', label: 'Board Resolutions', icon: ScrollText },
  { id: 'certificates', label: 'Certificates', icon: Stamp },
  { id: 'agreements', label: 'Agreements', icon: Handshake },
]

export default function AdminRecordsPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('templates')
  const [showAddModal, setShowAddModal] = useState(false)

  function renderTemplatesTab() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockTemplates.map((template) => {
          const Icon = template.icon
          return (
            <div key={template.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  <p className="text-xs text-gray-400 mt-2">Last modified: {formatDate(template.lastModified)}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3">
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                    <button className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3">
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  function renderResolutionsTab() {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Resolution
          </button>
        </div>
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Title</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Description</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockResolutions.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium text-gray-900">{res.title}</td>
                    <td className="table-cell text-gray-600">{formatDate(res.date)}</td>
                    <td className="table-cell text-gray-500 text-xs max-w-xs">{res.description}</td>
                    <td className="table-cell"><StatusBadge status={res.status} /></td>
                    <td className="table-cell">
                      {res.document ? (
                        <button className="text-primary-600 hover:text-primary-700 text-xs font-medium flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          View
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Not attached</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  function renderCertificatesTab() {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Generate Certificate
          </button>
        </div>
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Certificate #</th>
                  <th className="table-header">Shareholder</th>
                  <th className="table-header">Grant</th>
                  <th className="table-header">Shares</th>
                  <th className="table-header">Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockCertificates.map((cert) => {
                  const sh = getShareholder(cert.shareholderId)
                  const grant = getGrant(cert.grantId)
                  return (
                    <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-mono text-xs font-medium text-primary-600">{cert.number}</td>
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">{sh?.name ?? 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{sh?.email}</div>
                      </td>
                      <td className="table-cell text-gray-600 text-xs">{cert.grantId}</td>
                      <td className="table-cell font-medium">{grant ? new Intl.NumberFormat('en-US').format(grant.numberOfShares) : '-'}</td>
                      <td className="table-cell text-gray-600">{formatDate(cert.generatedDate)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  function renderAgreementsTab() {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Agreement
          </button>
        </div>
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Type</th>
                  <th className="table-header">Shareholder</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockAgreements.map((agr) => {
                  const sh = getShareholder(agr.shareholderId)
                  return (
                    <tr key={agr.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Handshake className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{agr.type}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">{sh?.name ?? 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{sh?.email}</div>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          agr.status === 'signed' ? 'bg-green-100 text-green-800' :
                          agr.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {agr.status.charAt(0).toUpperCase() + agr.status.slice(1)}
                        </span>
                      </td>
                      <td className="table-cell text-gray-600">{formatDate(agr.date)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Dynamic modal title based on active tab
  const addModalTitles: Record<AdminTab, string> = {
    templates: 'Add Template',
    resolutions: 'Add Board Resolution',
    certificates: 'Generate Certificate',
    agreements: 'Add Agreement',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Records</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage document templates, board resolutions, stock certificates, and legal agreements.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Templates</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{mockTemplates.length}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Board Resolutions</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{mockResolutions.length}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Certificates</p>
          <p className="mt-1 text-2xl font-bold text-primary-600">{mockCertificates.length}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Agreements</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{mockAgreements.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'templates' && renderTemplatesTab()}
      {activeTab === 'resolutions' && renderResolutionsTab()}
      {activeTab === 'certificates' && renderCertificatesTab()}
      {activeTab === 'agreements' && renderAgreementsTab()}

      {/* Add Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title={addModalTitles[activeTab]} size="lg">
        {activeTab === 'resolutions' && (
          <form onSubmit={(e) => { e.preventDefault(); setShowAddModal(false) }} className="space-y-5">
            <div>
              <label className="label">Title</label>
              <input type="text" className="input-field" placeholder="e.g. Authorization of Series C Preferred" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Date</label>
                <input type="date" className="input-field" required />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="select-field" defaultValue="draft">
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input-field" rows={3} placeholder="Brief description of the resolution..." required />
            </div>
            <div>
              <label className="label">Attach Document</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                <FilePlus className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Click to attach or drag and drop</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add Resolution</button>
            </div>
          </form>
        )}

        {activeTab === 'certificates' && (
          <form onSubmit={(e) => { e.preventDefault(); setShowAddModal(false) }} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Certificate Number</label>
                <input type="text" className="input-field" placeholder="e.g. CS-009" required />
              </div>
              <div>
                <label className="label">Shareholder</label>
                <select className="select-field" required>
                  <option value="">Select shareholder...</option>
                  {demoShareholders.map((sh) => (
                    <option key={sh.id} value={sh.id}>{sh.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Associated Grant</label>
              <select className="select-field" required>
                <option value="">Select grant...</option>
                {demoEquityGrants.map((g) => (
                  <option key={g.id} value={g.id}>{g.certificateNumber} - {new Intl.NumberFormat('en-US').format(g.numberOfShares)} shares</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Stamp className="w-4 h-4" />
                Generate Certificate
              </button>
            </div>
          </form>
        )}

        {activeTab === 'agreements' && (
          <form onSubmit={(e) => { e.preventDefault(); setShowAddModal(false) }} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Agreement Type</label>
                <select className="select-field" required>
                  <option value="">Select type...</option>
                  <option value="Stock Purchase Agreement">Stock Purchase Agreement</option>
                  <option value="Restricted Stock Purchase Agreement">Restricted Stock Purchase Agreement</option>
                  <option value="Option Agreement">Option Agreement</option>
                  <option value="SAFE Agreement">SAFE Agreement</option>
                  <option value="Advisor Agreement">Advisor Agreement</option>
                  <option value="Investor Rights Agreement">Investor Rights Agreement</option>
                </select>
              </div>
              <div>
                <label className="label">Shareholder</label>
                <select className="select-field" required>
                  <option value="">Select shareholder...</option>
                  {demoShareholders.map((sh) => (
                    <option key={sh.id} value={sh.id}>{sh.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Date</label>
                <input type="date" className="input-field" required />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="select-field" defaultValue="pending">
                  <option value="signed">Signed</option>
                  <option value="pending">Pending</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add Agreement</button>
            </div>
          </form>
        )}

        {activeTab === 'templates' && (
          <form onSubmit={(e) => { e.preventDefault(); setShowAddModal(false) }} className="space-y-5">
            <div>
              <label className="label">Template Name</label>
              <input type="text" className="input-field" placeholder="e.g. RSU Agreement" required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input-field" rows={3} placeholder="Describe the template purpose..." required />
            </div>
            <div>
              <label className="label">Upload Template File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                <FilePlus className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">DOCX or PDF template file</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add Template</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
