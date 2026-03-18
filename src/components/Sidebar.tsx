'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileSpreadsheet, Shield, Users, Calendar,
  ArrowRightLeft, Clock, Calculator, BarChart3, FileText,
  FolderOpen, Settings, Award, Scale, DollarSign,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  PieChart, Briefcase, TrendingUp
} from 'lucide-react'

const navSections = [
  {
    title: 'Overview',
    items: [
      { name: 'Cap Table', href: '/', icon: PieChart },
    ],
  },
  {
    title: 'Securities',
    items: [
      { name: 'Equity', href: '/securities/equity', icon: FileSpreadsheet },
      { name: 'Options', href: '/securities/options', icon: Briefcase },
      { name: 'Warrants', href: '/securities/warrants', icon: Shield },
      { name: 'Convertibles', href: '/securities/convertibles', icon: ArrowRightLeft },
    ],
  },
  {
    title: 'Management',
    items: [
      { name: 'Shareholders', href: '/shareholders', icon: Users },
      { name: 'Vesting', href: '/vesting', icon: Calendar },
      { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
      { name: 'Timeline', href: '/timeline', icon: Clock },
    ],
  },
  {
    title: 'Analysis',
    items: [
      { name: 'Round Modeling', href: '/modeling/round', icon: Calculator },
      { name: 'Waterfall', href: '/modeling/waterfall', icon: TrendingUp },
      { name: 'Reports', href: '/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'Administration',
    items: [
      { name: 'Documents', href: '/documents', icon: FolderOpen },
      { name: 'Admin Records', href: '/admin-records', icon: Award },
      { name: 'Compliance', href: '/compliance', icon: Scale },
      { name: 'Valuation', href: '/valuation', icon: DollarSign },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    Object.fromEntries(navSections.map(s => [s.title, true]))
  )

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-200 min-h-screen`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">CapTable</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navSections.map((section) => (
          <div key={section.title} className="mb-2">
            {!collapsed && (
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
              >
                {section.title}
                {expandedSections[section.title] ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
            {(collapsed || expandedSections[section.title]) && (
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href))
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        title={collapsed ? item.name : undefined}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary-600' : ''}`} />
                        {!collapsed && item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">Cap Table Management v1.0</p>
        </div>
      )}
    </aside>
  )
}
