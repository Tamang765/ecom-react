# Design System

## Colors

### Brand
- Primary: #2563EB (Blue-600)
- Primary Hover: #1D4ED8 (Blue-700)
- Primary Active: #1E40AF (Blue-800)

### Neutral
- Background: #FFFFFF
- Surface: #F9FAFB (Gray-50)
- Border: #E5E7EB (Gray-200)
- Text Primary: #111827 (Gray-900)
- Text Secondary: #6B7280 (Gray-500)
- Text Muted: #9CA3AF (Gray-400)

### Semantic
- Success: #059669 (Emerald-600)
- Success Background: #ECFDF5 (Emerald-50)
- Error: #DC2626 (Red-600)
- Error Background: #FEF2F2 (Red-50)
- Warning: #D97706 (Amber-600)
- Warning Background: #FFFBEB (Amber-50)
- Info: #2563EB (Blue-600)

## Typography

### Font
- Family: Inter, system-ui, -apple-system, sans-serif
- Mono: JetBrains Mono, monospace

### Scale
- xs: 0.75rem / 1rem (12px)
- sm: 0.875rem / 1.25rem (14px)
- base: 1rem / 1.5rem (16px)
- lg: 1.125rem / 1.75rem (18px)
- xl: 1.25rem / 1.75rem (20px)
- 2xl: 1.5rem / 2rem (24px)
- 3xl: 1.875rem / 2.25rem (30px)
- 4xl: 2.25rem / 2.5rem (36px)

### Weights
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

## Spacing

- 0: 0
- 1: 0.25rem (4px)
- 2: 0.5rem (8px)
- 3: 0.75rem (12px)
- 4: 1rem (16px)
- 5: 1.25rem (20px)
- 6: 1.5rem (24px)
- 8: 2rem (32px)
- 10: 2.5rem (40px)
- 12: 3rem (48px)
- 16: 4rem (64px)
- 20: 5rem (80px)

## Breakpoints

- Mobile: 0 - 639px
- Tablet: 640px - 1023px
- Desktop: 1024px+

## Border Radius

- none: 0
- sm: 0.25rem (4px)
- base: 0.375rem (6px)
- md: 0.5rem (8px)
- lg: 0.75rem (12px)
- xl: 1rem (16px)
- full: 9999px

## Shadows

- sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
- md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
- lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)

## Components

### Buttons

**Primary**
- Background: Primary
- Text: White
- Padding: 0.5rem 1rem
- Border Radius: base
- Font Weight: Semibold
- Hover: Primary Hover
- Active: Primary Active
- Focus: 2px ring, offset 2px

**Secondary**
- Background: White
- Text: Gray-700
- Border: 1px solid Gray-300
- Padding: 0.5rem 1rem
- Hover: Gray-50
- Active: Gray-100

**Ghost**
- Background: Transparent
- Text: Gray-700
- Padding: 0.5rem 1rem
- Hover: Gray-100

**Danger**
- Background: Red-600
- Text: White
- Hover: Red-700

**Sizes**
- sm: px-3 py-1.5 text-sm
- md: px-4 py-2 text-base
- lg: px-5 py-2.5 text-lg

### Inputs

- Height: 2.5rem (40px)
- Padding: 0 0.75rem
- Border: 1px solid Gray-300
- Border Radius: base
- Background: White
- Text: Gray-900
- Placeholder: Gray-400
- Focus: Border Primary, Ring 2px Primary/20
- Error: Border Red-500, Ring 2px Red-500/20
- Disabled: Background Gray-50, Text Gray-400

### Cards

- Background: White
- Border: 1px solid Gray-200
- Border Radius: lg
- Shadow: sm
- Padding: 1.5rem
- Hover (optional): Shadow md, -translate-y 0.5px

### Product Card

- Image: Aspect ratio 1/1, object-cover, rounded-t-lg
- Content: Padding 1rem
- Title: Font medium, truncate 2 lines
- Price: Font semibold, text-lg
- Button: Full width, primary

### Navigation

- Height: 4rem (64px)
- Background: White
- Border: Bottom 1px Gray-200
- Logo: Font bold, text-xl
- Links: Font medium, text-sm, hover text-primary
- Mobile: Hamburger menu, slide-in drawer

### Layout

- Max Width: 1280px (7xl)
- Padding X: 1rem mobile, 1.5rem tablet, 2rem desktop
- Grid Gap: 1rem mobile, 1.5rem desktop

## E-Commerce Specifics

### Price Display

- Current Price: Font semibold, text-lg, text-gray-900
- Original Price: Font normal, text-sm, text-gray-500, line-through
- Currency: $ prefix, 2 decimal places

### Cart Badge

- Background: Red-600
- Text: White
- Font: text-xs, font bold
- Min Width: 1.25rem
- Height: 1.25rem
- Border Radius: full
- Position: -top-1 -right-1 absolute

### Product Grid

- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns
- Gap: 1rem

### Checkout Steps

- Active: Primary color, font semibold
- Completed: Success color, check icon
- Upcoming: Gray-400, numbered
- Connector: Gray-200 line

## Accessibility

### Focus States
- Visible focus ring on all interactive elements
- 2px solid Primary with 2px offset
- Skip to main content link

### Color Contrast
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 against background

### Keyboard Navigation
- Tab order follows visual flow
- Escape closes modals/dropdowns
- Enter/Space activates buttons
- Arrow keys navigate menus

### Screen Reader
- Meaningful alt text for images
- ARIA labels for icon-only buttons
- Live regions for dynamic content
- Form error announcements

### Motion
- Respect prefers-reduced-motion
- Transitions: 150ms ease
- Animations: 200ms ease

## Dark Mode (Future)

- Background: Gray-900
- Surface: Gray-800
- Border: Gray-700
- Text: Gray-100
- Primary: Blue-500 (lighter for contrast)
