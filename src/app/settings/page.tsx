'use client'

import { useState } from 'react'
import {
  Settings,
  Building2,
  Users,
  Network,
  Save,
  UserPlus,
  Upload,
  Shield,
  Mail,
  MoreVertical,
} from 'lucide-react'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import { demoCompany } from '@/lib/demo-data'
import { formatNumber } from '@/lib/calculations'

type SettingsTab = 'profile' | 'users' | 'group'

interface MockUser {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Editor' | 'Viewer'
  lastActive: string
  avatar: string
}

const mockUsers: MockUser[] = [
  { id: 'u-1', name: 'Alice Chen', email: 'alice@techventures.com', role: 'Admin', lastActive: '2026-03-17', avatar: 'AC' },
  { id: 'u-2', name: 'Bob Martinez', email: 'bob@techventures.com', role: 'Editor', lastActive: '2026-03-16', avatar: 'BM' },
  { id: 'u-3', name: 'Sarah Kim', email: 'sarah@techventures.com', role: 'Viewer', lastActive: '2026-03-10', avatar: 'SK' },
]

const tabs: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { id: 'profile', label: 'Profile', icon: Building2 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'group', label: 'Group Structure', icon: Network },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Profile form state
  const [profile, setProfile] = useState({
    name: demoCompany.name,
    incorporationDate: demoCompany.incorporationDate,
    state: demoCompany.state,
    country: demoCompany.country,
    authorizedCommon: demoCompany.authorizedCommon,
    authorizedPreferred: demoCompany.authorizedPreferred,
    parValue: demoCompany.parValue,
    fiscalYearEnd: demoCompany.fiscalYearEnd,
    industry: demoCompany.industry,
    address: '100 Innovation Way, Suite 400, San Francisco, CA 94105',
  })

  function renderProfileTab() {
    return (
      <div className="space-y-6">
        {/* Logo Upload */}
        <div>
          <label className="label">Company Logo</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white text-xl font-bold">
              TV
            </div>
            <div>
              <button className="btn-secondary text-sm flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                Upload Logo
              </button>
              <p className="text-xs text-gray-400 mt-1">PNG, SVG, or JPG. Max 2MB.</p>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="label">Company Name</label>
            <input
              type="text"
              className="input-field"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Industry</label>
            <select
              className="select-field"
              value={profile.industry}
              onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
            >
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="label">Incorporation Date</label>
            <input
              type="date"
              className="input-field"
              value={profile.incorporationDate}
              onChange={(e) => setProfile({ ...profile, incorporationDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label">State of Incorporation</label>
            <select
              className="select-field"
              value={profile.state}
              onChange={(e) => setProfile({ ...profile, state: e.target.value })}
            >
              <option value="Delaware">Delaware</option>
              <option value="California">California</option>
              <option value="New York">New York</option>
              <option value="Texas">Texas</option>
              <option value="Nevada">Nevada</option>
              <option value="Wyoming">Wyoming</option>
            </select>
          </div>
          <div>
            <label className="label">Country</label>
            <select
              className="select-field"
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="DE">Germany</option>
            </select>
          </div>
        </div>

        {/* Authorized Shares */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Authorized Share Capital</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="label">Authorized Common Shares</label>
              <input
                type="number"
                className="input-field"
                value={profile.authorizedCommon}
                onChange={(e) => setProfile({ ...profile, authorizedCommon: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="label">Authorized Preferred Shares</label>
              <input
                type="number"
                className="input-field"
                value={profile.authorizedPreferred}
                onChange={(e) => setProfile({ ...profile, authorizedPreferred: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="label">Par Value ($)</label>
              <input
                type="number"
                step="0.0001"
                className="input-field"
                value={profile.parValue}
                onChange={(e) => setProfile({ ...profile, parValue: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Additional Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Fiscal Year End</label>
              <input
                type="text"
                className="input-field"
                value={profile.fiscalYearEnd}
                onChange={(e) => setProfile({ ...profile, fiscalYearEnd: e.target.value })}
                placeholder="12/31"
              />
            </div>
            <div>
              <label className="label">Registered Address</label>
              <input
                type="text"
                className="input-field"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderUsersTab() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Team Members</h3>
            <p className="text-xs text-gray-500 mt-0.5">{mockUsers.length} user{mockUsers.length !== 1 ? 's' : ''} with access</p>
          </div>
          <button onClick={() => setShowInviteModal(true)} className="btn-primary text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite User
          </button>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">User</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Last Active</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-semibold">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'Editor' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'Admin' && <Shield className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500 text-sm">
                      {new Date(user.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="table-cell">
                      <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role descriptions */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card bg-purple-50 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-semibold text-purple-900">Admin</h4>
            </div>
            <p className="text-xs text-purple-700">Full access to all features, settings, and user management.</p>
          </div>
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-semibold text-blue-900">Editor</h4>
            </div>
            <p className="text-xs text-blue-700">Can view and edit cap table data, but cannot manage users or settings.</p>
          </div>
          <div className="card bg-gray-50 border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-600" />
              <h4 className="text-sm font-semibold text-gray-900">Viewer</h4>
            </div>
            <p className="text-xs text-gray-700">Read-only access to cap table data and reports.</p>
          </div>
        </div>
      </div>
    )
  }

  function renderGroupTab() {
    return (
      <div className="space-y-6">
        <div className="card bg-gray-50 border-dashed border-2 border-gray-300 text-center py-12">
          <Network className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Parent / Subsidiary Company Relationships
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-100 text-accent-800 mb-3">
            Beta
          </span>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Define your corporate group structure, manage inter-company shareholdings, and generate consolidated cap tables across multiple entities.
          </p>

          {/* Placeholder diagram */}
          <div className="max-w-sm mx-auto">
            <div className="flex flex-col items-center">
              <div className="px-4 py-2 bg-primary-100 border border-primary-300 rounded-lg text-sm font-semibold text-primary-800">
                TechVentures Inc.
              </div>
              <div className="w-px h-6 bg-gray-300" />
              <div className="flex gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-px h-6 bg-gray-300" />
                  <div className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-xs font-medium text-gray-600">
                    Subsidiary A
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-px h-6 bg-gray-300" />
                  <div className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-xs font-medium text-gray-600">
                    Subsidiary B
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage company profile, team access, and corporate structure.
        </p>
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
      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'users' && renderUsersTab()}
      {activeTab === 'group' && renderGroupTab()}

      {/* Save Button (for profile tab) */}
      {activeTab === 'profile' && (
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      )}

      {/* Invite User Modal */}
      <Modal open={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite User" size="md">
        <form onSubmit={(e) => { e.preventDefault(); setShowInviteModal(false) }} className="space-y-5">
          <div>
            <label className="label">Email Address</label>
            <input type="email" className="input-field" placeholder="user@company.com" required />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="select-field" defaultValue="Viewer">
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          <div>
            <label className="label">Personal Message (Optional)</label>
            <textarea className="input-field" rows={3} placeholder="You've been invited to manage the cap table..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setShowInviteModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Send Invite
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
