'use client'
import { useEffect, useRef } from 'react'
export function useAutoSave(modified: boolean, onSave: () => void, intervalMs = 5000) {
  const modifiedRef = useRef(modified)
  modifiedRef.current = modified
  useEffect(() => {
    const timer = setInterval(() => { if (modifiedRef.current) onSave() }, intervalMs)
    return () => clearInterval(timer)
  }, [onSave, intervalMs])
}
