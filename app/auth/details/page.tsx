'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Helper to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function DetailsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    scholarNumber: '',
    gender: 'male' as 'male' | 'female',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill name if available
  useEffect(() => {
    const tempName = getCookie('temp_name');
    if (tempName) {
      setFormData(prev => ({ ...prev, name: tempName }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get phone from cookie
      const phone = getCookie('temp_phone');

      if (!phone) {
        setError('Session expired. Please verify your phone again.');
        setLoading(false);
        // Don't auto-redirect, let user see the error
        return;
      }

      const supabase = createClient();

      // Insert user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          phone: phone,
          name: formData.name,
          scholar_number: formData.scholarNumber,
          gender: formData.gender,
        })
        .select()
        .single();

      if (userError) {
        if (userError.code === '23505') {
          setError('Scholar number or phone already registered');
        } else {
          console.error('DB Error:', userError);
          setError('Registration failed. Please try again.');
        }
        setLoading(false);
        return;
      }

      // ✅ Success - Redirect to slots
      router.push('/slots');
    } catch (err) {
      console.error('Submit error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-gray-400">Just a few more details</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="John Doe"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Scholar Number
            </label>
            <input
              type="text"
              required
              value={formData.scholarNumber}
              onChange={(e) => setFormData({...formData, scholarNumber: e.target.value})}
              placeholder="SCH123456"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Gender
            </label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                onClick={() => setFormData({...formData, gender: 'male'})}
                className={`p-3 rounded-xl border-2 transition-all ${
                  formData.gender === 'male'
                    ? 'border-xploit-primary bg-xploit-glow'
                    : 'border-white/10 bg-white/5'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                Male
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setFormData({...formData, gender: 'female'})}
                className={`p-3 rounded-xl border-2 transition-all ${
                  formData.gender === 'female'
                    ? 'border-neon-purple bg-neon-purple/20'
                    : 'border-white/10 bg-white/5'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                Female
              </motion.button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="btn-xploit w-full"
            whileTap={{ scale: 0.95 }}
          >
            {loading ? 'Saving...' : 'Continue to Slots'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
