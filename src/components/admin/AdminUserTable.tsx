'use client'

import { useState } from 'react'
import { Edit2, Trash2, Shield } from 'lucide-react'

interface User {
  id: string
  email: string
  name?: string
  profile?: { planId: string }
  createdAt: string
}

interface AdminUserTableProps {
  users: User[]
  onEdit?: (user: User) => void
  onDelete?: (userId: string) => void
  onChangePlan?: (userId: string, newPlan: string) => void
}

export function AdminUserTable({
  users,
  onEdit,
  onDelete,
  onChangePlan,
}: AdminUserTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const toggleSelect = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <style>{`
        .db-block { border:1px solid var(--border); border-radius:7px; background:var(--surface); overflow:hidden; }
        .db-block-head { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid var(--border); background:var(--bg); }
        .db-block-title { font-size:12px; font-weight:600; color:var(--text); }
        .db-th { display:grid; gap:10px; padding:5px 14px; border-bottom:1px solid var(--border); background:var(--bg2); grid-template-columns:30px 1fr 1fr 1fr 100px; }
        .db-th span { font-size:10px; font-weight:600; color:var(--text4); text-transform:uppercase; }
        .db-tr { display:grid; gap:10px; padding:8px 14px; border-bottom:1px solid var(--border); cursor:pointer; grid-template-columns:30px 1fr 1fr 1fr 100px; align-items:center; }
        .db-tr:last-child { border-bottom:none; }
        .db-tr:hover { background:var(--bg2); }
        .checkbox { width:16px; height:16px; border:1px solid var(--border); border-radius:3px; cursor:pointer; }
        .action-btn { padding:4px 8px; border-radius:4px; border:1px solid var(--border); background:var(--bg2); cursor:pointer; font-size:11px; margin-right:4px; }
        .action-btn:hover { background:var(--bg3); }
      `}
