# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A professional 3D print store UI built for "Alex Print Lab" - a micro factory specializing in custom 3D-printed products. The site showcases industrial-themed products with real-time manufacturing and assembly time estimates using PERT (Program Evaluation and Review Technique) three-point estimation.

**Key Features:**
- Product showcase with manufacturing time calculations
- Modal-based custom order form (ContactForm component)
- Dark theme with industrial aesthetic (heat orange + steel blue accents)
- Responsive design with Tailwind CSS
- Framer Motion support for animations (installed but not heavily used yet)

## Architecture & Key Concepts

### Core Data Structure: Product Interface
```typescript
interface Product {
  id, name, description, price
  printTime: TimeSpec  // fast, mid, slow estimates in hours
  assemblyTime: TimeSpec
  image, material
}
```

The `calculateDelivery()` function (App.tsx:45-50) implements PERT estimation: `(fast + 4*mid + slow) / 6`. This provides realistic delivery times by weighting the midpoint heavily.

### Component Structure
- **App.tsx**: Main page layout with navbar, hero section, product grid, footer, and modal state management
- **ContactForm.tsx**: Reusable modal component for custom orders. Takes `productName` as prop and calls `onClose` callback
- **main.tsx**: React root and CSS import

### Design System

**Color Palette** (Tailwind config):
- `dark.matte`: #121212 (main background)
- `dark.carbon`: #1E1E1E (card backgrounds)
- `dark.soft`: #2A2A2A (unused in current design)
- `heat`: #FF5722 (orange accent - buttons, prices, highlights)
- `steel`: #2196F3 (blue accent - currently unused)

**Custom Styles** (styles/index.css):
- `.maker-card`: Product cards with hover lift effect and heat-orange border on hover
- `.stats-font`: Monospace font for time displays (JetBrains Mono)

### Global Styling Notes
- **Fonts**: Inter (body), JetBrains Mono (stats/technical text), loaded from Google Fonts
- **Utilities**: Uses `clsx` and `tailwind-merge` for conditional classNames
- **Animations**: Hover scale on images, button transitions, smooth color changes
- **Responsive**: Mobile-first, grid switches from 1 column (mobile) to 2 columns (md breakpoint)

## Development Commands

```bash
npm run dev          # Start Vite dev server (http://localhost:5173 by default)
npm run build        # TypeScript check + Vite production build (outputs to /dist)
npm run preview      # Preview production build locally
```

**Note**: The build command runs `tsc` first (typecheck only, no emit due to `noEmit: true`) then `vite build`.

## File Structure

```
src/
  components/
    ContactForm.tsx      # Order modal component
  styles/
    index.css           # Tailwind setup + custom component classes
  App.tsx               # Main page (79-90% of functionality)
  main.tsx              # React root
```

## Important Implementation Notes

1. **Product Data**: Currently hardcoded in `App.tsx` (lines 22-43). Products array can be moved to a separate file if it grows.

2. **Form State**: ContactForm is currently UI-only - form submission is prevented (`onSubmit={(e) => e.preventDefault()}`). No backend integration yet.

3. **Icons**: Uses `lucide-react` throughout. The custom `Info` icon in ContactForm (lines 75-79) is a minimal SVG definition since it's not included in lucide's base set.

4. **Modal Management**: Selected product state lives in App.tsx. The modal renders conditionally at the bottom.

5. **Image Sources**: Uses Unsplash for product images. Consider replacing with local assets if needed.

6. **Typography Details**:
   - Hero section: 6xl-8xl text with extreme font-black weight
   - Stats: Monospace font in semi-technical boxes with borders
   - Labels: All-caps tiny text (text-[10px]) with wide letter-spacing

## Language & Localization

The UI uses Traditional Chinese (繁體中文) for labels and product descriptions. English fallbacks provided where relevant (e.g., "Name", "Phone", "Note" in form labels).

## Type Safety

Project uses strict TypeScript (`strict: true` in tsconfig.json). All React components are properly typed with interfaces. Props use type annotations, no implicit `any`.

## Common Development Patterns

- **Conditional Rendering**: Used for modal visibility (`selectedProduct &&`)
- **State Management**: Single useState for selected product - no Redux or context needed at current scale
- **Event Handlers**: Inline arrow functions for simple handlers (e.g., `onClick={() => setSelectedProduct(product)}`)
- **CSS Classes**: Utility-first Tailwind with custom `.maker-card` component class for complex hover effects

## Future Extensibility Notes

- **Product Addition**: Expand PRODUCTS array or load from API - component already scales
- **Analytics**: Modal already has trackable interactions (product selection, form submission)
- **Animations**: Framer Motion is installed but not currently used - good for cart animations or page transitions
- **Backend**: Form will need API integration point (current `onSubmit` prevents default)
