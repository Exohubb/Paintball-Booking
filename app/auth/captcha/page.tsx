'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';

export default function CaptchaPage() {
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCaptchaChange = (token: string | null) => {
    if (token) {
      setVerified(true);
    }
  };

  const handleContinue = () => {
    if (verified) {
      setLoading(true);
      router.push('/auth/otp');
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
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-xploit-primary to-ecell-primary bg-clip-text text-transparent">
            Security Check
          </h1>
          <p className="text-gray-400">Verify you're human to continue</p>
        </div>

        <div className="flex justify-center mb-6">
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
            onChange={handleCaptchaChange}
            theme="dark"
          />
        </div>

        <motion.button
          onClick={handleContinue}
          disabled={!verified || loading}
          className="btn-xploit w-full"
          whileTap={{ scale: 0.95 }}
        >
          {loading ? 'Loading...' : 'Continue'}
        </motion.button>
      </motion.div>
    </div>
  );
}
