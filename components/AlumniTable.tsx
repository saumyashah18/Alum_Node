'use client'

import { useState, useEffect } from 'react'
import { updateAlumnus, deleteAlumnus } from '@/app/actions/alumni'

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

    // Sync alumni state when prop changes (for filtering)
    useEffect(() => {
        setAlumni(initialAlumni)
    }, [initialAlumni])

    // Determine columns dynamically from ALL data (not just filtered)
    // This ensures all columns are visible even when filtering
    // Show ALL columns from the imported Excel data
    const allKeys = Array.from(new Set(initialAlumni.flatMap((a: Alumnus) => {
        if (a.data && typeof a.data === 'object') {
            return Object.keys(a.data)
        }
        return []
    })))
    const columns = allKeys // Show all Excel columns without filtering


    function handleEdit(alumnus: Alumnus) {
        setEditingId(alumnus.id)
        setEditData({ ...alumnus.data })
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
        <div className="table-wrapper">
            <table className="alumni-table">
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</th>
                        ))}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
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
                                        <span>{(() => {
                                            const value = person.data?.[col]
                                            if (value === null || value === undefined) return '-'
                                            if (typeof value === 'object') return JSON.stringify(value)
                                            return String(value)
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
    )
}
