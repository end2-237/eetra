"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Layers, LayoutGrid, BarChart2, MessageSquare, FileText,
  Download, X, Plus, Layout, BookMarked, ChevronLeft,
  ZoomIn, ZoomOut, CircleHelp, Radar, ChevronRight, BookOpen,
} from "lucide-react";
import { useDocument } from "@/contexts/DocumentContext";
import { useProfile } from "@/contexts/ProfileContext";
import { EditableCoverPageMobile } from "./document/EditableCoverPageMobile";
import { ContentPage } from "./document/ContentPage";
import { EditorPanel } from "./panels/EditorPanel";
import { TabName } from "@/types";
import {
  OrientationZonePage,
  extractTOCEntries,
  extractTableList,
  extractIllustrationList,
  computeOZPageCount,
} from "@/components/editor/document/OrientationZonePage";

const TABS = [
  { id: "view",        Icon: FileText,      label: "Doc"      },
  { id: "editor",      Icon: Layers,        label: "Blocs"    },
  { id: "templates",   Icon: LayoutGrid,    label: "Modèles"  },
  { id: "layout",      Icon: Layout,        label: "Mise en page" },
  { id: "analytics",   Icon: BarChart2,     label: "Stats"    },
  { id: "radar",       Icon: Radar,         label: "Radar"    },
  { id: "comments",    Icon: MessageSquare, label: "Notes"    },
  { id: "orientation", Icon: BookMarked,    label: "TdM"      },
];

interface Props {
  onExport: () => void;
}

const PAGE_W = 794;
const PAGE_H = 1123;
const MIN_SCALE = 0.3;
const MAX_SCALE = 1.5;

export function MobileEditor({ onExport }: Props) {
  const router = useRouter();
  const {
    pages,
    addPage,
    currentPageIndex,
    setCurrentPageIndex,
    title,
    setActiveTab: setContextActiveTab,
    orientationZone,
  } = useDocument();
  const { profile } = useProfile();

  const [activeTab, setActiveTab] = useState<string>("view");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 390
  );
  const [userScale, setUserScale] = useState<number | null>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fitScale = Math.round((windowWidth / PAGE_W) * 100) / 100;
  const scale = userScale ?? fitScale;
  const scaledH = Math.round(PAGE_H * scale);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== "view") {
      setContextActiveTab(tab as TabName);
    }
  };

  const zoomIn  = useCallback(() => setUserScale(s => Math.min(MAX_SCALE, Math.round(((s ?? fitScale) + 0.1) * 10) / 10)), [fitScale]);
  const zoomOut = useCallback(() => setUserScale(s => Math.max(MIN_SCALE, Math.round(((s ?? fitScale) - 0.1) * 10) / 10)), [fitScale]);
  const zoomFit = useCallback(() => setUserScale(null), []);

  const updateScrollIndicators = useCallback(() => {
    const el = tabBarRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = tabBarRef.current;
    if (!el) return;
    updateScrollIndicators();
    el.addEventListener("scroll", updateScrollIndicators, { passive: true });
    const ro = new ResizeObserver(updateScrollIndicators);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollIndicators);
      ro.disconnect();
    };
  }, [updateScrollIndicators]);

  useEffect(() => {
    if (!tabBarRef.current) return;
    const btn = tabBarRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement | null;
    if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    setTimeout(updateScrollIndicators, 300);
  }, [activeTab, updateScrollIndicators]);

  const scrollTabBar = (dir: 'left' | 'right') => {
    const el = tabBarRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'right' ? 80 : -80, behavior: 'smooth' });
  };

  const showPanel = activeTab !== "view";

  const openGuide = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("eetra-open-guide"));
    }
  };

  // ── OZ Data ────────────────────────────────────────────────────────────────
  const ozPageCount = useMemo(() => computeOZPageCount(orientationZone, pages), [orientationZone, pages]);
  const ozAfterCover = orientationZone?.enabled && orientationZone.position === 'after-cover';
  const contentPageOffset = ozAfterCover ? 1 + ozPageCount + 1 : 2;
  const totalAbsolutePages = 1 + pages.length + (orientationZone?.enabled ? ozPageCount : 0);

  const { tocEntries, tableList, illustrationList } = useMemo(() => {
    if (!orientationZone?.enabled) return { tocEntries: [], tableList: [], illustrationList: [] };
    const offset = ozAfterCover ? contentPageOffset : 2;
    return {
      tocEntries: extractTOCEntries(pages, orientationZone.tocLevels || [1,2,3], orientationZone.numberStyle || 'numeric', offset),
      tableList: extractTableList(pages, offset),
      illustrationList: extractIllustrationList(pages, offset),
    };
  }, [pages, orientationZone, ozAfterCover, contentPageOffset]);

  const ozAbsoluteStart = useMemo(() => {
    if (ozAfterCover) return 2;
    if (orientationZone?.enabled && orientationZone.position === 'end') return 1 + pages.length + 1;
    return 2;
  }, [ozAfterCover, orientationZone, pages.length]);

  const renderOZPages = () => {
    if (!orientationZone?.enabled) return null;
    return Array.from({ length: ozPageCount }, (_, i) => (
      <div key={`oz-mobile-${i}`} style={{
        width: Math.max(windowWidth, PAGE_W * scale),
        height: scaledH,
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 0 0 2px rgba(124,58,237,.4), 0 4px 16px rgba(0,0,0,.1)',
        margin: '0 auto',
      }}>
        {/* OZ label */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 3 * scale, background: 'linear-gradient(90deg,#7C3AED,#a855f7)',
          zIndex: 10, pointerEvents: 'none',
        }} />
        <div style={{
          width: PAGE_W, height: PAGE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute', top: 0, left: 0,
        }}>
          <OrientationZonePage
            config={orientationZone}
            pageIndex={i}
            absolutePageNum={ozAbsoluteStart + i}
            totalAbsolutePages={totalAbsolutePages}
            tocEntries={tocEntries}
            tableList={tableList}
            illustrationList={illustrationList}
          />
        </div>
        {i === 0 && (
          <div style={{
            position: 'absolute', bottom: 6 * scale, right: 6 * scale,
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 6,
            background: 'rgba(124,58,237,.15)', border: '1px solid rgba(124,58,237,.3)',
            zIndex: 10, pointerEvents: 'none',
          }}>
            <BookOpen size={8} color="#7C3AED" />
            <span style={{ fontSize: 8, fontWeight: 700, color: '#7C3AED' }}>Zone d'Orientation</span>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "var(--bg)", overflow: "hidden" }}>

      {/* ─── Top bar ─────────────────────────────────────────────────────── */}
      <div data-tour="mobile-toolbar" style={{
        height: 48, flexShrink: 0,
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 8px", gap: 4,
      }}>
        <button onClick={() => router.push("/dashboard")}
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text4)", padding: 6, display: "flex", alignItems: "center", flexShrink: 0 }}>
          <ChevronLeft size={18} />
        </button>

        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
          {title || "Document"}
        </span>

        {/* Zoom controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
          <button onClick={zoomOut} disabled={scale <= MIN_SCALE}
            style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg2)", cursor: scale <= MIN_SCALE ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text4)", opacity: scale <= MIN_SCALE ? 0.4 : 1 }}>
            <ZoomOut size={11} />
          </button>
          <button onClick={zoomFit}
            style={{ height: 26, padding: "0 5px", borderRadius: 6, border: "1px solid var(--border)", background: userScale ? "var(--accentS)" : "var(--bg2)", cursor: "pointer", fontSize: 9, fontWeight: 800, color: userScale ? "var(--accent)" : "var(--text4)", fontFamily: "monospace", minWidth: 38, textAlign: "center" }}>
            {Math.round(scale * 100)}%
          </button>
          <button onClick={zoomIn} disabled={scale >= MAX_SCALE}
            style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg2)", cursor: scale >= MAX_SCALE ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text4)", opacity: scale >= MAX_SCALE ? 0.4 : 1 }}>
            <ZoomIn size={11} />
          </button>
        </div>

        <button onClick={openGuide}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, background: "var(--bg2)", color: "var(--text4)", border: "1px solid var(--border)", borderRadius: 7, cursor: "pointer", flexShrink: 0 }}>
          <CircleHelp size={13} />
        </button>

        <button data-tour="mobile-export-btn" onClick={onExport}
          style={{ display: "flex", alignItems: "center", gap: 3, padding: "5px 10px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
          <Download size={12} /> PDF
        </button>
      </div>

      {/* ─── Main content ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>

        {/* Document scroll view */}
        <div data-tour="mobile-canvas" style={{
          position: "absolute", inset: 0,
          overflowY: "auto", overflowX: "auto",
          background: "var(--bg3)",
          display: "flex", flexDirection: "column", alignItems: "center",
          paddingBottom: 32, gap: 12,
          opacity: showPanel ? 0 : 1,
          pointerEvents: showPanel ? "none" : "auto",
          transition: "opacity .15s",
        }}>
          <EditableCoverPageMobile scale={scale} windowWidth={windowWidth} />

          {/* OZ after cover */}
          {ozAfterCover && renderOZPages()}

          {pages.map((page, idx) => (
            <div key={page.id} onClick={() => setCurrentPageIndex(idx)} style={{
              width: Math.max(windowWidth, PAGE_W * scale),
              height: scaledH,
              flexShrink: 0,
              overflow: "hidden",
              position: "relative",
              boxShadow: idx === currentPageIndex
                ? `0 0 0 2px ${profile.color || "#1B4FD8"}, 0 4px 16px rgba(0,0,0,.14)`
                : "0 2px 12px rgba(0,0,0,.08)",
              cursor: "pointer",
              transition: "box-shadow .15s",
              margin: "0 auto",
            }}>
              <div style={{
                width: PAGE_W, height: PAGE_H,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                position: "absolute", top: 0, left: 0,
              }}>
                <ContentPage page={page} pageIndex={idx} totalPages={pages.length} />
              </div>
            </div>
          ))}

          {/* OZ at end */}
          {orientationZone?.enabled && orientationZone.position === 'end' && renderOZPages()}

          <button data-tour="mobile-pages-panel" onClick={addPage} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 28px",
            borderRadius: 12, border: "2px dashed var(--border2)",
            background: "transparent", cursor: "pointer", color: "var(--text4)",
            fontSize: 12, fontWeight: 700, marginTop: 4,
          }}>
            <Plus size={14} /> Ajouter une page
          </button>
        </div>

        {/* Editor panel */}
        {showPanel && (
          <div style={{
            position: "absolute", inset: 0, background: "var(--bg)",
            display: "flex", flexDirection: "column", overflow: "hidden",
            animation: "slideUpPanel .2s cubic-bezier(.23,1,.32,1)",
          }}>
            <div style={{
              height: 44, flexShrink: 0,
              borderBottom: "1px solid var(--border)", background: "var(--surface)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 14px",
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>
                {TABS.find((t) => t.id === activeTab)?.label}
              </span>
              <button onClick={() => handleTabChange("view")}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text4)", display: "flex", padding: 4 }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              <EditorPanel />
            </div>
          </div>
        )}
      </div>

      {/* ─── Bottom tab bar ──────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, background: "var(--surface)", borderTop: "1px solid var(--border)", paddingBottom: "env(safe-area-inset-bottom, 0)" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          {canScrollLeft && (
            <button onClick={() => scrollTabBar('left')} style={{
              position: "absolute", left: 0, zIndex: 10,
              width: 24, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(to right, var(--surface) 70%, transparent)",
              border: "none", cursor: "pointer", color: "var(--text4)", padding: 0, flexShrink: 0,
            }}>
              <ChevronLeft size={14} />
            </button>
          )}

          <div data-tour="mobile-tabbar" ref={tabBarRef} style={{
            display: "flex",
            overflowX: "auto", overflowY: "hidden",
            scrollbarWidth: "none", msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch", touchAction: "pan-x",
            scrollBehavior: "smooth",
            padding: `4px ${canScrollRight ? 28 : 8}px 4px ${canScrollLeft ? 28 : 8}px`,
            gap: 2, height: 52, alignItems: "center", flex: 1,
          } as React.CSSProperties}>
            {TABS.map(({ id, Icon, label }) => {
              const isActive = activeTab === id;
              const isRadar = id === "radar";
              const isTdm = id === "orientation";
              return (
                <button key={id} data-tab={id}
                  data-tour={id === "templates" ? "mobile-templates-nav" : undefined}
                  onClick={() => handleTabChange(id)}
                  style={{
                    flexShrink: 0, flexGrow: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                    padding: "4px 8px", height: 44, minWidth: 44, maxWidth: 68,
                    background: isActive
                      ? isRadar ? "rgba(16,185,129,.12)" : isTdm ? "rgba(124,58,237,.12)" : "var(--accentS)"
                      : "transparent",
                    border: isActive
                      ? isRadar ? "1px solid rgba(16,185,129,.3)" : isTdm ? "1px solid rgba(124,58,237,.25)" : "1px solid rgba(27,79,216,.25)"
                      : "1px solid transparent",
                    borderRadius: 10, cursor: "pointer",
                    color: isActive
                      ? isRadar ? "#059669" : isTdm ? "#7C3AED" : "var(--accent)"
                      : "var(--text4)",
                    transition: "all .12s", whiteSpace: "nowrap",
                  }}>
                  <Icon size={15} />
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: ".02em" }}>{label}</span>
                </button>
              );
            })}
          </div>

          {canScrollRight && (
            <button onClick={() => scrollTabBar('right')} style={{
              position: "absolute", right: 0, zIndex: 10,
              width: 28, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(to left, var(--surface) 70%, transparent)",
              border: "none", cursor: "pointer", color: "var(--accent)", padding: 0, flexShrink: 0,
            }}>
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 3, paddingBottom: 4, paddingTop: 1 }}>
          {TABS.map(({ id }) => (
            <div key={id} onClick={() => {
              handleTabChange(id);
              const btn = tabBarRef.current?.querySelector(`[data-tab="${id}"]`) as HTMLElement;
              btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }} style={{
              width: activeTab === id ? 14 : 4, height: 3, borderRadius: 2,
              background: activeTab === id ? "var(--accent)" : "var(--border2)",
              transition: "all .2s", cursor: "pointer",
            }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideUpPanel {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}