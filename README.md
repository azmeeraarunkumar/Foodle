# 🍽️ Foodle - Food Pre-Ordering PWA

**Skip the line, not the food**

A Progressive Web App for pre-ordering food at IIT Gandhinagar campus. Order from your hostel room, walk to the stall only when your food is ready.

## ✨ Features

### Student App
- 🔐 Google OAuth authentication
- 🏪 Browse 6 food stalls + Mess Hall
- 📱 Real-time order tracking (Sent → Preparing → Ready)
- 💳 Prepaid payment via Razorpay (UPI/Cards)
- 🎫 Digital pickup code (4-digit OTP)
- 📊 Order history and profile management

### Vendor App
- 📦 Real-time order queue
- ⏱️ Order status management
- 🍔 Menu item management
- 🔕 Snooze feature (pause new orders)
- 📈 Analytics dashboard

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Realtime)
- **Auth**: Supabase Auth (Google OAuth)
- **Payments**: Razorpay
- **State Management**: Zustand
- **PWA**: next-pwa

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Razorpay account (test mode works)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

   You'll need:
   - Supabase URL and keys (from your Supabase project)
   - Razorpay keys (test mode: rzp_test_xxxx)

3. **Set up Supabase Database**
   
   Run the SQL schema in your Supabase SQL Editor (see `docs/database-schema.sql`)

4. **Configure Google OAuth in Supabase**
   
   - Go to Authentication → Providers → Google
   - Add your Google OAuth credentials
   - Set Redirect URL: `https://your-project.supabase.co/auth/v1/callback`

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 📝 Project Structure

```
foodle/
├── app/                    # Next.js app directory
│   ├── (student)/         # Student-facing routes
│   │   ├── home/         # Stall list
│   │   ├── stall/[id]/   # Menu screen
│   │   ├── cart/         # Cart & checkout
│   │   ├── orders/       # Order history
│   │   └── profile/      # Profile & settings
│   ├── (vendor)/         # Vendor-facing routes
│   │   ├── dashboard/    # Order management
│   │   ├── menu/         # Menu management
│   │   └── analytics/    # Analytics
│   ├── login/            # Login page
│   └── auth/callback/    # OAuth callback
├── components/
│   ├── ui/               # Reusable UI components
│   ├── student/          # Student-specific components
│   └── vendor/           # Vendor-specific components
├── lib/
│   ├── supabase/         # Supabase client & types
│   ├── store/            # Zustand stores
│   └── utils/            # Utility functions
└── public/               # Static assets

```

## 🎨 Design System

Based on the PRD, Foodle uses a custom design system with:

- **Primary Color**: #C6E94B (Lime Yellow-Green)
- **Typography**: Inter font family
- **Components**: Custom Button, Input, Card, Badge components
- **Shadows & Radius**: Consistent spacing and border radius tokens

## 🔒 Authentication

- **Students**: Google OAuth (currently accepts any email for testing)
- **Vendors**: Email/Password (admin-created accounts only)

> **Note**: Email domain restriction (@iitgn.ac.in) is disabled for testing. Enable it in production by uncommenting the domain check in `/app/auth/callback/page.tsx`.

## 💳 Payment Integration

All orders require prepaid payment via Razorpay:

1. User adds items to cart
2. Clicks "Pay & Place Order"
3. Razorpay modal opens
4. On successful payment → Order created + OTP generated
5. User can track order in real-time

## 🔄 Real-time Features

Powered by Supabase Realtime:

- **Stall Status Updates**: Instant snooze/open status changes
- **Menu Availability**: Live menu item availability
- **Order Status**: Real-time order tracking (received → preparing → ready)
- **Vendor Notifications**: New order alerts with sound

## 📱 PWA Configuration

Install as a Progressive Web App:

- Standalone mode support
- Offline splash screen
- 192px & 512px icons
- Manifest.json configured

## 🚧 Development Status

**Current Phase**: Building student app core features

### Completed ✅
- [x] Project setup with Next.js 14
- [x] Design system & component library
- [x] Authentication flow
- [x] Home page with stall list
- [x] Bottom navigation
- [x] Cart state management

### In Progress 🚧
- [ ] Stall menu screen
- [ ] Cart & checkout
- [ ] Payment integration
- [ ] Order tracking
- [ ] Vendor dashboard

## 📖 Documentation

- [Complete PRD](./docs/PRD.md)
- [Implementation Plan](./docs/implementation-plan.md)
- [Database Schema](./docs/database-schema.sql)

## 🤝 Contributing

This is a college project for IIT Gandhinagar. For questions or issues, please contact the development team.

## 📄 License

Proprietary - IIT Gandhinagar

---

**Built by Division Zero** - 100% AI-generated code, zero manual lines
