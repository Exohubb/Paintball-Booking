'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { TimeSlot, Booking } from '@/types';

export default function SlotsPage() {
  const [club, setClub] = useState<'xploit' | 'ecell'>('xploit');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slotBookings, setSlotBookings] = useState<Booking[]>([]);
  const [booking, setBooking] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchSlots();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('time-slots-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'time_slots' },
        () => {
          fetchSlots();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          fetchSlots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSlots = async () => {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('start_time', { ascending: true });

    if (data) {
      setSlots(data);
    }
    setLoading(false);
  };

  const fetchSlotBookings = async (slotId: string) => {
    const { data } = await supabase
      .from('bookings')
      .select('*, users(*)')
      .eq('time_slot_id', slotId)
      .eq('club', club);

    if (data) {
      setSlotBookings(data);
    }
  };

  const handleSlotClick = async (slot: TimeSlot) => {
    setSelectedSlot(slot);
    await fetchSlotBookings(slot.id);
  };

  const handleBookSlot = async () => {
    if (!selectedSlot) return;

    const bookings = club === 'xploit' ? selectedSlot.xploit_bookings : selectedSlot.ecell_bookings;
    if (bookings >= 4) {
      alert('This slot is full!');
      return;
    }

    setBooking(true);
    try {
      const response = await fetch('/api/book-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeSlotId: selectedSlot.id,
          club: club,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Slot booked successfully! 🎉');
        setSelectedSlot(null);
        fetchSlots();
      } else {
        alert(data.error || 'Booking failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setBooking(false);
    }
  };

  const getSlotStatus = (slot: TimeSlot) => {
    const bookings = club === 'xploit' ? slot.xploit_bookings : slot.ecell_bookings;
    const available = 4 - bookings;
    
    if (available === 0) {
      return { color: 'border-red-500 bg-red-500/10', text: 'FULL', canBook: false };
    } else if (available === 1) {
      return { color: 'border-yellow-500 bg-yellow-500/10 hover:shadow-yellow-500/50', text: `${available}/4`, canBook: true };
    } else {
      return { color: 'border-green-500 bg-green-500/10 hover:shadow-neon-green', text: `${available}/4`, canBook: true };
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Choose Your Slot</h1>
          <p className="text-gray-400">Feb 20, 2026 • Each slot: 4 members per team</p>
        </motion.div>

        {/* Club Toggle */}
        <div className="glass-panel p-2 max-w-md mx-auto mb-8 flex">
          <motion.button
            onClick={() => setClub('xploit')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              club === 'xploit'
                ? 'bg-xploit-primary text-gray-950 shadow-neon-green'
                : 'text-gray-400'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            XPLOIT
          </motion.button>
          <motion.button
            onClick={() => setClub('ecell')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              club === 'ecell'
                ? 'bg-ecell-primary text-gray-950 shadow-neon-blue'
                : 'text-gray-400'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            ECELL
          </motion.button>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Almost Full</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Full (4/4)</span>
          </div>
        </div>

        {/* Slots Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="glass-panel h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {slots.map((slot, index) => {
              const status = getSlotStatus(slot);
              return (
                <motion.button
                  key={slot.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => handleSlotClick(slot)}
                  className={`glass-panel p-4 border-2 transition-all ${status.color}`}
                  whileHover={{ scale: status.canBook ? 1.05 : 1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-sm font-medium mb-2">{slot.slot_name}</div>
                  <div className={`text-xs font-bold ${status.canBook ? 'text-white' : 'text-red-400'}`}>
                    {status.text}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedSlot(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4">
                {selectedSlot.slot_name}
              </h2>
              
              <div className="space-y-3 mb-6">
                <div>
                  <div className="text-gray-400 text-sm">Status</div>
                  <div className="font-semibold">
                    {club === 'xploit' 
                      ? `${4 - selectedSlot.xploit_bookings}/4 spots available`
                      : `${4 - selectedSlot.ecell_bookings}/4 spots available`
                    }
                  </div>
                </div>

                {slotBookings.length > 0 && (
                  <div>
                    <div className="text-gray-400 text-sm mb-2">Booked Players:</div>
                    <div className="space-y-1">
                      {slotBookings.map((booking) => (
                        <div key={booking.id} className="text-sm bg-white/5 px-3 py-2 rounded">
                          {booking.users?.name} ({booking.users?.gender})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {getSlotStatus(selectedSlot).canBook && (
                  <motion.button
                    onClick={handleBookSlot}
                    disabled={booking}
                    className={club === 'xploit' ? 'btn-xploit flex-1' : 'btn-ecell flex-1'}
                    whileTap={{ scale: 0.95 }}
                  >
                    {booking ? 'Booking...' : 'Confirm Booking'}
                  </motion.button>
                )}
                <motion.button
                  onClick={() => setSelectedSlot(null)}
                  className="btn-primary bg-white/10 flex-1"
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
