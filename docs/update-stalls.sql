-- Update stalls with actual IITGN campus food spots
-- Run this in Supabase SQL Editor to replace the test data

-- First, clear existing stalls and menu items
DELETE FROM menu_items;
DELETE FROM stalls;

-- Insert actual IITGN stalls
INSERT INTO stalls (name, description, image_url, is_open, prep_time_mins) VALUES
('Dawat Foods', 'Delicious meals and snacks', null, true, 15),
('2 Degree Cafe', 'Coffee, beverages and quick bites', null, true, 10),
('Madurai Chaat & more', 'Authentic South Indian chaat and snacks', null, true, 12),
('Hunger Games', 'Variety of food options', null, true, 15),
('Go Insta Cafe', 'Instagram-worthy food and drinks', null, true, 10),
('RGouras Mess', 'Special biryani on Wednesday (Hyderabadi) and Sunday (Chicken)', null, true, 25);

-- You can add menu items for each stall later!
-- Example format:
-- INSERT INTO menu_items (stall_id, name, description, price, category, is_available) VALUES
-- ((SELECT id FROM stalls WHERE name = 'Dawat Foods' LIMIT 1), 'Item Name', 'Description', 100, 'Meals', true);

-- For RGouras Mess special biryani, you can add:
INSERT INTO menu_items (stall_id, name, description, price, category, is_available, is_special_biryani) VALUES
((SELECT id FROM stalls WHERE name = 'RGouras Mess' LIMIT 1), 'Hyderabadi Chicken Biryani', 'Available only on Wednesday', 120, 'Meals', true, true),
((SELECT id FROM stalls WHERE name = 'RGouras Mess' LIMIT 1), 'Chicken Biryani', 'Available only on Sunday', 100, 'Meals', true, true);

-- Success!
SELECT * FROM stalls ORDER BY name;
