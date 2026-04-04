"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  LayoutGrid,
  BarChart2,
  MessageSquare,
  FileText,
  Download,
  X,
  Plus,
  Layout,
  BookMarked,
  ChevronLeft,
} from "lucide-react";
import { useDocument } from "@/contexts/DocumentContext";
import { useProfile } from "@/contexts/ProfileContext";
import { EditableCoverPageMobile } from "./document/EditableCoverPageMobile";
import { ContentPage } from "./document/ContentPage";
import { EditorPanel } from "./panels/EditorPanel";
import { TabName } from "@/types";

// All tabs — rendered in a horizontally-scrollable pill bar
const TABS = [
  { id: "view",        Icon: FileText,      label: "Doc"          },
  { id: "editor",      Icon: Layers,        label: "Blocs"        },
  { id: "templates",   Icon: LayoutGrid,    label: "Templates"    },
  { id: "layout",      Icon: Layout,        label: "Mise en page" },
  { id: "analytics",   Icon: BarChart2,     label: "Stats"        },
  { id: "comments",    Icon: MessageSquare, label: "Notes"        },
  { id: "orientation", Icon: BookMarked,    label: "TdM"          },
];

interface Props {
  onExport: () => void;
}

const PAGE_W = 794;
const PAGE_H = 1173;

export function MobileEditor({ onExport }: Props) {
  const router = useRouter();
  const {
    pages,
    addPage,
    currentPageIndex,
    setCurrentPageIndex,
    title,
    setActiveTab: setContextActiveTab,
  } = useDocument();
  const { profile } = useProfile();

  const [activeTab, setActiveTab] = useState<string>("view");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 390
  );
  const tabBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== "view") {
      setContextActiveTab(tab as TabName);
    }
  };

  // Scroll the active tab pill into view
  useEffect(() => {
    if (!tabBarRef.current) return;
    const btn = tabBarRef.current.querySelector(
      `[data-tab="${activeTab}"]`
    ) as HTMLElement | null;
    if (btn) {
      btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTab]);

  // Visual scale so each page fills the full screen width
  const scale = windowWidth / PAGE_W;
  // Exact height of a scaled A4 page
  const scaledH = Math.round(PAGE_H * scale);

  const showPanel = activeTab !== "view";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      {/* ─── Top bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          height: 48,
          flexShrink: 0,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          gap: 8,
        }}
      >
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text4)",
            padding: 4,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text)",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          {title || "Document"}
        </span>

        <button
          onClick={onExport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "6px 12px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          <Download size={13} />
          PDF
        </button>
      </div>

      {/* ─── Main content ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>

        {/* Document scroll view */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflowY: "auto",
            overflowX: "auto",
            background: "var(--bg3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingBottom: 32,
            gap: 12,
            opacity: showPanel ? 0 : 1,
            pointerEvents: showPanel ? "none" : "auto",
            transition: "opacity .15s",
          }}
        >
          {/* Cover page via dedicated mobile wrapper */}
          <EditableCoverPageMobile scale={scale} windowWidth={windowWidth} />

          {/* Content pages */}
          {pages.map((page, idx) => (
            <div
              key={page.id}
              onClick={() => setCurrentPageIndex(idx)}
              style={{
                // Outer container: exact scaled dimensions, clips overflow
                width: windowWidth,
                height: scaledH,
                flexShrink: 0,
                overflow: "hidden",
                position: "relative",
                boxShadow:
                  idx === currentPageIndex
                    ? `0 0 0 2px ${profile.color || "#1B4FD8"}, 0 4px 16px rgba(0,0,0,.14)`
                    : "0 2px 12px rgba(0,0,0,.08)",
                cursor: "pointer",
                transition: "box-shadow .15s",
              }}
            >
              {/* Inner A4 div at full resolution, scaled down */}
              <div
                style={{
                  width: PAGE_W,
                  height: PAGE_H,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              >
                <ContentPage
                  page={page}
                  pageIndex={idx}
                  totalPages={pages.length}
                />
              </div>
            </div>
          ))}

          {/* Add page CTA */}
          <button
            onClick={addPage}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 28px",
              borderRadius: 12,
              border: "2px dashed var(--border2)",
              background: "transparent",
              cursor: "pointer",
              color: "var(--text4)",
              fontSize: 12,
              fontWeight: 700,
              marginTop: 4,
            }}
          >
            <Plus size={14} /> Ajouter une page
          </button>
        </div>

        {/* Editor panel (blocs / templates / layout / etc.) */}
        {showPanel && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--bg)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "slideUpPanel .2s cubic-bezier(.23,1,.32,1)",
            }}
          >
            <div
              style={{
                height: 44,
                flexShrink: 0,
                borderBottom: "1px solid var(--border)",
                background: "var(--surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 14px",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>
                {TABS.find((t) => t.id === activeTab)?.label}
              </span>
              <button
                onClick={() => handleTabChange("view")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text4)",
                  display: "flex",
                  padding: 4,
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              <EditorPanel />
            </div>
          </div>
        )}
      </div>

      {/* ─── Bottom tab bar — horizontally scrollable ────────────────────── */}
      <div
        style={{
          flexShrink: 0,
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          paddingBottom: "env(safe-area-inset-bottom, 0)",
        }}
      >
        <div
          ref={tabBarRef}
          style={{
            display: "flex",
            overflowX: "auto",
            overflowY: "auto",
            // Hide scrollbar cross-browser
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            padding: "5px 6px",
            gap: 4,
            height: 58,
            alignItems: "center",
          } as React.CSSProperties}
        >
          {TABS.map(({ id, Icon, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                data-tab={id}
                onClick={() => handleTabChange(id)}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  padding: "4px 10px",
                  height: 46,
                  background: isActive ? "var(--accentS)" : "transparent",
                  border: isActive
                    ? "1px solid rgba(27,79,216,.25)"
                    : "1px solid transparent",
                  borderRadius: 10,
                  cursor: "pointer",
                  color: isActive ? "var(--accent)" : "var(--text4)",
                  minWidth: 52,
                  transition: "all .12s",
                }}
              >
                <Icon size={17} />
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: ".03em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes slideUpPanel {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Hide scrollbar in webkit (iOS Safari, Chrome mobile) */
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}