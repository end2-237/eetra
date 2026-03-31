'use client'

interface Payment {
  id: string
  userId: string
  planId: string
  amount: number
  status: string
  createdAt: string
  user?: { email: string; name?: string }
}

interface AdminPaymentTableProps {
  payments: Payment[]
}

export function AdminPaymentTable({ payments }: AdminPaymentTableProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'var(--success)'
      case 'pending':
        return 'var(--warn)'
      case 'failed':
        return 'var(--danger)'
      default:
        return 'var(--text3)'
    }
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <style>{`
        .db-block { border:1px solid var(--border); border-radius:7px; background:var(--surface); overflow:hidden; }
        .db-block-head { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid var(--border); background:var(--bg); }
        .db-block-title { font-size:12px; font-weight:600; color:var(--text); }
        .db-th { display:grid; gap:10px; padding:5px 14px; border-bottom:1px solid var(--border); background:var(--bg2); grid-template-columns:1fr 1fr 1fr 1fr 100px; }
        .db-th span { font-size:10px; font-weight:600; color:var(--text4); text-transform:uppercase; }
        .db-tr { display:grid; gap:10px; padding:8px 14px; border-bottom:1px solid var(--border); grid-template-columns:1fr 1fr 1fr 1fr 100px; align-items:center; }
        .db-tr:last-child { border-bottom:none; }
        .db-tr:hover { background:var(--bg2); }
        .status-badge { padding:3px 8px; border-radius:4px; font-size:10px; font-weight:600; text-transform:uppercase; }
      `}
