export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  slot_name: string;
  xploit_bookings: number;
  ecell_bookings: number;
  created_at: string;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  scholar_number: string;
  gender: 'male' | 'female';
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  time_slot_id: string;
  club: 'xploit' | 'ecell';
  created_at: string;
  users?: User;
}
