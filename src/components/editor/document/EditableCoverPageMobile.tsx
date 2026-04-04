"use client";

/**
 * EditableCoverPageMobile
 *
 * Wraps EditableCoverPage for mobile use inside MobileEditor.
 * 
 * Problems solved vs the raw EditableCoverPage at zoom<1:
 * 1. The outer container height is now exactly scaledH (PAGE_H * scale) so
 *    pages don't overlap or leave gaps in the scroll view.
 * 2. The inner div renders at full A4 size (PAGE_W x PAGE_H) and is scaled
 *    down with transform:scale(scale) + transformOrigin:top left, which
 *    guarantees pixel-perfect export at zoom=1.
 * 3. A floating "⚙ Propriétés" button opens the cover editor panel as a
 *    full-screen bottom-sheet so properties are actually usable on mobile.
 * 4. The original EditableCoverPage is rendered at zoom=1 inside the scaled
 *    container so its internal coordinate system is always correct.
 */

import { useState } from "react";
import { Settings, X } from "lucide-react";
import { EditableCoverPage } from "./EditableCoverPage";

const PAGE_W = 794;
const PAGE_H = 1173;

interface Props {
  /** Visual scale factor = windowWidth / PAGE_W */
  scale: number;
  windowWidth: number;
}

export function EditableCoverPageMobile({ scale, windowWidth }: Props) {
  const [showSheet, setShowSheet] = useState(false);

  const scaledH = Math.round(PAGE_H * scale);

  return (
    <>
      {/* ── Scaled page container ── */}
      <div
        style={{
          width: windowWidth,
          height: scaledH,
          flexShrink: 0,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 2px 16px rgba(0,0,0,.14)",
        }}
      >
        {/* Inner A4 canvas at full resolution, scaled visually */}
        <div
          style={{
            width: PAGE_W,
            height: PAGE_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
            // Disable pointer events on the scaled canvas so taps don't
            // land on wrong coordinates. User edits via the bottom sheet.
            pointerEvents: "none",
          }}
        >
          <EditableCoverPage zoom={1} />
        </div>

        {/* Floating button to open editor sheet */}
        <button
          onClick={() => setShowSheet(true)}
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 99,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            boxShadow: "0 4px 16px rgba(0,0,0,.25)",
          }}
        >
          <Settings size={13} />
          Modifier la couverture
        </button>
      </div>

      {/* ── Bottom sheet: full cover editor ── */}
      {showSheet && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9000,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setShowSheet(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,.5)",
            }}
          />

          {/* Sheet panel */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "90dvh",
              background: "var(--surface)",
              borderRadius: "16px 16px 0 0",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "sheetUp .25s cubic-bezier(.23,1,.32,1)",
            }}
          >
            {/* Sheet header */}
            <div
              style={{
                height: 52,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>
                Éditeur de couverture
              </span>
              <button
                onClick={() => setShowSheet(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--bg2)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text3)",
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Sheet content: the full EditableCoverPage editor */}
            {/* We render it at zoom=0.45 so the A4 preview fits in the sheet */}
            <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
              <EditableCoverPage zoom={0.45} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}