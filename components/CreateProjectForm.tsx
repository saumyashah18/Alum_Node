'use client'

import { createProject } from '@/app/actions/project'
import { useState } from 'react'

export default function CreateProjectForm() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    await createProject(formData)
    setLoading(false)
    form.reset()
  }

  return (
    <form onSubmit={handleSubmit} className="create-form card">
      <h3>Create New Project</h3>
      <div className="form-group">
        <label htmlFor="name">Project Name</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="e.g. Alumni Database 2026"
          required
          className="form-input"
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  )
}
