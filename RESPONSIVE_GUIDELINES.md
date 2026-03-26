# EETRA Responsive Design Implementation Guidelines

## Quick Reference: Core Breakpoints

```
320px  (XS) - iPhone SE, small phones
480px  (SM) - Standard phones
640px  (MD) - Large phones, small tablets
768px  (LG) - iPad mini, tablets
1024px (XL) - iPad Pro, small desktops
1280px (2XL) - Large desktops
1536px (3XL) - Extra large displays
```

## CSS Architecture

### 1. Tailwind Configuration
The project uses customized Tailwind breakpoints in `tailwind.config.js`:

```javascript
screens: {
  xs: '320px',
  sm: '480px',
  md: '640px',
  lg: '768px',
  xl: '1024px',
  '2xl': '1280px',
  '3xl': '1536px',
}
```

**Usage in components:**
```jsx
<div className="grid grid-cols-4 md:grid-cols-2 xs:grid-cols-1">
  // 4 columns on desktop, 2 on tablet, 1 on mobile
</div>
```

### 2. Mobile.css Structure

The `mobile.css` file is organized by feature sections. Always check mobile.css before adding new media queries:

```css
/* Touch targets */
@media (max-width: 767px) { ... }

/* XS phones (320-479px) */
@media (max-width: 479px) { ... }

/* Tablet breakpoint (640-767px) */
@media (min-width: 640px) and (max-width: 767px) { ... }

/* General sections: Dashboard, Templates, Settings, etc. */
@media (max-width: 767px) { 
  .db-side { ... }
  .tpl-grid { ... }
}
```

### 3. CSS Variables

Safe areas and core styles defined in `globals.css`:

```css
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
}
```

## Best Practices

### 1. Mobile-First Development

**✅ DO:**
```css
/* Start with mobile styles */
.card { padding: 12px; }

/* Enhance for larger screens */
@media (min-width: 768px) {
  .card { padding: 20px; }
}
```

**❌ DON'T:**
```css
/* Don't start with desktop and hack mobile */
.card { padding: 40px; }
@media (max-width: 767px) {
  .card { padding: 12px; }
}
```

### 2. Fluid Typography

Always use `clamp()` for responsive text sizing:

```css
/* Good: Scales smoothly across all sizes */
h1 { font-size: clamp(1.5rem, 4vw, 3rem); }

/* Also acceptable: Fixed sizes with media queries */
h1 { font-size: 1.5rem; }
@media (min-width: 768px) { h1 { font-size: 2rem; } }

/* Bad: Fixed size, doesn't scale */
h1 { font-size: 2rem; }
```

### 3. Responsive Grids

Follow the established pattern: **4-col → 2-col → 1-col**

```css
/* Desktop: 4 columns */
.grid { grid-template-columns: repeat(4, 1fr); }

/* Tablet: 2 columns */
@media (max-width: 1023px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Mobile: 1 column */
@media (max-width: 767px) {
  .grid { grid-template-columns: 1fr; }
}
```

### 4. Touch-Friendly Interactions

All interactive elements must meet **44x44px minimum** on mobile:

```css
@media (max-width: 767px) {
  button, a, [role="button"] {
    min-height: 44px;
    min-width: 44px;
    padding: 10px 14px; /* Adjust to reach 44x44 */
  }
  
  /* Exception: icon-only buttons can be smaller */
  .icon-btn {
    min-height: unset;
    min-width: unset;
  }
}
```

### 5. Handling Sidebars/Overlays

Use the established drawer pattern for mobile:

```css
@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 240px;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform .25s cubic-bezier(.23,1,.32,1);
    z-index: 50;
  }
  
  .sidebar.open { transform: translateX(0); }
  .sidebar-overlay { display: block; }
}
```

### 6. Form Inputs

Prevent iOS zoom on input focus:

```css
@media (max-width: 767px) {
  input, textarea, select {
    font-size: 16px !important; /* Prevents iOS zoom */
  }
}
```

## Common Responsive Patterns

### Pattern 1: Responsive Cards

```jsx
<div className="grid grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4 md:gap-3 sm:gap-2">
  {items.map(item => (
    <div className="p-6 md:p-4 sm:p-3 rounded-lg">
      {item.content}
    </div>
  ))}
</div>
```

### Pattern 2: Responsive Tables

For tables on mobile, show only essential columns:

```css
@media (max-width: 767px) {
  .table th:nth-child(n+4),
  .table td:nth-child(n+4) {
    display: none;
  }
}
```

Or convert to card view:

```css
@media (max-width: 767px) {
  .table {
    display: grid;
    grid-template-columns: 1fr;
  }
  
  .table-row {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 8px;
  }
}
```

### Pattern 3: Responsive Navigation

```jsx
<nav className="hidden md:flex gap-6">
  {/* Desktop nav */}
</nav>

<button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
  <Menu size={20} />
</button>

{menuOpen && (
  <div className="fixed inset-0 bg-black/50 z-40" />
)}
<div className={`fixed left-0 top-0 w-[240px] transform md:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
  {/* Mobile menu */}
</div>
```

### Pattern 4: Responsive Images

```jsx
<img 
  src={image}
  srcSet={`
    ${image} 320px,
    ${imageLarge} 1024px
  `}
  sizes="(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Description"
/>
```

## Component Development Checklist

When creating a new component, follow this checklist:

- [ ] **Mobile Layout**: Is there a single-column mobile layout?
- [ ] **Touch Targets**: Are all buttons/links at least 44x44px on mobile?
- [ ] **Typography**: Using clamp() for responsive text sizes?
- [ ] **Spacing**: Padding/margins scale responsively?
- [ ] **Media Queries**: Checked mobile.css for existing patterns?
- [ ] **Overflow**: No horizontal scrolling on mobile (unless intentional)?
- [ ] **Forms**: Inputs are full-width and 16px font size on mobile?
- [ ] **Tables**: Only essential columns visible on mobile?
- [ ] **Modals**: Full-screen on XS phones?
- [ ] **Testing**: Tested on real devices (iPhone SE, Galaxy S21, iPad)?

## Accessibility Requirements

All responsive implementations must include:

```css
/* Focus indicators */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px;
}

/* High contrast support */
@media (prefers-contrast: more) {
  /* Adjust colors for better contrast */
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Performance Optimization

### CSS Performance
- ✅ Use `display: none` to hide elements (browser optimization)
- ✅ Use CSS Grid for complex layouts
- ✅ Leverage CSS variables for theme consistency
- ❌ Avoid JavaScript-only responsive solutions

### Image Performance
- ✅ Use srcset for different device sizes
- ✅ Use picture element for art direction
- ✅ Compress images for mobile
- ❌ Don't load large desktop images on mobile

### JavaScript Performance
- ✅ Use `passive: true` for scroll/resize listeners
- ✅ Debounce resize handlers
- ❌ Don't query window.innerWidth repeatedly

## Debugging Responsive Issues

### Using Browser DevTools

1. **Chrome/Edge**: Press `Ctrl+Shift+M` for responsive design mode
2. **Firefox**: Press `Ctrl+Shift+M` for responsive design mode
3. **Safari**: Click Develop → Enter Responsive Design Mode

### Common Issues & Fixes

**Issue: Content horizontally scrolls on mobile**
```css
/* Check for fixed widths */
.container { width: 100% !important; /* not 1200px */ }
```

**Issue: Text is too small on mobile**
```css
/* Use clamp() */
p { font-size: clamp(14px, 2.5vw, 16px); }
```

**Issue: Buttons not tappable**
```css
/* Ensure 44x44px minimum */
button { min-height: 44px; min-width: 44px; }
```

**Issue: Layout breaks on tablet**
```css
/* Add md breakpoint handling */
@media (max-width: 1023px) {
  .layout { grid-template-columns: 1fr !important; }
}
```

## Files Reference

### Key Files
- `tailwind.config.js` - Breakpoint definitions, responsive utilities
- `src/app/globals.css` - Global styles, safe areas, dark mode
- `src/app/mobile.css` - All mobile-specific media queries

### Component Files Modified
- `src/components/landing/*` - Landing page components
- `src/app/dashboard/page.tsx` - Dashboard layout
- `src/components/editor/EditorLayout.tsx` - Editor responsivity

## Additional Resources

- [MDN: CSS Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries)
- [CSS Tricks: A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Web.dev: Responsive Web Design](https://web.dev/responsive-web-design-basics/)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)

## Getting Help

For responsive design questions:
1. Check `RESPONSIVE_TESTING.md` for testing guidance
2. Review `RESPONSIVE_CHANGES.md` for implementation examples
3. Look at similar components in the codebase
4. Test using browser DevTools responsive mode
