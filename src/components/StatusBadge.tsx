interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  fully_vested: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  exercised: 'bg-purple-100 text-purple-800',
  expired: 'bg-gray-100 text-gray-800',
  outstanding: 'bg-yellow-100 text-yellow-800',
  converted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-800',
  common: 'bg-blue-100 text-blue-800',
  preferred: 'bg-purple-100 text-purple-800',
  individual: 'bg-gray-100 text-gray-800',
  institution: 'bg-indigo-100 text-indigo-800',
  founder: 'bg-purple-100 text-purple-800',
  employee: 'bg-blue-100 text-blue-800',
  investor: 'bg-green-100 text-green-800',
  advisor: 'bg-yellow-100 text-yellow-800',
  SAFE: 'bg-teal-100 text-teal-800',
  convertible_note: 'bg-orange-100 text-orange-800',
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const color = statusColors[status] || 'bg-gray-100 text-gray-800'
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${color} ${sizeClass}`}>
      {label}
    </span>
  )
}
