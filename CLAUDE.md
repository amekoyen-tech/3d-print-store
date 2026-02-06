# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A professional 3D print store e-commerce platform built for "Alex Print Lab" - a micro factory specializing in custom 3D-printed products. Features a full product catalog, shopping cart, order management system, admin panel, and real-time Firebase backend integration.

**Key Features:**
- 📦 Product showcase with material/precision specifications
- 🛒 Shopping cart with color customization (localStorage persistence)
- 📝 Order submission with delivery/payment method selection
- 👤 Admin panel for product/order/color management
- 🔐 Admin authentication with Firebase
- 📍 Order tracking system
- 🎨 Dark industrial theme (heat orange + steel blue accents)
- 🌐 Traditional Chinese localization
- ⚡ Firebase real-time database + authentication
- 🎭 Error boundary + emulator mode support

## Architecture & Key Concepts

### Core Data Models
```typescript
// Main product type - stores in Firebase 'products' collection
interface Product {
  id: string;
  name: string;
  materials: string[];  // PLA+, PETG, ABS, etc.
  weight_g: number;
  print_time_min: number;
  post_processing_time_min: number;
  price: number;
  images: string[];
  description: string;
  precision_mm?: number;
  isCustomizable?: boolean;
  customizationFee?: number;
}

// Order lifecycle - stored in Firebase 'orders' collection
interface Order {
  id: string;
  customer: { name, phone, contactMethod, address?, notes? };
  deliveryMethod: 'in_person' | 'mailing';
  paymentMethod: 'bank_transfer' | 'line_pay' | 'cash';
  items: CartItem[];
  status: 'pending' | 'accepted' | 'printing' | 'post_processing' | 'rejected' | 'completed' | 'cancelled';
  totalPrice: number;
  estimatedCompletionDate?: string;
  createdAt: Firestore Timestamp;
}

// Color customization
interface ColorSwatch {
  id: string;
  name: string;
  hexCode: string;
  material: string;
  inStock: boolean;
}
```

### Routing Structure
```
/              → HomePage (product gallery + ProductDetail modal)
/track         → TrackOrderPage (order tracking with ID lookup)
/login         → LoginPage (admin authentication)
/admin         → AdminPage (protected route - product/order/color management)
```

### Component Structure
- **pages/**: Top-level route pages (HomePage, AdminPage, LoginPage, TrackOrderPage)
- **components/**: Reusable UI components
  - `ProductCard.tsx`: Product grid item with add-to-cart
  - `ProductDetail.tsx`: Full product view with color selection + customization
  - `CartDrawer.tsx`: Sliding cart sidebar with order form
  - Admin components: `AdminProductForm`, `AdminOrderList`, `AdminColorManager`, etc.
  - `ErrorBoundary.tsx`: Global error handling
- **contexts/CartContext.tsx**: Global cart state (localStorage + React Context)
- **hooks/**: Custom hooks for Firebase operations
  - `useProducts()`: Load/add/update/delete products from Firebase
  - `useOrders()`: Order management (create, fetch, update status)
  - `useColors()`: Color swatch CRUD
  - `useOrderSubmission()`: Form submission + validation
- **lib/firebase.ts**: Firebase config + initialization (uses env vars)

### State Management

**CartContext** (`contexts/CartContext.tsx`):
- Provides: `items`, `addToCart()`, `removeFromCart()`, `updateQuantity()`, `totalItems`, `totalPrice`, `isCartOpen`, `setIsCartOpen()`
- Persists to localStorage under `'cart'` key
- Supports color variants: unique cart IDs are `${productId}-${colorId}`
- Applied customization fees when color is non-default

**Custom Hooks** (queries Firebase directly):
- `useProducts()`: real-time snapshot listener on `db.collection('products')`
- `useOrders()`: CRUD for orders collection
- `useColors()`: CRUD for colorSwatches subcollection
- `useOrderSubmission()`: Handles form submission + payment/delivery validation

### Design System

**Color Palette** (tailwind.config.js):
- `dark.matte`: #121212 (main bg - rarely used, prefer #050505)
- `dark.carbon`: #1E1E1E (card backgrounds)
- `dark.soft`: #2A2A2A (subtle accents)
- `heat`: #FF5722 (orange - PRIMARY - buttons, cart icon, status indicators)
- `steel`: #2196F3 (blue - secondary accent - currently minimal usage)

**Typography**:
- Hero: 6xl-8xl with font-black weight
- Nav labels: `text-[10px] uppercase tracking-widest` (nano text)
- Product cards: Regular text with monospace for technical specs
- Form labels: `text-[10px]` all-caps with tracking
- Fonts: Google Fonts loaded in styles/index.css (Inter + JetBrains Mono)

**Interactive Elements**:
- Buttons: Heat-orange with hover scale/transition
- Cart button: Fixed bottom-right, floating with cart badge
- Product cards: Hover lift + border color change
- Forms: Input styling with focus states
- Modal transitions: Smooth opacity + scale with Framer Motion

### Global Styling Notes
- **CSS Classes**: Uses Tailwind utility-first + custom component classes
- **Utilities**: `clsx` and `tailwind-merge` for conditional classNames
- **Animations**:
  - `.animate-spin-slow` (8s rotation for settings icon)
  - Framer Motion for cart animations + page transitions
  - Hover scale effects on images
- **Responsive**: Mobile-first (sm, md, lg breakpoints)
- **Dark Background**: Uses `#050505` instead of pure black for softness
- **Glassmorphism**: White/transparent backgrounds with blur for nav/modals

## Development Commands

```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # TypeScript check + Vite production build (outputs to /dist)
npm run preview      # Preview production build locally
```

**Note**: Build runs `tsc` (type-check only, `noEmit: true`) then `vite build`.

## File Structure

```
src/
  pages/
    HomePage.tsx              # Product gallery + ProductDetail modal
    AdminPage.tsx             # Admin dashboard (protected)
    LoginPage.tsx             # Admin authentication
    TrackOrderPage.tsx        # Order tracking lookup
  components/
    ProductCard.tsx           # Product grid item
    ProductDetail.tsx         # Full product view + cart add
    CartDrawer.tsx            # Sliding cart + checkout form
    AdminProductForm.tsx      # Add/edit product form
    AdminOrderList.tsx        # Order management table
    AdminColorManager.tsx     # Color swatch CRUD
    AdminProductList.tsx      # Product management table
    AdminProtectedRoute.tsx   # Route guard for /admin
    ErrorBoundary.tsx         # Global error fallback
    ui/Badge.tsx              # Status badge component
  contexts/
    CartContext.tsx           # Cart state + localStorage
  hooks/
    useProducts.ts            # Firebase products CRUD + listener
    useOrders.ts              # Firebase orders CRUD
    useColors.ts              # Color swatches CRUD
    useOrderSubmission.ts     # Form validation + submission
  lib/
    firebase.ts               # Firebase config (uses env vars)
  styles/
    index.css                 # Tailwind directives + custom classes
  data/
    products.json             # Seed data (optional fallback)
  types.ts                    # TypeScript interfaces
  utils.ts                    # Helper functions
  App.tsx                     # Router + AppContent wrapper
  main.tsx                    # React root
```

## Important Implementation Notes

1. **Firebase Integration**:
   - Config uses `import.meta.env.VITE_FIREBASE_*` variables
   - Collections: `products`, `orders`, `colorSwatches`
   - Auth: Admin uses Firebase Auth (email/password)
   - Firestore rules should protect admin routes
   - Emulator mode supported: `VITE_USE_EMULATORS=true` shows warning banner

2. **Product Data**:
   - Primary source: Firebase `products` collection (real-time listener in `useProducts()`)
   - Fallback: `src/data/products.json` for seed data
   - Customizable products have `isCustomizable: true` and `customizationFee` set

3. **Cart Management**:
   - State: React Context + localStorage (`'cart'` key)
   - Unique IDs: `${productId}-${colorId}` to handle color variants
   - Customization fee applied in `addToCart()` when non-default color selected
   - Persists across page reloads

4. **Order Submission Flow**:
   - User adds items + selects colors in ProductDetail
   - CartDrawer shows order form with delivery/payment options
   - Form validates customer info (name, phone, contact method)
   - On submit: creates document in `orders` collection with status `'pending'`
   - Admin can update status + add notes

5. **Admin Authentication**:
   - LoginPage uses Firebase Auth
   - AdminProtectedRoute checks `auth.currentUser`
   - Unauthorized users redirected to /login
   - No user account creation endpoint yet (manually add users in Firebase Console)

6. **Color Customization**:
   - ColorSwatches stored in Firebase (can be filtered by material)
   - ProductDetail shows color picker for customizable products
   - Selected color affects cart item price + display

7. **Icons**: Uses `lucide-react` exclusively. No custom SVG icons needed.

8. **Images**: Uses Unsplash URLs. Consider migrating to Firebase Storage + CDN for production.

## Environment Variables

Create `.env.local` with:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_USE_EMULATORS=false  # Set to 'true' for local emulator testing
```

See `.env.example` for reference.

## Language & Localization

- **Primary**: Traditional Chinese (繁體中文) for all customer-facing text
- **Secondary**: English in comments + fallbacks
- **Pages translated**: HomePage, ProductDetail, CartDrawer, TrackOrderPage, LoginPage, AdminPage
- **Format**: Hard-coded strings (no i18n library yet; could use react-i18next if expanding to other languages)

## Type Safety

- Strict TypeScript: `strict: true` in tsconfig.json
- All React components properly typed with interfaces/types
- Props use full type annotations, no implicit `any`
- Firebase operations typed via `types.ts` interfaces
- Error handling includes proper type narrowing

## Common Development Patterns

- **Real-time Listeners**: `useProducts()`, `useOrders()` use Firebase `onSnapshot()` for live updates
- **Conditional Rendering**:
  - Cart visibility: `{isCartOpen && <CartDrawer />}`
  - Admin access: `<AdminProtectedRoute>` wrapper
- **Event Handlers**: Mostly arrow functions + async/await for Firebase ops
- **CSS Classes**: Tailwind utilities + `clsx` for conditionals (e.g., `clsx('px-4', status === 'completed' && 'bg-green-500')`)
- **Error Boundaries**: Top-level ErrorBoundary catches component render errors
- **Loading States**: Each hook returns `loading` + `error` flags

## Current Limitations & Future Work

- **No Payment Processing**: Currently supports cash/bank transfer/LINE Pay selection, but no actual payment gateway
- **No Email Notifications**: Orders created but no confirmation emails sent
- **Admin User Management**: No self-service signup; admins added manually in Firebase Console
- **No Image Upload**: ProductDetail uses hardcoded image URLs; consider Firebase Storage integration
- **No Advanced Search**: Homepage shows all products; could add filtering by material/price/weight
- **No Bulk Operations**: Admin can't bulk edit products or orders
- **Mobile Responsiveness**: Mostly complete but some admin pages could be better optimized for mobile
- **Analytics**: No tracking/analytics integration yet (good opportunity for PostHog/GA)
- **Testing**: No unit/integration tests; could add Vitest + React Testing Library
- **Multi-language**: Currently hardcoded Chinese; i18n library would help support more languages
