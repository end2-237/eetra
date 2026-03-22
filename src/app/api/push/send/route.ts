import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ ok: true, sent: 0, failed: 0 })
}