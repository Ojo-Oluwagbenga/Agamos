import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, CheckCircle2, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { formatNGN } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';

export const MockPaystackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ref = searchParams.get('ref') || 'AGM-TEST-REF';
  const amount = searchParams.get('amount') || '45000';

  const [loading, setLoading] = useState(false);
  const [simulatedStatus, setSimulatedStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');

  const handleSimulateSuccess = async () => {
    setLoading(true);
    try {
      const verifyRes = await api.payments.verify(ref);
      setSimulatedStatus('SUCCESS');

      setTimeout(() => {
        if (verifyRes.payment_type === 'BOOKING' && verifyRes.booking_reference) {
          navigate(`/booking/${verifyRes.booking_reference}`);
        } else if (verifyRes.payment_type === 'ORDER' && verifyRes.order_reference) {
          navigate(`/order/${verifyRes.order_reference}`);
        } else {
          navigate('/');
        }
      }, 1200);
    } catch (err) {
      console.error(err);
      // Fallback redirect
      if (ref.includes('BK')) {
        navigate(`/booking/${ref.replace('AGM-PAY', 'AGM-BK')}`);
      } else {
        navigate(`/order/${ref.replace('AGM-PAY', 'AGM-ORD')}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-8 space-y-6 shadow-2xl">
        {/* Paystack Header Simulation */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-teal-500 flex items-center justify-center font-bold text-white text-xs">
              P
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">paystack checkout</h3>
              <p className="text-[10px] text-slate-400">Test Simulator Environment</p>
            </div>
          </div>
          <span className="text-xs font-mono bg-slate-700 px-2 py-1 rounded text-teal-400">TEST MODE</span>
        </div>

        {/* Transaction Summary */}
        <div className="bg-slate-900/80 rounded-lg p-4 space-y-2 border border-slate-700/60">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Merchant:</span>
            <span className="text-white font-medium">AGAMOS Luxury House</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Reference:</span>
            <span className="font-mono text-slate-300">{ref}</span>
          </div>
          <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
            <span className="text-xs text-slate-300">Amount:</span>
            <span className="text-lg font-bold text-teal-400">{formatNGN(amount)}</span>
          </div>
        </div>

        {/* Simulation Actions */}
        {simulatedStatus === 'SUCCESS' ? (
          <div className="text-center py-6 space-y-3 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-teal-400 mx-auto" />
            <h4 className="font-semibold text-white">Payment Verified</h4>
            <p className="text-xs text-slate-400">Redirecting to confirmed AGAMOS dossier...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleSimulateSuccess}
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Server-side...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Simulate Successful Payment</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate(-1)}
              disabled={loading}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2.5 px-4 rounded-lg text-xs transition-colors"
            >
              Cancel Transaction
            </button>
          </div>
        )}

        <div className="pt-2 flex items-center justify-center space-x-2 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
          <span>Secured by Paystack Standard Checkout</span>
        </div>
      </div>
    </div>
  );
};
