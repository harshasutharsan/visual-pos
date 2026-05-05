# VisualPOS - Premium Hybrid Retail Platform 🚀

VisualPOS is a professional, local-first smartphone POS system designed for high-performance retail environments. It combines a "Luxe" liquid-style UI with the speed and reliability of a physical cash register.

## 💎 Key Features

### 📐 High-Performance Hybrid UI
- **Solid Contrast Mode**: Designed for readability in bright shop environments.
- **Pixel-Perfect Alignment**: Mathematical precision in every button and icon.
- **Liquid Aesthetics**: Maintains a premium mobile feel with 48px rounded corners and subtle shadows.
- **Lightning Transitions**: All interactions are optimized at <150ms for zero-lag operation.

### 🔄 Delta Sync Engine v2
- **High-Speed Cloud Sync**: Only synchronizes modified records to Supabase, reducing bandwidth by 90%.
- **Local-First Architecture**: Works 100% offline using IndexedDB (Dexie v7) and syncs automatically when online.
- **Universal Sync**: Categories, Products, Customers, and Transactions stay in sync across all store devices.

### 📦 Universal Inventory & Categories
- **Dynamic Category Management**: Add, edit, or delete custom categories to fit any business type.
- **HD Image Engine**: High-definition product photography with automatic "Visual Repair" logic.
- **Stock Intelligence**: Real-time low-stock alerts and threshold management.

### ⚡ Professional Sales Flow
- **Safe-Click Undo**: Accidentally add an item? Tap the badge to subtract or long-press to remove.
- **Digital Receipts**: Instant PDF generation for thermal printing or digital sharing.
- **Loyalty System**: Built-in customer points and credit balance tracking.

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS (Hybrid Config).
- **Database**: IndexedDB (Local Source of Truth) via Dexie.js.
- **Backend**: Supabase (PostgreSQL, Auth, RLS).
- **Animations**: Framer Motion (Optimized for low-end mobile devices).
- **Documentation**: Professional BRD and README included.

## 🚀 Getting Started

1. **Environment Setup**:
   Create a `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## 🔐 Security
- **Row Level Security (RLS)**: Data is isolated per merchant account.
- **Delta Tracking**: Uses `synced` flags and `updatedAt` timestamps to prevent data loss.
- **Encrypted Auth**: Secure smartphone-first login using phone numbers or email.

---
**VisualPOS** - *The future of local retail.*
