# Project Status & Agent Handoff

**Last Updated:** 2025-12-01

## Current Context
The "Foodle" project is a PWA for a university campus food ordering system.
We are currently in the **Execution** phase of building the **Vendor App** and **Payment Integration**.

## Architecture
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS.
- **Backend:** Supabase (Auth, Database, Realtime).
- **State Management:** React Context / Hooks.
- **Styling:** Tailwind CSS with custom design system (see `tailwind.config.ts` and `app/globals.css`).

## What is Completed
- [x] **Authentication:** Google OAuth via Supabase.
- [x] **Student Interface:**
    - Home page (Stall listing).
    - Menu browsing.
    - Cart management (Add/Remove items, Special instructions).
    - Profile & About pages.
- [x] **Database:** Schema set up for Users, Stalls, Menu Items, Orders.

## Immediate Next Steps (To-Do)
The primary focus for the next session is **Vendor Features** and **Payments**:

1.  **Payment Integration (Razorpay):**
    - Integrate Razorpay SDK.
    - Implement "Pay & Place Order" flow in the Cart.
    - Handle payment success/failure callbacks.
    - Create Order records in Supabase upon successful payment.

2.  **Vendor Dashboard:**
    - Create a separate route/layout for Vendors (e.g., `/vendor`).
    - Implement "Incoming Orders" view (Realtime updates).
    - Implement "Order History".
    - Allow Vendors to toggle Stall Open/Closed status.
    - Allow Vendors to mark items as Out of Stock.

## Instructions for New Agent
1.  Read `docs/SETUP.md` to understand the environment.
2.  Read `docs/database-schema.sql` to understand the data model.
3.  Check `app/` structure to see existing components.
4.  Begin work on **Payment Integration** or **Vendor Dashboard** as requested by the user.
