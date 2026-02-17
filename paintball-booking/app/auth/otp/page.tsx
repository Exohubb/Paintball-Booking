'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

declare global {
  interface Window {
    phoneEmailListener: (userObj: { user_json_url: string }) => void;
  }
}

export default function OTPPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Define the phone email listener function
    window.phoneEmailListener = async (userObj: { user_json_url: string }) => {
      setLoading(true);
      setError('');

      try {
        // Send user_json_url to backend for verification
        const response = await fetch('/api/verify-phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_json_url: userObj.user_json_url }),
        });

        const data = await response.json();

        if (response.ok) {
          // Redirect to details page
          router.push('/auth/details');
        } else {
          setError(data.error || 'Phone verification failed');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return () => {
      // Cleanup
      delete window.phoneEmailListener;
    };
  }, [router]);

  return (
    <>
      {/* Load Phone.Email Script */}
      <Script
        src="https://www.phone.email/sign_in_button_v1.js"
        strategy="afterInteractive"
      />

      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 max-w-md w-full"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-xploit-primary to-ecell-primary bg-clip-text text-transparent">
              Phone Verification
            </h1>
            <p className="text-gray-400">Sign in with your phone number</p>
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

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-xploit-primary/10 border border-xploit-primary/50 text-xploit-primary p-3 rounded-lg mb-4 text-sm text-center"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-xploit-primary border-t-transparent rounded-full animate-spin"></div>
                Verifying your phone number...
              </div>
            </motion.div>
          )}

          {/* Phone.Email Sign In Button */}
          <div className="flex justify-center">
            <div
              className="pe_signin_button"
              data-client-id="17336866894103934160"
            ></div>
          </div>

          {/* Info text */}
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>You'll receive an OTP to verify your number</p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
