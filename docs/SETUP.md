# Foodle - Quick Setup Guide

Follow these steps to get Foodle running on your local machine.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- (Optional) Razorpay account for payment testing

## Step 1: Install Dependencies

The project is already initialized with all configuration files. Simply install the packages:

```bash
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" (sign in with GitHub)
3. Create a new project
4. Choose a project name (e.g., "foodle")
5. Set a database password (save this!)
6. Wait for the project to provision (~2 minutes)

### 2.2 Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Open the file `/docs/database-schema.sql`
4. Copy ALL the SQL content
5. Paste it into the Supabase SQL editor
6. Click "Run" (bottom right)
7. You should see "Success. No rows returned" — this is correct!

This creates:
- ✅ All tables (users, stalls, menu_items, orders)
- ✅ Indexes for performance
- ✅ Row Level Security policies
- ✅ Database triggers
- ✅ Realtime enabled
- ✅ Seed data (6 stalls + sample menu items)

### 2.3 Configure Google OAuth

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Toggle it **ON**
4. For testing, you can use Supabase's default Google OAuth setup
5. Click "Save"

> **Note**: For production, you'll need to create your own Google OAuth app in Google Cloud Console

### 2.4 Get Your Supabase Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. (Optional) Add Razorpay keys for payment testing:
   ```bash
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxx
   RAZORPAY_KEY_SECRET=your-secret-key
   ```

   > **Skip Razorpay for now**: You can test the app without Razorpay. The payment button will show an alert instead.

## Step 4: Run the Development Server

```bash
npm run dev
```

The app will start at [http://localhost:3000](http://localhost:3000)

## Step 5: Test the App!

### Login as a Student

1. Go to [http://localhost:3000](http://localhost:3000)
2. You'll see the splash screen, then be redirected to login
3. Click "Continue with Google"
4. Sign in with ANY Google account (domain restriction is disabled for testing)
5. You'll be redirected to the home page

### Browse Stalls & Add to Cart

1. You should see 6 stalls on the home page
2. Click on "Night Canteen"
3. Browse menu items (Maggi, Cheese Maggi, etc.)
4. Click the **+** button to add items to cart
5. Notice the sticky cart bar at the bottom
6. Click "View Cart"

### Test the Cart

1. Adjust quantities using +/- buttons
2. Add special instructions (e.g., "Less spicy")
3. Click "Pay & Place Order" — you'll see an alert (Razorpay not integrated yet)

### Explore Other Screens

- **Orders Tab**: Currently shows empty state
- **Profile Tab**: View your info and logout
- **About Tab**: Learn about Division Zero's AI-powered approach

## What's Working ✅

- [x] Google OAuth authentication
- [x] Splash screen with auth check
- [x] Home page with stall list
- [x] Real-time stall status updates (try toggling in Supabase)
- [x] Stall menu page with categories
- [x] Add to cart functionality
- [x] Cart page with item management
- [x] Bottom navigation
- [x] Profile page with logout
- [x] About page

## What's Not Yet Implemented ⚠️

- [ ] Payment integration (Razorpay)
- [ ] Order tracking screen
- [ ] Orders history
- [ ] Vendor dashboard
- [ ] Real-time order notifications
- [ ] PWA installation

## Troubleshooting

### "Cannot connect to database"
- Check that your Supabase project is active
- Verify `.env.local` has correct credentials
- Make sure you ran the database schema SQL

### "Login keeps redirecting"
- Clear browser cookies for localhost
- Check Supabase Auth settings (make sure Google OAuth is enabled)

### "No stalls showing up"
- Make sure seed data was inserted (check Supabase Table Editor → stalls table)
- Refresh the page

### "Build errors or TypeScript errors"
- Run `npm install` again
- Delete `.next` folder and restart: `rm -rf .next && npm run dev`

## Next Steps

To continue development:

1. **Set up Razorpay** for payment testing
2. **Create a vendor account** manually in Supabase
3. **Build vendor dashboard** for order management
4. **Implement real-time notifications**
5. **Add order tracking screens**

See `/docs/implementation-plan.md` for the complete roadmap.

---

**Need help?** Check the README.md or review the PRD in `/docs/`

Happy coding! 🍽️
