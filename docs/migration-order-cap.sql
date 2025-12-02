-- Add order_cap column to stalls table
-- Run this in Supabase SQL Editor

ALTER TABLE stalls 
ADD COLUMN order_cap INTEGER DEFAULT 20;

-- Function to check order cap and auto-snooze
CREATE OR REPLACE FUNCTION check_order_cap()
RETURNS TRIGGER AS $$
DECLARE
  v_active_orders INTEGER;
  v_order_cap INTEGER;
  v_stall_id UUID;
BEGIN
  -- Get stall id from the new order
  v_stall_id := NEW.stall_id;
  
  -- Get current active orders (received or preparing)
  SELECT COUNT(*) INTO v_active_orders
  FROM orders
  WHERE stall_id = v_stall_id
  AND status IN ('received', 'preparing');
  
  -- Get stall's order cap
  SELECT order_cap INTO v_order_cap
  FROM stalls
  WHERE id = v_stall_id;
  
  -- If active orders exceed cap, snooze the stall
  IF v_active_orders >= v_order_cap THEN
    UPDATE stalls
    SET is_snoozed = true,
        snooze_message = 'Too many orders! We are temporarily paused.'
    WHERE id = v_stall_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run on new order creation
DROP TRIGGER IF EXISTS check_order_cap_trigger ON orders;
CREATE TRIGGER check_order_cap_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION check_order_cap();
