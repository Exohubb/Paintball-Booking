-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    scholar_number VARCHAR(50) UNIQUE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Slots table
CREATE TABLE slots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    slot_name VARCHAR(50) NOT NULL,
    club VARCHAR(10) NOT NULL CHECK (club IN ('xploit', 'ecell')),
    is_booked BOOLEAN DEFAULT FALSE,
    booked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    booked_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(start_time, club)
);

-- Bookings table
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    slot_id UUID REFERENCES slots(id) ON DELETE CASCADE NOT NULL,
    club VARCHAR(10) NOT NULL CHECK (club IN ('xploit', 'ecell')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id),
    UNIQUE(slot_id)
);

-- OTP verification table (optional, for tracking)
CREATE TABLE otp_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone VARCHAR(15) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    attempts INT DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_slots_club_booked ON slots(club, is_booked);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_scholar ON users(scholar_number);

-- Function to book slot atomically
CREATE OR REPLACE FUNCTION book_slot(
    p_user_id UUID,
    p_slot_id UUID,
    p_club VARCHAR(10)
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_slot_booked BOOLEAN;
    v_user_has_booking BOOLEAN;
    v_result JSON;
BEGIN
    -- Check if slot is already booked
    SELECT is_booked INTO v_slot_booked
    FROM slots
    WHERE id = p_slot_id AND club = p_club
    FOR UPDATE;

    IF v_slot_booked THEN
        RETURN json_build_object('success', FALSE, 'error', 'Slot already booked');
    END IF;

    -- Check if user already has a booking
    SELECT EXISTS(
        SELECT 1 FROM bookings WHERE user_id = p_user_id
    ) INTO v_user_has_booking;

    IF v_user_has_booking THEN
        RETURN json_build_object('success', FALSE, 'error', 'You already have a booking');
    END IF;

    -- Update slot
    UPDATE slots
    SET is_booked = TRUE,
        booked_by = p_user_id,
        booked_at = NOW()
    WHERE id = p_slot_id;

    -- Insert booking
    INSERT INTO bookings (user_id, slot_id, club)
    VALUES (p_user_id, p_slot_id, p_club);

    RETURN json_build_object('success', TRUE, 'message', 'Slot booked successfully');
END;
$$;
