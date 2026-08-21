import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, CheckCircle2, XCircle, AlertCircle, Camera, RefreshCw, Sparkles, User, Calendar, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

export const AdminScannerPage: React.FC = () => {
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    status: string;
    message: string;
    booking?: any;
  } | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { error, success } = useToast();

  const handleVerifyToken = async (tokenString: string) => {
    if (!tokenString.trim()) return;
    setLoading(true);

    try {
      const result = await api.qr.verifyAndAttend(tokenString.trim());
      setScanResult(result);
      if (result.success) {
        success('Check-in Successful', result.message);
      } else {
        error('Verification Alert', result.message);
      }
    } catch (err: any) {
      setScanResult({
        success: false,
        status: 'ERROR',
        message: err.message || 'Verification failed.',
      });
      error('Verification Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!scannerActive || scanResult) return;

    const qrScanner = new Html5QrcodeScanner(
      'qr-reader-container',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    qrScanner.render(
      (decodedText) => {
        qrScanner.clear();
        handleVerifyToken(decodedText);
      },
      (errorMessage) => {
        // quiet error ignore during search
      }
    );

    scannerRef.current = qrScanner;

    return () => {
      try {
        qrScanner.clear();
      } catch {}
    };
  }, [scannerActive, scanResult]);

  const handleReset = () => {
    setScanResult(null);
    setManualToken('');
    setScannerActive(true);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-luxury-border pb-4 flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-ultra-wide text-luxury-gold font-semibold">
            Concierge Attendance Scanner
          </span>
          <h1 className="font-serif text-3xl font-normal text-luxury-white mt-1">
            Client QR Code Verification
          </h1>
        </div>
        <Button variant="outline-gold" size="sm" onClick={handleReset} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Reset Scanner
        </Button>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Camera Scanner Container */}
        <div className="lg:col-span-7 bg-luxury-card border border-luxury-border p-6 space-y-6 shadow-2xl">
          <div className="flex items-center space-x-2 text-luxury-gold border-b border-luxury-border/60 pb-3">
            <Camera className="w-4 h-4" />
            <h3 className="text-xs uppercase tracking-widest font-semibold">
              Live Camera Scanner
            </h3>
          </div>

          {!scanResult ? (
            <div className="space-y-4">
              <div
                id="qr-reader-container"
                className="w-full bg-luxury-offblack border border-luxury-border/80 overflow-hidden text-luxury-white"
              />
              <p className="text-[11px] text-center text-luxury-muted">
                Align the client's booking QR code within the target frame.
              </p>
            </div>
          ) : (
            <div className="p-8 text-center space-y-4 bg-luxury-offblack border border-luxury-border">
              {scanResult.success ? (
                <div className="space-y-3 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-2xl text-emerald-300">
                    Attendance Verified
                  </h4>
                  <p className="text-xs text-luxury-muted max-w-sm mx-auto">
                    {scanResult.message}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/60 flex items-center justify-center mx-auto text-red-400">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-2xl text-red-300">
                    {scanResult.status === 'ALREADY_USED' ? 'QR Pass Already Used' : 'Invalid QR Pass'}
                  </h4>
                  <p className="text-xs text-red-300/80 max-w-sm mx-auto">
                    {scanResult.message}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <Button variant="gold" size="md" onClick={handleReset} className="w-full">
                  Scan Next Guest
                </Button>
              </div>
            </div>
          )}

          {/* Manual Token Entry Fallback */}
          <div className="pt-4 border-t border-luxury-border/60 space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-luxury-muted font-medium block">
              Manual Token / Reference Entry
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter UUID token or AGM-BK reference..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="flex-1 bg-luxury-offblack text-luxury-white placeholder-luxury-darkmuted border border-luxury-border px-3 py-2 text-xs outline-none focus:border-luxury-gold"
              />
              <Button
                variant="outline-gold"
                size="sm"
                isLoading={loading}
                onClick={() => handleVerifyToken(manualToken)}
              >
                Verify
              </Button>
            </div>
          </div>
        </div>

        {/* Verification Result Card */}
        <div className="lg:col-span-5 bg-luxury-card border border-luxury-gold/40 p-6 space-y-6 shadow-2xl">
          <h3 className="text-xs uppercase tracking-widest font-semibold text-luxury-gold border-b border-luxury-border/60 pb-3">
            Client Dossier Verification
          </h3>

          {scanResult?.booking ? (
            <div className="space-y-4 text-xs animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-luxury-muted">Guest Name</span>
                <p className="font-serif text-xl font-semibold text-luxury-white">
                  {scanResult.booking.guest_name}
                </p>
                <p className="text-[11px] text-luxury-muted">{scanResult.booking.guest_phone}</p>
              </div>

              <div className="p-3.5 bg-luxury-offblack border border-luxury-border/60 space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-medium block">
                  Treatment Details
                </span>
                <p className="font-semibold text-luxury-white text-sm">
                  {scanResult.booking.service}
                </p>
                <p className="text-luxury-muted">
                  {scanResult.booking.booking_date} at {scanResult.booking.start_time}
                </p>
                <p className="text-luxury-gold font-medium">
                  {scanResult.booking.total_amount} &bull; {scanResult.booking.payment_status}
                </p>
              </div>

              <div className="space-y-1 text-luxury-muted">
                <p>Reference: <strong className="font-mono text-luxury-white">{scanResult.booking.reference}</strong></p>
                {scanResult.booking.attended_at && (
                  <p>Checked In: <strong className="text-emerald-400">{scanResult.booking.attended_at}</strong></p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-luxury-muted space-y-2">
              <QrCode className="w-12 h-12 text-luxury-darkmuted mx-auto stroke-1" />
              <p className="text-xs">Scan or input a QR code to view live client verification telemetry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
