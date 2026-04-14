"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"

const OFFLINE_TOAST_ID = "network-offline-status"

export function NetworkStatusNotifier() {
  const wasOfflineRef = useRef(false)

  useEffect(() => {
    const showOffline = () => {
      wasOfflineRef.current = true
      toast.error("Vous etes hors ligne", {
        id: OFFLINE_TOAST_ID,
        description: "Certaines actions peuvent etre indisponibles jusqu'au retour de la connexion.",
        duration: Infinity,
      })
    }

    const showOnline = () => {
      toast.dismiss(OFFLINE_TOAST_ID)

      if (wasOfflineRef.current) {
        toast.success("Connexion retablie", {
          description: "Vous etes a nouveau en ligne.",
          duration: 3500,
        })
      }

      wasOfflineRef.current = false
    }

    // Initial state on first load.
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      showOffline()
    }

    window.addEventListener("offline", showOffline)
    window.addEventListener("online", showOnline)

    return () => {
      window.removeEventListener("offline", showOffline)
      window.removeEventListener("online", showOnline)
      toast.dismiss(OFFLINE_TOAST_ID)
    }
  }, [])

  return null
}

