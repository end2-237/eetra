"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { useDocument } from "@/contexts/DocumentContext";
import { useProfile } from "@/contexts/ProfileContext";
import { EditableCoverPage } from "./document/EditableCoverPage";
import { ContentPage } from "./document/ContentPage";
import { EditorPanel } from "./panels/EditorPanel";
import { TabName } from "@/types";

const TABS = [
  { id: "view", Icon: FileText, label: "Doc" },
  { id: "editor", Icon: Layers, label: "Blocs" },
  { id: "templates", Icon: LayoutGrid, label: "Templates" },
  { id: "analytics", Icon: BarChart2, label: "Stats" },
  { id: "comments", Icon: MessageSquare, label: "Notes" },
];

interface Props {
  onExport: () => void;
}

const PAGE_W = 794;
const PAGE_H = 1123;

export function MobileEditor({ onExport }: Props) {
  const router = useRouter();
  const {
    pages,
    addPage,
    currentPageIndex,
    setCurrentPageIndex,
    title,
    coverStyle,
    activeTab: contextActiveTab,
    setActiveTab: setContextActiveTab,
  } = useDocument();
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState<
    "view" | "editor" | "templates" | "analytics" | "comments"
  >("view");

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 390
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab !== "view") {
      const contextTabMap: Record<string, string> = {
        editor: "editor",
        templates: "templates",
        analytics: "analytics",
        comments: "comments",
      };
      setContextActiveTab(contextTabMap[tab] as TabName);
    }
  };

  // Scale factor so pages fill the screen width exactly
  const scale = windowWidth / PAGE_W;
  // Scaled dimensions for the wrapper container
  const scaledW = windowWidth; // = PAGE_W * scale
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
      {/* ── Top bar ── */}
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
        }}
      >
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text4)",
            padding: 0,
            fontSize: 13,
          }}
        >
          ← Dashboard
        </button>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text)",
            maxWidth: 160,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
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
          }}
        >
          <Download size={13} /> PDF
        </button>
      </div>

      {/* ── Content area ── */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Document view (always rendered, hidden behind panel) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflowY: "auto",
            overflowX: "hidden",
            background: "var(--bg3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingBottom: 100,
            gap: 12,
            opacity: showPanel ? 0 : 1,
            pointerEvents: showPanel ? "none" : "auto",
            transition: "opacity .2s",
          }}
        >
          {/* Cover page — exact scaled wrapper */}
          <div
            style={{
              width: scaledW,
              height: scaledH,
              flexShrink: 0,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Inner div at full A4 size, scaled down */}
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
              <EditableCoverPage zoom={1} />
            </div>
          </div>

          {/* Content pages */}
          {pages.map((page, idx) => (
            <div
              key={page.id}
              onClick={() => setCurrentPageIndex(idx)}
              style={{
                width: scaledW,
                height: scaledH,
                flexShrink: 0,
                overflow: "hidden",
                position: "relative",
                boxShadow:
                  idx === currentPageIndex
                    ? `0 0 0 2px ${profile.color || "#1B4FD8"}`
                    : "0 2px 12px rgba(0,0,0,.10)",
                cursor: "pointer",
              }}
            >
              {/* Inner div at full A4 size, scaled down */}
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

          {/* ── Add page button ── */}
          <button
            onClick={addPage}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              borderRadius: 12,
              border: "2px dashed var(--border2)",
              background: "transparent",
              cursor: "pointer",
              color: "var(--text4)",
              fontSize: 12,
              fontWeight: 700,
              transition: "all .15s",
              marginTop: 4,
            }}
          >
            <Plus size={14} /> Ajouter une page
          </button>
        </div>

        {/* Slide-up panel */}
        {showPanel && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--bg)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "slideUpPanel .25s cubic-bezier(.23,1,.32,1)",
            }}
          >
            {/* Panel header */}
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
              <span
                style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}
              >
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

      {/* ── Bottom tab bar ── */}
      <div
        style={{
          height: 56,
          flexShrink: 0,
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 4px",
          paddingBottom: "env(safe-area-inset-bottom, 0)",
        }}
      >
        {TABS.map(({ id, Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => handleTabChange(id as typeof activeTab)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "6px 4px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: isActive ? "var(--accent)" : "var(--text4)",
              }}
            >
              <Icon size={20} />
              <span
                style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".06em" }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes slideUpPanel {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}