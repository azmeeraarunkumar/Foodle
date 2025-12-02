-- Run this in Supabase SQL Editor AFTER signing up
-- This script promotes a user to 'vendor' role and links them to a stall

DO $$
DECLARE
  -- CHANGE THIS to the email you signed up with
  v_email TEXT := 'vendor@foodle.com';
  
  -- CHANGE THIS to the stall you want to manage
  v_stall_name TEXT := 'Dawat Foods';
  
  v_user_id UUID;
BEGIN
  -- Find the user
  SELECT id INTO v_user_id FROM users WHERE email = v_email;

  IF v_user_id IS NOT NULL THEN
    -- 1. Update role to vendor
    UPDATE users 
    SET role = 'vendor' 
    WHERE id = v_user_id;
    
    -- 2. Link to Stall
    UPDATE stalls 
    SET vendor_id = v_user_id 
    WHERE name = v_stall_name;
    
    RAISE NOTICE '✅ Success! User % is now the vendor for %', v_email, v_stall_name;
  ELSE
    RAISE EXCEPTION '❌ User % not found! Please sign up in the app first.', v_email;
  END IF;
END $$;
