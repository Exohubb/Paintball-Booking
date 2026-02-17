-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own data"
    ON users FOR INSERT
    WITH CHECK (true);

-- Slots policies
CREATE POLICY "Anyone can view slots"
    ON slots FOR SELECT
    USING (true);

CREATE POLICY "Only authenticated users can update slots"
    ON slots FOR UPDATE
    USING (true);

-- Bookings policies
CREATE POLICY "Anyone can view bookings"
    ON bookings FOR SELECT
    USING (true);

CREATE POLICY "Users can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE slots;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
