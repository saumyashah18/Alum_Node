'use client'

import { useState, useEffect } from 'react'
import { updateAlumnus, deleteAlumnus, createAlumnus, addAttributeToProject } from '@/app/actions/alumni'

interface AlumnusData {
    [key: string]: string | number | null | undefined
}

interface Alumnus {
    id: string
    projectId: string
    data: AlumnusData
    createdAt: Date
    updatedAt: Date
}

interface AlumniTableProps {
    alumni: Alumnus[]
    projectId: string
}

export default function AlumniTable({ alumni: initialAlumni, projectId }: AlumniTableProps) {
    const [alumni, setAlumni] = useState<Alumnus[]>(initialAlumni)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editData, setEditData] = useState<AlumnusData>({})
    const [isAdding, setIsAdding] = useState(false)
    const [newData, setNewData] = useState<AlumnusData>({})

    // Sync alumni state when prop changes (for filtering)
    useEffect(() => {
        setAlumni(initialAlumni)
    }, [initialAlumni])

    // Determine columns dynamically from ALL data
    const allKeys = Array.from(new Set(initialAlumni.flatMap((a: Alumnus) => {
        if (a.data && typeof a.data === 'object') {
            return Object.keys(a.data).map(k => k.trim().toLowerCase())
        }
        return []
    })))
    const columns = allKeys

    const getCellValue = (person: Alumnus, col: string) => {
        if (!person.data) return '-'
        const actualKey = Object.keys(person.data).find(k => k.trim().toLowerCase() === col)
        if (!actualKey) return '-'
        const value = person.data[actualKey]
        if (value === null || value === undefined) return '-'
        if (typeof value === 'object') return JSON.stringify(value)
        return String(value).trim()
    }


    function handleEdit(alumnus: Alumnus) {
        setEditingId(alumnus.id)
        const normalized: AlumnusData = {}
        if (alumnus.data && typeof alumnus.data === 'object') {
            Object.keys(alumnus.data).forEach(k => {
                normalized[k.trim().toLowerCase()] = (alumnus.data as any)[k]
            })
        }
        setEditData(normalized)
    }

    async function handleSave(id: string) {
        const result = await updateAlumnus(id, projectId, editData)
        if (result.success) {
            setAlumni(prev => prev.map(a => a.id === id ? { ...a, ...editData, data: { ...a.data, ...editData } } : a))
            setEditingId(null)
        } else {
            alert(result.error)
        }
    }

    async function handleAddAlumnus() {
        const result = await createAlumnus(projectId, newData)
        if (result.success) {
            setIsAdding(false)
            setNewData({})
            // Location could re-fetch or we could optimistically update
            // For now, revalidate handles it but we might need a refresh
            window.location.reload()
        } else {
            alert(result.error)
        }
    }

    async function handleAddAttribute() {
        const attrName = prompt("Enter new attribute name:")
        if (!attrName) return

        const result = await addAttributeToProject(projectId, attrName)
        if (result.success) {
            window.location.reload()
        } else {
            alert(result.error)
        }
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Are you sure you want to delete this record${name ? ` for ${name}` : ''}?`)) {
            return
        }

        const result = await deleteAlumnus(id, projectId)
        if (result.success) {
            setAlumni(prev => prev.filter(a => a.id !== id))
        } else {
            alert(result.error)
        }
    }


    return (
        <div className="table-container-outer">
            <div className="table-controls" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                <button onClick={() => setIsAdding(!isAdding)} className="btn btn-primary btn-sm">
                    {isAdding ? 'Cancel Adding' : '+ Add Alumnus'}
                </button>
                <button onClick={handleAddAttribute} className="btn btn-outline btn-sm">
                    + Add Attribute (Column)
                </button>
            </div>

            <div className="table-wrapper">
                <table className="alumni-table">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col}>
                                    {col.split(/[_\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </th>
                            ))}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isAdding && (
                            <tr className="adding-row" style={{ backgroundColor: 'var(--input)' }}>
                                {columns.map(col => (
                                    <td key={col}>
                                        <input
                                            type="text"
                                            value={newData[col] || ''}
                                            onChange={(e) => setNewData({ ...newData, [col]: e.target.value })}
                                            placeholder={`Enter ${col}`}
                                            className="edit-input"
                                        />
                                    </td>
                                ))}
                                <td>
                                    <button onClick={handleAddAlumnus} className="btn btn-primary btn-sm">Add</button>
                                </td>
                            </tr>
                        )}
                        {alumni.map(person => (
                            <tr key={person.id}>
                                {columns.map(col => (
                                    <td key={col}>
                                        {editingId === person.id ? (
                                            <input
                                                type="text"
                                                value={editData[col] || ''}
                                                onChange={(e) => setEditData({ ...editData, [col]: e.target.value })}
                                                className="edit-input"
                                            />
                                        ) : (
                                            <span className="cell-content">{(() => {
                                                const strValue = getCellValue(person, col)
                                                if (strValue === '-') return '-'

                                                // Email pattern
                                                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                                                if (emailRegex.test(strValue)) {
                                                    return (
                                                        <a href={`mailto:${strValue}`} className="table-link">
                                                            {strValue}
                                                        </a>
                                                    )
                                                }

                                                // URL pattern (starts with http://, https://, or www.)
                                                const urlRegex = /^(https?:\/\/|www\.)[^\s/$.?#].[^\s]*$/i
                                                if (urlRegex.test(strValue)) {
                                                    const href = strValue.startsWith('www.') ? `https://${strValue}` : strValue
                                                    return (
                                                        <a href={href} target="_blank" rel="noopener noreferrer" className="table-link">
                                                            {strValue}
                                                        </a>
                                                    )
                                                }

                                                return strValue
                                            })()}</span>
                                        )}
                                    </td>
                                ))}
                                <td>
                                    {editingId === person.id ? (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleSave(person.id)} className="btn btn-primary btn-sm">Save</button>
                                            <button onClick={() => setEditingId(null)} className="btn btn-outline btn-sm">Cancel</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleEdit(person)} className="btn btn-outline btn-sm">Edit</button>
                                            <button
                                                onClick={() => handleDelete(person.id, String(person.data?.name || person.data?.Name || ''))}
                                                className="btn btn-danger btn-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    )
}
