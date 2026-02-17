import { format, addMinutes } from 'date-fns';

export function generateSlots() {
  const slots = [];
  const startDate = new Date('2026-02-20T10:00:00');
  const totalSlots = 80; // 80 teams per club
  
  for (let i = 0; i < totalSlots; i++) {
    const startTime = addMinutes(startDate, i * 10);
    const endTime = addMinutes(startTime, 10);
    
    const slotName = `${format(startTime, 'hh:mm a')} - ${format(endTime, 'hh:mm a')}`;
    
    // Create slots for both clubs
    slots.push({
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      slot_name: slotName,
      club: 'xploit',
      is_booked: false,
    });
    
    slots.push({
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      slot_name: slotName,
      club: 'ecell',
      is_booked: false,
    });
  }
  
  return slots;
}

export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
