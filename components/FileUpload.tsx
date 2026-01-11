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

      const result = await importData(formData)

      if (result.success) {
        setMessage(`✅ Successfully imported ${result.count} alumni records!`)
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
      <p className="upload-description">
        Upload an Excel (.xlsx) or CSV file (up to 500MB).
        <br />
        <small>The file will replace all existing records in this project.</small>
      </p>

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
