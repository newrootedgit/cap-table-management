'use client'

import { useState, useMemo, Fragment } from 'react'
import {
  Calendar, Clock, Plus, ChevronDown, ChevronRight, Zap,
  CheckCircle2, Timer, BarChart3, Play, Pause, Award,
} from 'lucide-react'
import {
  demoVestingPlans, demoEquityGrants, demoOptionGrants, demoShareholders,
} from '@/lib/demo-data'
import { formatNumber, formatPercent, calculateVesting, generateVestingSchedule } from '@/lib/calculations'
import { formatDate } from '@/lib/utils'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

interface VestingPlan {
  id: string
  name: string
  totalDurationMonths: number
  cliffMonths: number
  vestingFrequency: string
  accelerationTrigger: string
}

// Pre-built templates for quick creation
const planTemplates: Omit<VestingPlan, 'id'>[] = [
  { name: '4yr / 1yr Cliff (Monthly)', totalDurationMonths: 48, cliffMonths: 12, vestingFrequency: 'monthly', accelerationTrigger: 'none' },
  { name: '3yr / 1yr Cliff (Monthly)', totalDurationMonths: 36, cliffMonths: 12, vestingFrequency: 'monthly', accelerationTrigger: 'double_trigger' },
  { name: '2yr / 6mo Cliff (Quarterly)', totalDurationMonths: 24, cliffMonths: 6, vestingFrequency: 'quarterly', accelerationTrigger: 'single_trigger' },
  { name: '1yr Monthly (No Cliff)', totalDurationMonths: 12, cliffMonths: 0, vestingFrequency: 'monthly', accelerationTrigger: 'none' },
]

function getShareholderName(id: string): string {
  return demoShareholders.find(s => s.id === id)?.name ?? 'Unknown'
}

function getPlanById(id: string, plans: VestingPlan[]): VestingPlan | undefined {
  return plans.find(p => p.id === id)
}

function frequencyLabel(freq: string): string {
  return freq.charAt(0).toUpperCase() + freq.slice(1)
}

function accelerationLabel(trigger: string): string {
  switch (trigger) {
    case 'none': return 'None'
    case 'single_trigger': return 'Single Trigger'
    case 'double_trigger': return 'Double Trigger'
    case 'full': return 'Full Acceleration'
    default: return trigger.replace(/_/g, ' ')
  }
}

function monthsDiff(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
}

export default function VestingPage() {
  const [vestingPlans, setVestingPlans] = useState<VestingPlan[]>(demoVestingPlans as VestingPlan[])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [expandedGrant, setExpandedGrant] = useState<string | null>(null)
  const [selectedChartGrant, setSelectedChartGrant] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    totalDurationMonths: 48,
    cliffMonths: 12,
    vestingFrequency: 'monthly',
    accelerationTrigger: 'none',
  })

  // Build active vesting grants from equity and option grants that have a vestingPlanId
  const activeGrants = useMemo(() => {
    const now = new Date()
    const grants: Array<{
      id: string
      shareholderId: string
      shareholderName: string
      grantType: 'Equity' | 'Option'
      totalShares: number
      grantDate: string
      vestingPlanId: string
      plan: VestingPlan | undefined
      monthsElapsed: number
      vestedShares: number
      vestingProgress: number
      nextVestingDate: Date | null
      status: string
    }> = []

    // Equity grants with vesting
    demoEquityGrants.forEach(g => {
      if (!g.vestingPlanId) return
      const plan = getPlanById(g.vestingPlanId, vestingPlans)
      if (!plan) return
      const elapsed = Math.max(0, monthsDiff(new Date(g.grantDate), now))
      const vested = calculateVesting(g.numberOfShares, plan.totalDurationMonths, plan.cliffMonths, elapsed)
      const progress = g.numberOfShares > 0 ? (vested / g.numberOfShares) * 100 : 0

      // Calculate next vesting date
      let nextVestingDate: Date | null = null
      if (elapsed < plan.totalDurationMonths) {
        const step = plan.vestingFrequency === 'monthly' ? 1 : plan.vestingFrequency === 'quarterly' ? 3 : 12
        let nextMonth = elapsed < plan.cliffMonths ? plan.cliffMonths : elapsed + step
        if (nextMonth <= plan.totalDurationMonths) {
          nextVestingDate = new Date(g.grantDate)
          nextVestingDate.setMonth(nextVestingDate.getMonth() + nextMonth)
        }
      }

      grants.push({
        id: g.id,
        shareholderId: g.shareholderId,
        shareholderName: getShareholderName(g.shareholderId),
        grantType: 'Equity',
        totalShares: g.numberOfShares,
        grantDate: g.grantDate,
        vestingPlanId: g.vestingPlanId,
        plan,
        monthsElapsed: elapsed,
        vestedShares: vested,
        vestingProgress: Math.min(progress, 100),
        nextVestingDate,
        status: progress >= 100 ? 'fully_vested' : elapsed < plan.cliffMonths ? 'cliff' : 'vesting',
      })
    })

    // Option grants with vesting
    demoOptionGrants.forEach(g => {
      if (!g.vestingPlanId) return
      const plan = getPlanById(g.vestingPlanId, vestingPlans)
      if (!plan) return
      const elapsed = Math.max(0, monthsDiff(new Date(g.grantDate), now))
      const vested = calculateVesting(g.numberOfOptions, plan.totalDurationMonths, plan.cliffMonths, elapsed)
      const progress = g.numberOfOptions > 0 ? (vested / g.numberOfOptions) * 100 : 0

      let nextVestingDate: Date | null = null
      if (elapsed < plan.totalDurationMonths) {
        const step = plan.vestingFrequency === 'monthly' ? 1 : plan.vestingFrequency === 'quarterly' ? 3 : 12
        let nextMonth = elapsed < plan.cliffMonths ? plan.cliffMonths : elapsed + step
        if (nextMonth <= plan.totalDurationMonths) {
          nextVestingDate = new Date(g.grantDate)
          nextVestingDate.setMonth(nextVestingDate.getMonth() + nextMonth)
        }
      }

      grants.push({
        id: g.id,
        shareholderId: g.shareholderId,
        shareholderName: getShareholderName(g.shareholderId),
        grantType: 'Option',
        totalShares: g.numberOfOptions,
        grantDate: g.grantDate,
        vestingPlanId: g.vestingPlanId,
        plan,
        monthsElapsed: elapsed,
        vestedShares: vested,
        vestingProgress: Math.min(progress, 100),
        nextVestingDate,
        status: progress >= 100 ? 'fully_vested' : elapsed < plan.cliffMonths ? 'cliff' : 'vesting',
      })
    })

    return grants
  }, [vestingPlans])

  // Generate chart data for a selected grant
  const chartData = useMemo(() => {
    if (!selectedChartGrant) return null
    const grant = activeGrants.find(g => g.id === selectedChartGrant)
    if (!grant || !grant.plan) return null

    const schedule = generateVestingSchedule(
      grant.totalShares,
      grant.plan.totalDurationMonths,
      grant.plan.cliffMonths,
      new Date(grant.grantDate),
      grant.plan.vestingFrequency as 'monthly' | 'quarterly' | 'annually',
    )

    // Add a start point
    return [
      {
        date: formatDate(grant.grantDate),
        vested: 0,
        total: grant.totalShares,
        month: 0,
      },
      ...schedule.map((entry, i) => ({
        date: formatDate(entry.date),
        vested: entry.cumulativeVested,
        total: grant.totalShares,
        month: i + 1,
      })),
    ]
  }, [selectedChartGrant, activeGrants])

  const selectedGrantInfo = activeGrants.find(g => g.id === selectedChartGrant)

  function handleCreatePlan() {
    if (!formData.name.trim()) return
    const newPlan: VestingPlan = {
      id: `vp-${Date.now()}`,
      ...formData,
    }
    setVestingPlans(prev => [...prev, newPlan])
    setFormData({
      name: '',
      totalDurationMonths: 48,
      cliffMonths: 12,
      vestingFrequency: 'monthly',
      accelerationTrigger: 'none',
    })
    setShowCreateModal(false)
  }

  function handleUseTemplate(template: Omit<VestingPlan, 'id'>) {
    setFormData({
      name: template.name,
      totalDurationMonths: template.totalDurationMonths,
      cliffMonths: template.cliffMonths,
      vestingFrequency: template.vestingFrequency,
      accelerationTrigger: template.accelerationTrigger,
    })
    setShowCreateModal(true)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vesting Plans & Schedules</h1>
          <p className="text-sm text-gray-500 mt-1">Manage vesting templates, track active grants, and visualize vesting timelines</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Plan
        </button>
      </div>

      {/* ─── Vesting Plan Templates ─────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Plan Templates</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vestingPlans.map(plan => {
            const grantCount = activeGrants.filter(g => g.vestingPlanId === plan.id).length
            return (
              <div key={plan.id} className="card hover:border-primary-300 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  {grantCount > 0 && (
                    <span className="badge-purple text-xs">{grantCount} grant{grantCount !== 1 ? 's' : ''}</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-3">{plan.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium text-gray-700">{plan.totalDurationMonths} months</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Cliff</span>
                    <span className="font-medium text-gray-700">
                      {plan.cliffMonths > 0 ? `${plan.cliffMonths} months` : 'None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Frequency</span>
                    <span className="font-medium text-gray-700">{frequencyLabel(plan.vestingFrequency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Acceleration</span>
                    <span className="font-medium text-gray-700">{accelerationLabel(plan.accelerationTrigger)}</span>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Quick-add template cards */}
          {planTemplates
            .filter(t => !vestingPlans.some(p => p.name === t.name))
            .map((template, i) => (
              <button
                key={i}
                onClick={() => handleUseTemplate(template)}
                className="card border-dashed border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 transition-all group text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-primary-500">Template</span>
                </div>
                <h3 className="font-semibold text-gray-500 group-hover:text-gray-900 text-sm mb-3 transition-colors">{template.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-gray-500">{template.totalDurationMonths}mo</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Cliff</span>
                    <span className="text-gray-500">{template.cliffMonths > 0 ? `${template.cliffMonths}mo` : 'None'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Frequency</span>
                    <span className="text-gray-500">{frequencyLabel(template.vestingFrequency)}</span>
                  </div>
                </div>
              </button>
            ))}
        </div>
      </section>

      {/* ─── Vesting Chart Visualization ──────────────────────────── */}
      {selectedChartGrant && chartData && selectedGrantInfo && (
        <section className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary-600" />
                Vesting Schedule: {selectedGrantInfo.shareholderName}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedGrantInfo.grantType} grant &middot; {formatNumber(selectedGrantInfo.totalShares)} shares &middot; {selectedGrantInfo.plan?.name}
              </p>
            </div>
            <button
              onClick={() => setSelectedChartGrant(null)}
              className="btn-secondary text-xs"
            >
              Close Chart
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <defs>
                  <linearGradient id="vestingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => formatNumber(v)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [formatNumber(value), 'Vested Shares']}
                  labelStyle={{ fontWeight: 600, color: '#111827' }}
                />
                <Area
                  type="stepAfter"
                  dataKey="vested"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fill="url(#vestingGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#7c3aed', strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* ─── Active Vesting Grants ────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Timer className="w-5 h-5 text-accent-600" />
          <h2 className="text-lg font-semibold text-gray-900">Active Vesting Grants</h2>
          <span className="ml-2 badge-purple text-xs">{activeGrants.length} total</span>
        </div>

        <div className="card !p-0 overflow-hidden">
          {activeGrants.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No vesting grants"
              description="Grants with vesting plans will appear here once created."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header w-8"></th>
                    <th className="table-header">Shareholder</th>
                    <th className="table-header">Grant Type</th>
                    <th className="table-header text-right">Total Shares</th>
                    <th className="table-header">Plan</th>
                    <th className="table-header">Vesting Progress</th>
                    <th className="table-header text-right">Vested / Total</th>
                    <th className="table-header">Next Vesting</th>
                    <th className="table-header w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeGrants.map(grant => {
                    const isExpanded = expandedGrant === grant.id

                    // Generate schedule for expanded view
                    const schedule = isExpanded && grant.plan
                      ? generateVestingSchedule(
                          grant.totalShares,
                          grant.plan.totalDurationMonths,
                          grant.plan.cliffMonths,
                          new Date(grant.grantDate),
                          grant.plan.vestingFrequency as 'monthly' | 'quarterly' | 'annually',
                        )
                      : []

                    return (
                      <Fragment key={grant.id}>
                        <tr
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setExpandedGrant(isExpanded ? null : grant.id)}
                        >
                          <td className="table-cell">
                            {isExpanded
                              ? <ChevronDown className="w-4 h-4 text-gray-400" />
                              : <ChevronRight className="w-4 h-4 text-gray-400" />}
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-semibold">
                                {grant.shareholderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <span className="font-medium text-gray-900">{grant.shareholderName}</span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              grant.grantType === 'Equity'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-accent-100 text-accent-800'
                            }`}>
                              {grant.grantType === 'Equity' ? <Award className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                              {grant.grantType}
                            </span>
                          </td>
                          <td className="table-cell text-right font-mono text-sm">
                            {formatNumber(grant.totalShares)}
                          </td>
                          <td className="table-cell text-sm text-gray-600">
                            {grant.plan?.name ?? 'Unknown'}
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-3 min-w-[180px]">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    grant.vestingProgress >= 100
                                      ? 'bg-green-500'
                                      : grant.vestingProgress > 0
                                        ? 'bg-gradient-to-r from-primary-500 to-accent-500'
                                        : 'bg-gray-300'
                                  }`}
                                  style={{ width: `${Math.min(grant.vestingProgress, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-600 w-12 text-right">
                                {formatPercent(grant.vestingProgress)}
                              </span>
                            </div>
                          </td>
                          <td className="table-cell text-right font-mono text-sm">
                            <span className="font-semibold text-primary-700">{formatNumber(grant.vestedShares)}</span>
                            <span className="text-gray-400"> / {formatNumber(grant.totalShares)}</span>
                          </td>
                          <td className="table-cell text-sm">
                            {grant.nextVestingDate ? (
                              <span className="text-gray-600">{formatDate(grant.nextVestingDate)}</span>
                            ) : (
                              <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Fully Vested
                              </span>
                            )}
                          </td>
                          <td className="table-cell">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedChartGrant(selectedChartGrant === grant.id ? null : grant.id)
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                selectedChartGrant === grant.id
                                  ? 'bg-primary-100 text-primary-700'
                                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                              }`}
                              title="View vesting chart"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Vesting Schedule */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={9} className="bg-gray-50/50">
                              <div className="px-8 py-5">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                                    Full Vesting Schedule
                                  </h4>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>Grant Date: <span className="font-medium text-gray-700">{formatDate(grant.grantDate)}</span></span>
                                    <span>Months Elapsed: <span className="font-medium text-gray-700">{grant.monthsElapsed}</span></span>
                                    <span>Status: <span className={`font-medium ${
                                      grant.status === 'fully_vested' ? 'text-green-600'
                                        : grant.status === 'cliff' ? 'text-yellow-600'
                                          : 'text-primary-600'
                                    }`}>
                                      {grant.status === 'fully_vested' ? 'Fully Vested' : grant.status === 'cliff' ? 'In Cliff' : 'Vesting'}
                                    </span></span>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-64 overflow-y-auto">
                                  <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Vesting Date</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Shares This Period</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Cumulative Vested</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">% Vested</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {schedule.map((entry, idx) => {
                                        const pct = grant.totalShares > 0 ? (entry.cumulativeVested / grant.totalShares) * 100 : 0
                                        const isPast = entry.date <= new Date()
                                        return (
                                          <tr key={idx} className={isPast ? 'bg-green-50/30' : ''}>
                                            <td className="px-4 py-2 text-sm text-gray-700">{formatDate(entry.date)}</td>
                                            <td className="px-4 py-2 text-sm text-right font-mono">
                                              +{formatNumber(entry.sharesVested)}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right font-mono font-semibold">
                                              {formatNumber(entry.cumulativeVested)}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right font-mono text-primary-600">
                                              {formatPercent(pct)}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                              {isPast ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                                                  <CheckCircle2 className="w-3 h-3" /> Vested
                                                </span>
                                              ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                                                  <Clock className="w-3 h-3" /> Pending
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
      </section>

      {/* Create Plan Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Vesting Plan" size="md">
        <div className="space-y-4">
          {/* Template Quick-Select */}
          <div>
            <label className="label mb-2">Quick Start from Template</label>
            <div className="grid grid-cols-2 gap-2">
              {planTemplates.map((t, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setFormData({
                      name: t.name,
                      totalDurationMonths: t.totalDurationMonths,
                      cliffMonths: t.cliffMonths,
                      vestingFrequency: t.vestingFrequency,
                      accelerationTrigger: t.accelerationTrigger,
                    })
                  }
                  className={`text-left p-2.5 rounded-lg border text-xs transition-colors ${
                    formData.name === t.name
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <span className="font-medium block">{t.name}</span>
                  <span className="text-gray-400 mt-0.5 block">
                    {t.totalDurationMonths}mo &middot; {t.cliffMonths > 0 ? `${t.cliffMonths}mo cliff` : 'no cliff'} &middot; {t.vestingFrequency}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          <div>
            <label className="label">Plan Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input-field"
              placeholder="e.g. 4yr / 1yr Cliff (Monthly)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Total Duration (months)</label>
              <input
                type="number"
                value={formData.totalDurationMonths}
                onChange={e => setFormData(prev => ({ ...prev, totalDurationMonths: parseInt(e.target.value) || 0 }))}
                className="input-field"
                min={1}
                max={120}
              />
            </div>
            <div>
              <label className="label">Cliff Period (months)</label>
              <input
                type="number"
                value={formData.cliffMonths}
                onChange={e => setFormData(prev => ({ ...prev, cliffMonths: parseInt(e.target.value) || 0 }))}
                className="input-field"
                min={0}
                max={formData.totalDurationMonths}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Vesting Frequency</label>
              <select
                value={formData.vestingFrequency}
                onChange={e => setFormData(prev => ({ ...prev, vestingFrequency: e.target.value }))}
                className="select-field"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
            <div>
              <label className="label">Acceleration Trigger</label>
              <select
                value={formData.accelerationTrigger}
                onChange={e => setFormData(prev => ({ ...prev, accelerationTrigger: e.target.value }))}
                className="select-field"
              >
                <option value="none">None</option>
                <option value="single_trigger">Single Trigger</option>
                <option value="double_trigger">Double Trigger</option>
                <option value="full">Full Acceleration</option>
              </select>
            </div>
          </div>

          {/* Preview */}
          {formData.name && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Preview</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Plan</span>
                <span className="font-medium text-gray-900">{formData.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Schedule</span>
                <span className="text-gray-700">
                  {formData.totalDurationMonths} months total, {formData.cliffMonths > 0 ? `${formData.cliffMonths}-month cliff` : 'no cliff'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Vesting</span>
                <span className="text-gray-700">{frequencyLabel(formData.vestingFrequency)} after cliff</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Acceleration</span>
                <span className="text-gray-700">{accelerationLabel(formData.accelerationTrigger)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setShowCreateModal(false)} className="btn-secondary text-sm">
              Cancel
            </button>
            <button
              onClick={handleCreatePlan}
              disabled={!formData.name.trim()}
              className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Create Plan
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
