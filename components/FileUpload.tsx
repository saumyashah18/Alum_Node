'use client'

import { useState } from 'react'
import { importData } from '@/app/actions/import'

interface FileUploadProps {
  projectId: string
}

export default function FileUpload({ projectId }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setMessage('')
  }

  async function handleUpload() {
    if (!selectedFile) return

    setUploading(true)
    setMessage('📤 Uploading and parsing your file...')

    try {
      const formData = new FormData()
      formData.append('projectId', projectId)
      formData.append('file', selectedFile)
      formData.append('importMode', importMode)

      const result = await importData(formData)

      if (result.success) {
        setMessage(`✅ Successfully ${importMode === 'replace' ? 'replaced' : 'appended'} ${result.count} alumni records!`)
        setSelectedFile(null)
        // Reset file input
        const input = document.querySelector('input[type="file"]') as HTMLInputElement
        if (input) input.value = ''
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
      setUploading(false)
    } catch (error) {
      setMessage('❌ Error reading file')
      setUploading(false)
    }
  }

  return (
    <div className="file-upload">
      <div className="import-mode-selector" style={{ marginBottom: '1rem', display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="radio"
            name="importMode"
            value="replace"
            checked={importMode === 'replace'}
            onChange={() => setImportMode('replace')}
          />
          <strong>Replace Existing</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="radio"
            name="importMode"
            value="append"
            checked={importMode === 'append'}
            onChange={() => setImportMode('append')}
          />
          <strong>Append to Existing</strong>
        </label>
      </div>

      <div className="upload-container">
        <label className={`upload-label ${uploading ? 'disabled' : ''}`}>
          {selectedFile ? '📄 Change File' : '📁 Choose File'}
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>

        {selectedFile && !uploading && (
          <button
            onClick={handleUpload}
            className="btn btn-primary"
            style={{ marginLeft: '8px' }}
          >
            Upload
          </button>
        )}
      </div>

      {selectedFile && (
        <div className="file-info" style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
          <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      )}

      {message && (
        <p className={`message ${message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'info'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
