import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { load } from '@cashfreepayments/cashfree-js';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jwtToken: string;
}

export default function SubscriptionModal({ isOpen, onClose, onSuccess, jwtToken }: SubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      // 1. Fetch Payment Session ID
      const res = await fetch(`${backendUrl}/api/v1/payments/create-subscription-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to initiate payment. Please try again.');
      }
      
      const data = await res.json();
      const paymentSessionId = data.payment_session_id;
      const orderId = data.order_id;

      // 2. Initialize Cashfree
      const cashfree = await load({ mode: 'sandbox' });
      
      // 3. Open Checkout
      cashfree.checkout({
        paymentSessionId: paymentSessionId,
        redirectTarget: '_modal'
      }).then(async (result: any) => {
        if (result.error) {
          setError(result.error.message || 'Payment failed');
          setLoading(false);
        } else if (result.paymentDetails) {
          // Verify with Backend
          const verifyRes = await fetch(`${backendUrl}/api/v1/payments/verify/${orderId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${jwtToken}` }
          });
          if (verifyRes.ok) {
            onSuccess();
          } else {
            setError('Payment verification failed.');
          }
        }
      });

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--color-charcoal)]/80 flex items-center justify-center z-50 p-4 font-inter">
      <div className="bg-white border-4 border-[var(--color-charcoal)] hard-shadow max-w-md w-full relative">
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-[var(--color-yellow)] border-2 border-[var(--color-charcoal)] p-1 hover:bg-black hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex justify-center mb-6 text-[var(--color-charcoal)]">
            <ShieldCheck size={48} />
          </div>
          
          <h2 className="text-2xl font-black uppercase tracking-widest text-center mb-2">Unlock Dispatches</h2>
          <p className="text-center font-bold text-gray-500 mb-6 uppercase text-xs tracking-widest">Enterprise Subscription</p>

          <div className="bg-gray-50 border-2 border-[var(--color-charcoal)] p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold">Monthly Pass</span>
              <span className="font-black text-xl">₹2000</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 size={16} className="text-green-600" /> Unlimited Hiring
              </li>
              <li className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 size={16} className="text-green-600" /> Premium Workers
              </li>
              <li className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 size={16} className="text-green-600" /> Instant Dispatches
              </li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 p-3 mb-6 text-xs font-bold flex items-center gap-2 uppercase">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-[var(--color-yellow)] border-2 border-[var(--color-charcoal)] text-[var(--color-charcoal)] font-black py-4 uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? 'Processing...' : 'Pay ₹2000 Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
