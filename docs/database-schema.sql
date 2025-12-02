-- Foodle Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('student', 'vendor')) NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- STALLS TABLE
-- ============================================
CREATE TABLE stalls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  vendor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Operating status
  is_open BOOLEAN DEFAULT true,
  is_snoozed BOOLEAN DEFAULT false,
  snooze_message TEXT,
  
  -- Timing
  opening_time TIME,
  closing_time TIME,
  prep_time_mins INTEGER DEFAULT 15,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stalls_vendor ON stalls(vendor_id);
CREATE INDEX idx_stalls_open ON stalls(is_open, is_snoozed);

-- ============================================
-- MENU ITEMS TABLE
-- ============================================
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stall_id UUID REFERENCES stalls(id) ON DELETE CASCADE,
  
  -- Item details
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  image_url TEXT,
  category TEXT CHECK (category IN ('Snacks', 'Drinks', 'Meals', 'Desserts', 'Other')),
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  is_special_biryani BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_stall ON menu_items(stall_id);
CREATE INDEX idx_menu_available ON menu_items(is_available);
CREATE INDEX idx_menu_category ON menu_items(category);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stall_id UUID REFERENCES stalls(id) ON DELETE SET NULL,
  
  -- Order details
  items JSONB NOT NULL,
  special_instructions TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Status tracking
  status TEXT CHECK (status IN ('received', 'preparing', 'ready', 'completed', 'cancelled')) DEFAULT 'received',
  otp_code CHAR(4) NOT NULL,
  
  -- Payment
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_stall ON orders(stall_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_otp ON orders(otp_code);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER stalls_updated_at
  BEFORE UPDATE ON stalls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-update order timestamps based on status
CREATE OR REPLACE FUNCTION update_order_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'preparing' AND OLD.status != 'preparing' THEN
    NEW.accepted_at = NOW();
  END IF;
  
  IF NEW.status = 'ready' AND OLD.status != 'ready' THEN
    NEW.ready_at = NOW();
  END IF;
  
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_status_timestamps
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_timestamps();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anyone can insert their user record"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Stalls policies (Public read)
CREATE POLICY "Anyone can view stalls"
  ON stalls FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Vendors can update their own stall"
  ON stalls FOR UPDATE
  TO authenticated
  USING (vendor_id = auth.uid());

-- Menu items policies
CREATE POLICY "Anyone can view menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Vendors can manage their menu items"
  ON menu_items FOR ALL
  TO authenticated
  USING (stall_id IN (
    SELECT id FROM stalls WHERE vendor_id = auth.uid()
  ));

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    stall_id IN (SELECT id FROM stalls WHERE vendor_id = auth.uid())
  );

CREATE POLICY "Students can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Vendors can update orders for their stall"
  ON orders FOR UPDATE
  TO authenticated
  USING (stall_id IN (
    SELECT id FROM stalls WHERE vendor_id = auth.uid()
  ));

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE stalls;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Insert test stalls
INSERT INTO stalls (name, description, image_url, is_open, prep_time_mins) VALUES
('Night Canteen', 'Late night snacks and Maggi', null, true, 10),
('Tea Post', 'Fresh chai and samosas', null, true, 5),
('Amul Parlour', 'Ice creams and shakes', null, true, 8),
('Juice Center', 'Fresh fruit juices', null, true, 7),
('South Indian', 'Dosa, idli, vada', null, true, 15),
('Mess Hall', 'Daily thali and special items', null, true, 20);

-- Insert sample menu items for Night Canteen
INSERT INTO menu_items (stall_id, name, description, price, category, is_available) VALUES
((SELECT id FROM stalls WHERE name = 'Night Canteen' LIMIT 1), 'Maggi', 'Classic masala maggi', 40, 'Snacks', true),
((SELECT id FROM stalls WHERE name = 'Night Canteen' LIMIT 1), 'Cheese Maggi', 'Extra cheesy goodness', 60, 'Snacks', true),
((SELECT id FROM stalls WHERE name = 'Night Canteen' LIMIT 1), 'Veg Sandwich', 'Grilled veg sandwich', 50, 'Snacks', true),
((SELECT id FROM stalls WHERE name = 'Night Canteen' LIMIT 1), 'Cold Coffee', 'Chilled cold coffee', 70, 'Drinks', true);

-- Insert sample menu items for Tea Post
INSERT INTO menu_items (stall_id, name, description, price, category, is_available) VALUES
((SELECT id FROM stalls WHERE name = 'Tea Post' LIMIT 1), 'Chai', 'Hot masala chai', 20, 'Drinks', true),
((SELECT id FROM stalls WHERE name = 'Tea Post' LIMIT 1), 'Samosa', 'Crispy potato samosa', 15, 'Snacks', true),
((SELECT id FROM stalls WHERE name = 'Tea Post' LIMIT 1), 'Pakora', 'Mixed veg pakora', 25, 'Snacks', true),
((SELECT id FROM stalls WHERE name = 'Tea Post' LIMIT 1), 'Bread Pakora', 'Stuffed bread pakora', 30, 'Snacks', true);

-- Insert sample menu items for Amul Parlour
INSERT INTO menu_items (stall_id, name, description, price, category, is_available) VALUES
((SELECT id FROM stalls WHERE name = 'Amul Parlour' LIMIT 1), 'Vanilla Ice Cream', 'Classic vanilla scoop', 40, 'Desserts', true),
((SELECT id FROM stalls WHERE name = 'Amul Parlour' LIMIT 1), 'Chocolate Shake', 'Thick chocolate milkshake', 80, 'Drinks', true),
((SELECT id FROM stalls WHERE name = 'Amul Parlour' LIMIT 1), 'Sundae', 'Ice cream sundae with toppings', 120, 'Desserts', true);

-- ============================================
-- COMPLETE!
-- ============================================
-- Your database is now ready for Foodle!
-- Next steps:
-- 1. Configure Google OAuth in Supabase Dashboard
-- 2. Create a vendor user manually:
--    INSERT INTO users (id, email, name, role) VALUES 
--    ('your-auth-uid', 'vendor@foodle.app', 'Test Vendor', 'vendor');
-- 3. Update stalls.vendor_id to link vendor to stall
