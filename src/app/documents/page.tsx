'use client'

import { useState } from 'react'
import {
  FolderOpen,
  Folder,
  File,
  FileText,
  FileSpreadsheet,
  Image,
  Upload,
  FolderPlus,
  Trash2,
  MoveRight,
  ChevronRight,
  Search,
  MoreVertical,
  Check,
} from 'lucide-react'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import { formatDate } from '@/lib/utils'

type FolderName = 'Agreements' | 'Certificates' | 'Board Resolutions' | 'General'

interface Document {
  id: string
  name: string
  fileType: 'pdf' | 'docx' | 'xlsx' | 'png' | 'jpg'
  folder: FolderName
  uploadedDate: string
  relatedEntity: string
  size: string
}

const folders: { name: FolderName; count: number }[] = [
  { name: 'Agreements', count: 4 },
  { name: 'Certificates', count: 3 },
  { name: 'Board Resolutions', count: 2 },
  { name: 'General', count: 2 },
]

const mockDocuments: Document[] = [
  { id: 'doc-1', name: 'Stock Purchase Agreement - Alice Chen', fileType: 'pdf', folder: 'Agreements', uploadedDate: '2023-01-15', relatedEntity: 'Alice Chen', size: '245 KB' },
  { id: 'doc-2', name: 'Stock Purchase Agreement - Bob Martinez', fileType: 'pdf', folder: 'Agreements', uploadedDate: '2023-01-15', relatedEntity: 'Bob Martinez', size: '242 KB' },
  { id: 'doc-3', name: 'Series A SPA - Sequoia Capital', fileType: 'pdf', folder: 'Agreements', uploadedDate: '2024-03-15', relatedEntity: 'Sequoia Capital', size: '1.2 MB' },
  { id: 'doc-4', name: 'SAFE Agreement - Sequoia Capital', fileType: 'pdf', folder: 'Agreements', uploadedDate: '2023-06-01', relatedEntity: 'Sequoia Capital', size: '180 KB' },
  { id: 'doc-5', name: 'Certificate CS-001 - Alice Chen', fileType: 'pdf', folder: 'Certificates', uploadedDate: '2023-01-15', relatedEntity: 'Alice Chen', size: '95 KB' },
  { id: 'doc-6', name: 'Certificate CS-002 - Bob Martinez', fileType: 'pdf', folder: 'Certificates', uploadedDate: '2023-01-15', relatedEntity: 'Bob Martinez', size: '94 KB' },
  { id: 'doc-7', name: 'Certificate PA-001 - Sequoia Capital', fileType: 'pdf', folder: 'Certificates', uploadedDate: '2024-03-15', relatedEntity: 'Sequoia Capital', size: '98 KB' },
  { id: 'doc-8', name: 'Board Resolution - Option Pool Creation', fileType: 'docx', folder: 'Board Resolutions', uploadedDate: '2023-01-15', relatedEntity: '2023 Equity Incentive Plan', size: '56 KB' },
  { id: 'doc-9', name: 'Board Resolution - Series A Authorization', fileType: 'docx', folder: 'Board Resolutions', uploadedDate: '2024-03-10', relatedEntity: 'Series A Preferred', size: '78 KB' },
  { id: 'doc-10', name: 'Certificate of Incorporation', fileType: 'pdf', folder: 'General', uploadedDate: '2023-01-15', relatedEntity: 'TechVentures Inc.', size: '320 KB' },
  { id: 'doc-11', name: 'Bylaws', fileType: 'docx', folder: 'General', uploadedDate: '2023-01-15', relatedEntity: 'TechVentures Inc.', size: '185 KB' },
]

function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'pdf': return <FileText className="w-5 h-5 text-red-500" />
    case 'docx': return <File className="w-5 h-5 text-blue-500" />
    case 'xlsx': return <FileSpreadsheet className="w-5 h-5 text-green-500" />
    case 'png': case 'jpg': return <Image className="w-5 h-5 text-purple-500" />
    default: return <File className="w-5 h-5 text-gray-400" />
  }
}

export default function DocumentsPage() {
  const [activeFolder, setActiveFolder] = useState<FolderName>('Agreements')
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set())
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDocuments = mockDocuments
    .filter((doc) => doc.folder === activeFolder)
    .filter((doc) => searchQuery === '' || doc.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const toggleSelect = (id: string) => {
    const next = new Set(selectedDocs)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedDocs(next)
  }

  const toggleSelectAll = () => {
    if (selectedDocs.size === filteredDocuments.length) {
      setSelectedDocs(new Set())
    } else {
      setSelectedDocs(new Set(filteredDocuments.map((d) => d.id)))
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage corporate documents, agreements, certificates, and board resolutions.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFolderModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            Create Folder
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Folder Tree - Left Panel */}
        <div className="w-64 flex-shrink-0">
          <div className="card p-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">Folders</h3>
            <nav className="space-y-0.5">
              {folders.map((folder) => {
                const isActive = activeFolder === folder.name
                return (
                  <button
                    key={folder.name}
                    onClick={() => { setActiveFolder(folder.name); setSelectedDocs(new Set()) }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <FolderOpen className="w-4 h-4 text-primary-500" />
                      ) : (
                        <Folder className="w-4 h-4 text-gray-400" />
                      )}
                      {folder.name}
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                      {mockDocuments.filter((d) => d.folder === folder.name).length}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Document List - Right Panel */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FolderOpen className="w-4 h-4" />
              <span className="font-medium text-gray-900">{activeFolder}</span>
              <ChevronRight className="w-3 h-3" />
              <span>{filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input-field pl-9 text-sm w-64"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedDocs.size > 0 && (
            <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-primary-50 rounded-lg border border-primary-200">
              <span className="text-sm font-medium text-primary-700">{selectedDocs.size} selected</span>
              <div className="flex gap-2 ml-auto">
                <button className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3">
                  <MoveRight className="w-3.5 h-3.5" />
                  Move
                </button>
                <button className="btn-danger text-xs flex items-center gap-1.5 py-1.5 px-3">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Document Table */}
          {filteredDocuments.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={FolderOpen}
                title="No documents"
                description="Upload your first document to this folder."
                action={{ label: 'Upload Document', onClick: () => setShowUploadModal(true) }}
              />
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="table-header w-10">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={selectedDocs.size === filteredDocuments.length && filteredDocuments.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="table-header">Document</th>
                      <th className="table-header">Type</th>
                      <th className="table-header">Uploaded</th>
                      <th className="table-header">Related Entity</th>
                      <th className="table-header text-right">Size</th>
                      <th className="table-header w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-cell">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={selectedDocs.has(doc.id)}
                            onChange={() => toggleSelect(doc.id)}
                          />
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            {getFileIcon(doc.fileType)}
                            <span className="font-medium text-gray-900">{doc.name}</span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="text-xs font-mono uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {doc.fileType}
                          </span>
                        </td>
                        <td className="table-cell text-gray-600">{formatDate(doc.uploadedDate)}</td>
                        <td className="table-cell text-gray-600">{doc.relatedEntity}</td>
                        <td className="table-cell text-right text-gray-500">{doc.size}</td>
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
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Document" size="md">
        <form onSubmit={(e) => { e.preventDefault(); setShowUploadModal(false) }} className="space-y-5">
          <div>
            <label className="label">File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-10 text-center hover:border-primary-400 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX, PNG, JPG up to 10MB</p>
            </div>
          </div>
          <div>
            <label className="label">Folder</label>
            <select className="select-field" defaultValue={activeFolder}>
              {folders.map((f) => (
                <option key={f.name} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Related Entity</label>
            <input type="text" className="input-field" placeholder="e.g. Alice Chen, Series A" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Folder Modal */}
      <Modal open={showFolderModal} onClose={() => setShowFolderModal(false)} title="Create Folder" size="sm">
        <form onSubmit={(e) => { e.preventDefault(); setShowFolderModal(false) }} className="space-y-5">
          <div>
            <label className="label">Folder Name</label>
            <input type="text" className="input-field" placeholder="e.g. Tax Documents" required />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setShowFolderModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <FolderPlus className="w-4 h-4" />
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
