"use client";

/**
 * EditableCoverPageMobile
 *
 * Renders the cover page at the correct visual scale, then shows
 * the EditableCoverPage properties panel **directly below** the page
 * in the document scroll view — no bottom sheet needed.
 */

import { EditableCoverPage } from "./EditableCoverPage";

const PAGE_W = 794;

interface Props {
  /** Visual scale factor = windowWidth / PAGE_W */
  scale: number;
  windowWidth: number;
}

export function EditableCoverPageMobile({ scale, windowWidth }: Props) {
  return (
    <div
      style={{
        width: windowWidth,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <EditableCoverPage zoom={scale} mobileLayout />
    </div>
  );
}