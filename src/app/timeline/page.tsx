'use client'

import { useState, useMemo } from 'react'
import {
  Clock, Search, Filter, Building2, FileSpreadsheet, Briefcase,
  Shield, ArrowRightLeft, RefreshCw, Award, Landmark, DollarSign
} from 'lucide-react'
import { demoTimeline } from '@/lib/demo-data'
import { formatDate } from '@/lib/utils'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'

type EntityType = 'company' | 'equity_grant' | 'option_pool' | 'option_grant' | 'convertible' | 'transaction' | 'warrant'

const entityConfig: Record<EntityType, { icon: typeof Clock; color: string; bgColor: string; borderColor: string }> = {
  company: { icon: Building2, color: 'text-primary-600', bgColor: 'bg-primary-100', borderColor: 'border-primary-300' },
  equity_grant: { icon: FileSpreadsheet, color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-300' },
  option_pool: { icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
  option_grant: { icon: Award, color: 'text-teal-600', bgColor: 'bg-teal-100', borderColor: 'border-teal-300' },
  convertible: { icon: DollarSign, color: 'text-amber-600', bgColor: 'bg-amber-100', borderColor: 'border-amber-300' },
  transaction: { icon: ArrowRightLeft, color: 'text-orange-600', bgColor: 'bg-orange-100', borderColor: 'border-orange-300' },
  warrant: { icon: Shield, color: 'text-indigo-600', bgColor: 'bg-indigo-100', borderColor: 'border-indigo-300' },
}

const allEntityTypes: EntityType[] = ['company', 'equity_grant', 'option_pool', 'option_grant', 'convertible', 'transaction', 'warrant']

const entityLabels: Record<EntityType, string> = {
  company: 'Company',
  equity_grant: 'Equity Grant',
  option_pool: 'Option Pool',
  option_grant: 'Option Grant',
  convertible: 'Convertible',
  transaction: 'Transaction',
  warrant: 'Warrant',
}

export default function TimelinePage() {
  const [filterType, setFilterType] = useState<string>('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = useMemo(() => {
    return [...demoTimeline]
      .filter(event => {
        if (filterType !== 'all' && event.entityType !== filterType) return false
        if (filterDateFrom && event.date < filterDateFrom) return false
        if (filterDateTo && event.date > filterDateTo) return false
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          if (
            !event.action.toLowerCase().includes(q) &&
            !event.description.toLowerCase().includes(q)
          ) return false
        }
        return true
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [filterType, filterDateFrom, filterDateTo, searchQuery])

  // Group events by year-month for date markers
  const groupedEvents = useMemo(() => {
    const groups: { label: string; events: typeof filteredEvents }[] = []
    let currentLabel = ''

    for (const event of filteredEvents) {
      const date = new Date(event.date)
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      if (label !== currentLabel) {
        currentLabel = label
        groups.push({ label, events: [] })
      }
      groups[groups.length - 1].events.push(event)
    }

    return groups
  }, [filteredEvents])

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    demoTimeline.forEach(e => {
      counts[e.entityType] = (counts[e.entityType] || 0) + 1
    })
    return counts
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Timeline</h1>
        <p className="text-sm text-gray-500 mt-1">Complete audit log of all equity events and corporate actions.</p>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="card py-3 px-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{demoTimeline.length}</span>
          <span className="text-xs text-gray-500">Total Events</span>
        </div>
        {allEntityTypes.map(type => {
          const config = entityConfig[type]
          const Icon = config.icon
          const count = typeCounts[type] || 0
          if (count === 0) return null
          return (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
              className={`card py-3 px-4 flex items-center gap-2 cursor-pointer transition-all ${
                filterType === type ? 'ring-2 ring-primary-500 border-primary-300' : 'hover:border-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${config.color}`} />
              <span className="text-sm font-medium text-gray-900">{count}</span>
              <span className="text-xs text-gray-500">{entityLabels[type]}</span>
            </button>
          )
        })}
      </div>

      {/* Filter Bar */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filter</span>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="select-field w-auto"
          >
            <option value="all">All Types</option>
            {allEntityTypes.map(t => (
              <option key={t} value={t}>{entityLabels[t]}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="input-field w-auto text-xs"
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
              placeholder="Search events..."
              className="input-field pl-9"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Clock}
            title="No events found"
            description="Try adjusting your filters or search query."
          />
        </div>
      ) : (
        <div className="space-y-8">
          {groupedEvents.map(group => (
            <div key={group.label}>
              {/* Date Marker */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-sm font-semibold text-gray-500 bg-gray-50 px-3 py-1 rounded-full whitespace-nowrap">
                  {group.label}
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Events */}
              <div className="relative ml-4 md:ml-8">
                {/* Vertical line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200" />

                <div className="space-y-4">
                  {group.events.map((event, idx) => {
                    const config = entityConfig[event.entityType as EntityType] || entityConfig.company
                    const Icon = config.icon

                    return (
                      <div key={event.id} className="relative flex gap-4">
                        {/* Dot / Icon on line */}
                        <div className={`relative z-10 w-8 h-8 rounded-full ${config.bgColor} border-2 ${config.borderColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>

                        {/* Event Card */}
                        <div className="flex-1 card p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-semibold text-gray-900">
                                  {event.action}
                                </h3>
                                <StatusBadge status={event.entityType} />
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            </div>
                            <time className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                              {formatDate(event.date)}
                            </time>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
