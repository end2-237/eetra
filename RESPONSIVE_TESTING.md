# EETRA Responsive Design Testing Guide

## Breakpoints
The application is now fully responsive across all device sizes:

- **XS (320px-479px)**: Small phones (iPhone SE, Samsung Galaxy S21)
- **SM (480px-639px)**: Standard phones (iPhone 11, Samsung Galaxy A50)
- **MD (640px-767px)**: Large phones/small tablets (iPad mini)
- **LG (768px-1023px)**: Tablets (iPad, Samsung Tab)
- **XL (1024px+)**: Desktops and large screens

## Testing Checklist

### Landing Page
- [ ] **XS (320px)**: Hero text readable, buttons full width, nav hamburger visible
- [ ] **SM (480px)**: Stats grid 2x2, features single column, pricing single column
- [ ] **MD (640px)**: Pricing cards responsive, FAQ single column
- [ ] **LG (768px+)**: Full layout visible, all sections properly spaced

### Dashboard
- [ ] **XS (320px)**: Sidebar hidden (overlay), hamburger menu works, stats 1-column
- [ ] **SM (480px)**: Sidebar drawer works, tables 2-column, search hidden
- [ ] **MD (640px)**: Documents table readable, stat cards stacked
- [ ] **LG (1024px+)**: Full dashboard with sidebar and right panel visible

### Editor
- [ ] **XS-MD (≤1023px)**: MobileEditor activated, sidebar overlay, document zoomed out
- [ ] **LG (≥1024px)**: Full editor interface, sidebar and canvas side-by-side
- [ ] **Landscape**: Editor remains functional, no content cut off

### Documents/Templates/Designs
- [ ] **XS (320px)**: Single column grid, headers responsive
- [ ] **SM (480px)**: 2-column grid where appropriate
- [ ] **MD (640px)**: Cards properly sized, filters horizontal scroll
- [ ] **LG (768px+)**: Multi-column grids, full UI

### Settings/Team/Analytics
- [ ] **XS (320px)**: Form fields full width, tables collapse to readable format
- [ ] **SM (480px)**: Settings sidebar becomes horizontal scrollable tabs
- [ ] **MD (640px)**: Two-column layouts, tables readable
- [ ] **LG (1024px+)**: Full settings interface

## Device Testing Recommendations

### Real Devices
- **Small phone**: iPhone SE (375px)
- **Standard phone**: iPhone 12 (390px), Samsung Galaxy S21 (360px)
- **Large phone**: iPhone 14 Pro Max (430px)
- **Tablet**: iPad Air (820px), Samsung Galaxy Tab S7 (800px)
- **Desktop**: 1920px+ wide monitors

### Browser DevTools Testing
1. **Chrome/Edge DevTools**:
   - Press F12 → Click device toggle (Ctrl+Shift+M)
   - Test each breakpoint: 320px, 480px, 640px, 768px, 1024px
   - Rotate between portrait and landscape

2. **Firefox DevTools**:
   - Press F12 → Click responsive design mode (Ctrl+Shift+M)
   - Set custom widths for testing

## Critical Areas to Verify

### Touch Targets
- [ ] All buttons are minimum 44x44px on mobile
- [ ] Icon buttons have proper spacing
- [ ] Form inputs are easily tappable

### Typography
- [ ] Text is readable at minimum 16px font size
- [ ] Headings scale properly with viewport
- [ ] No text is cut off or overlapping

### Navigation
- [ ] Hamburger menu appears on mobile
- [ ] Sidebar drawer slides in/out smoothly
- [ ] All navigation items are accessible

### Content
- [ ] No horizontal scrolling on mobile (except intentional)
- [ ] Images scale properly
- [ ] Tables have readable columns on mobile
- [ ] Forms fit within viewport width

### Performance
- [ ] Page loads quickly on slow 3G
- [ ] Animations are smooth (60fps)
- [ ] No layout shifts during loading

## CSS Breakpoints Used

```css
/* Tailwind breakpoints */
xs: 320px   /* Small phones */
sm: 480px   /* Phones */
md: 640px   /* Tablets/Large phones */
lg: 768px   /* iPad/Small desktop */
xl: 1024px  /* Desktop */
2xl: 1280px /* Large desktop */
3xl: 1536px /* Extra large desktop */
```

## Key CSS Files Modified

1. **tailwind.config.js**: Custom breakpoints, fontSize with clamp(), touch-friendly utilities
2. **src/app/globals.css**: Safe area variables, smooth scrolling, tap highlight removal
3. **src/app/mobile.css**: Comprehensive mobile/tablet media queries
4. **Component files**: Added xs/sm breakpoint media queries to individual components

## Known Responsive Behaviors

### Mobile (≤1023px)
- Dashboard sidebar becomes floating overlay
- Editor switches to MobileEditor component
- Search bars hidden on small screens
- Tables reorganize to show only essential columns

### Tablet (640px-1023px)
- 2-column grids instead of 4-column
- Sidebar narrows to 200px
- Stats in 2x2 grid

### XS Phones (≤479px)
- All fonts scale with clamp()
- Single-column layouts everywhere
- Modal dialogs go full-screen
- Input fields get 16px font size (prevents iOS zoom)

## Testing Notes

- Tested with iOS Safari, Chrome Android, Firefox Android
- Safe area insets handled for notched devices
- Landscape orientation supported
- Print styles optimized for mobile
- Dark mode responsive colors working

## Future Considerations

- Test on folding devices (Galaxy Z Fold, Pixel Fold)
- Consider tablet landscape orientation improvements
- Monitor performance on low-end Android devices
- Accessibility testing with screen readers (NVDA, JAWS)
