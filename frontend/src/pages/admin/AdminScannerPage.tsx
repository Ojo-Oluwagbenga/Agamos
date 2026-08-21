import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Camera,
  RefreshCw,
  Sparkles,
  Upload,
  CameraOff,
  SwitchCamera,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
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
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { error, success } = useToast();

  const READER_ELEMENT_ID = 'agamos-live-qr-reader';

  // Handle Token Verification
  const handleVerifyToken = async (tokenString: string) => {
    if (!tokenString.trim()) return;
    setLoading(true);

    try {
      // Clean prefix if QR data is encoded as URL or format AGAMOS:VERIFY:token
      let cleanToken = tokenString.trim();
      if (cleanToken.includes('AGAMOS:VERIFY:')) {
        cleanToken = cleanToken.split('AGAMOS:VERIFY:')[1];
      } else if (cleanToken.includes('token=')) {
        cleanToken = new URLSearchParams(cleanToken.split('?')[1]).get('token') || cleanToken;
      }

      const result = await api.qr.verifyAndAttend(cleanToken);
      setScanResult(result);

      if (result.success) {
        success('Check-in Successful', result.message);
        stopCamera();
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

  // Start Camera
  const startCamera = async (cameraId?: string) => {
    setCameraError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(READER_ELEMENT_ID);
      }

      // Check if already scanning
      if (html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }

      const config = {
        fps: 15,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0,
      };

      const cameraSource = cameraId ? { deviceId: { exact: cameraId } } : { facingMode: 'environment' };

      await html5QrCodeRef.current.start(
        cameraSource,
        config,
        (decodedText) => {
          handleVerifyToken(decodedText);
        },
        () => {
          // Frame scan error / search frame ignored
        }
      );

      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera start failure:', err);
      setCameraActive(false);
      setCameraError(
        err.name === 'NotAllowedError' || err.message?.includes('Permission')
          ? 'Camera permission was denied. Please allow camera access in your browser settings.'
          : err.message || 'Unable to access camera device.'
      );
    }
  };

  // Stop Camera
  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
    } catch (err) {
      console.warn('Error stopping camera:', err);
    } finally {
      setCameraActive(false);
    }
  };

  // Enumerate cameras on load and initialize
  useEffect(() => {
    let mounted = true;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (mounted && devices && devices.length > 0) {
          setCameraDevices(devices);
          const defaultDev = devices[0].id;
          setSelectedCameraId(defaultDev);
          // Auto-start camera
          startCamera(defaultDev);
        } else if (mounted) {
          startCamera();
        }
      })
      .catch((err) => {
        console.warn('Error querying camera devices:', err);
        if (mounted) {
          startCamera();
        }
      });

    return () => {
      mounted = false;
      stopCamera();
    };
  }, []);

  // Handle Image File Upload Decode
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setCameraError(null);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(READER_ELEMENT_ID);
      }
      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      handleVerifyToken(decodedText);
    } catch (err: any) {
      error('Scan Failed', 'Could not detect a valid QR code in the uploaded image.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setManualToken('');
    setCameraError(null);
    startCamera(selectedCameraId);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-luxury-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-ultra-wide text-luxury-gold font-semibold flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Concierge Attendance Scanner</span>
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-luxury-white mt-1">
            Client QR Attendance Verification
          </h1>
        </div>
        <Button
          variant="outline-gold"
          size="sm"
          onClick={handleReset}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Reset & Scan Next
        </Button>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Camera Scanner Container */}
        <div className="lg:col-span-7 bg-luxury-card border border-luxury-border p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-luxury-border/60 pb-3">
            <div className="flex items-center space-x-2 text-luxury-gold">
              <Camera className="w-4 h-4" />
              <h3 className="text-xs uppercase tracking-widest font-semibold">
                Live Optical Scanner
              </h3>
            </div>

            {/* Camera controls */}
            <div className="flex items-center space-x-2">
              {cameraDevices.length > 1 && (
                <select
                  value={selectedCameraId}
                  onChange={(e) => {
                    setSelectedCameraId(e.target.value);
                    startCamera(e.target.value);
                  }}
                  className="bg-luxury-offblack text-luxury-white text-[11px] border border-luxury-border px-2 py-1 outline-none focus:border-luxury-gold"
                >
                  {cameraDevices.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.label || `Camera ${dev.id.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={() => (cameraActive ? stopCamera() : startCamera(selectedCameraId))}
                className="p-1.5 border border-luxury-border bg-luxury-offblack hover:border-luxury-gold text-luxury-muted hover:text-luxury-gold transition-colors text-xs flex items-center space-x-1"
                title={cameraActive ? 'Pause Camera' : 'Start Camera'}
              >
                {cameraActive ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {!scanResult ? (
            <div className="space-y-4">
              {/* Live Video Frame Container */}
              <div className="relative w-full aspect-square max-h-[380px] bg-luxury-offblack border border-luxury-border overflow-hidden flex items-center justify-center">
                <div id={READER_ELEMENT_ID} className="w-full h-full" />

                {!cameraActive && (
                  <div className="absolute inset-0 bg-luxury-black/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
                    {cameraError ? (
                      <>
                        <AlertTriangle className="w-10 h-10 text-amber-400 stroke-1" />
                        <p className="text-xs text-amber-200/90 max-w-xs">{cameraError}</p>
                        <Button
                          variant="outline-gold"
                          size="sm"
                          onClick={() => startCamera(selectedCameraId)}
                          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                        >
                          Retry Camera
                        </Button>
                      </>
                    ) : (
                      <>
                        <Camera className="w-10 h-10 text-luxury-muted stroke-1" />
                        <p className="text-xs text-luxury-muted">Camera stream is paused</p>
                        <Button
                          variant="gold"
                          size="sm"
                          onClick={() => startCamera(selectedCameraId)}
                          leftIcon={<Camera className="w-3.5 h-3.5" />}
                        >
                          Enable Live Camera
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Upload QR File Alternative */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-luxury-muted text-[11px]">
                  Align QR code inside viewfinder frame
                </span>

                <label className="cursor-pointer text-luxury-gold hover:underline flex items-center space-x-1 font-medium text-[11px]">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Scan QR Image File</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            /* Result Panel */
            <div className="p-8 text-center space-y-4 bg-luxury-offblack border border-luxury-border animate-fade-in">
              {scanResult.success ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-2xl text-emerald-300">
                    Attendance Verified & Recorded
                  </h4>
                  <p className="text-xs text-luxury-muted max-w-sm mx-auto leading-relaxed">
                    {scanResult.message}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/60 flex items-center justify-center mx-auto text-red-400 shadow-lg">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-2xl text-red-300">
                    {scanResult.status === 'ALREADY_USED' ? 'QR Pass Already Used' : 'Invalid Verification Token'}
                  </h4>
                  <p className="text-xs text-red-300/80 max-w-sm mx-auto leading-relaxed">
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

          {/* Manual Token Entry */}
          <div className="pt-4 border-t border-luxury-border/60 space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-luxury-muted font-medium block">
              Manual Reference / Token Lookup
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter AGM-BK reference or UUID token..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyToken(manualToken)}
                className="flex-1 bg-luxury-offblack text-luxury-white placeholder-luxury-darkmuted border border-luxury-border px-3 py-2 text-xs outline-none focus:border-luxury-gold font-mono"
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

        {/* Verification Dossier Card */}
        <div className="lg:col-span-5 bg-luxury-card border border-luxury-gold/40 p-6 space-y-6 shadow-2xl">
          <h3 className="text-xs uppercase tracking-widest font-semibold text-luxury-gold border-b border-luxury-border/60 pb-3">
            Live Client Dossier Telemetry
          </h3>

          {scanResult?.booking ? (
            <div className="space-y-4 text-xs animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-luxury-muted">Guest Name</span>
                <p className="font-serif text-xl font-semibold text-luxury-white">
                  {scanResult.booking.guest_name}
                </p>
                <p className="text-[11px] text-luxury-muted">{scanResult.booking.guest_phone}</p>
                <p className="text-[11px] text-luxury-muted">{scanResult.booking.guest_email}</p>
              </div>

              <div className="p-3.5 bg-luxury-offblack border border-luxury-border/60 space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-medium block">
                  Bespoke Treatment
                </span>
                <p className="font-semibold text-luxury-white text-sm">
                  {scanResult.booking.service || scanResult.booking.service_name}
                </p>
                <p className="text-luxury-muted">
                  {scanResult.booking.booking_date} &bull; {scanResult.booking.start_time}
                </p>
                <p className="text-luxury-gold font-medium">
                  {scanResult.booking.total_amount} &bull; Status: {scanResult.booking.status || 'ATTENDED'}
                </p>
              </div>

              <div className="space-y-1 text-luxury-muted text-[11px]">
                <p>
                  Dossier Ref:{' '}
                  <strong className="font-mono text-luxury-white">
                    {scanResult.booking.booking_reference || scanResult.booking.reference}
                  </strong>
                </p>
                {scanResult.booking.attended_at && (
                  <p>
                    Check-in Recorded:{' '}
                    <strong className="text-emerald-400 font-mono">
                      {new Date(scanResult.booking.attended_at).toLocaleString()}
                    </strong>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-luxury-muted space-y-3">
              <QrCode className="w-12 h-12 text-luxury-darkmuted mx-auto stroke-1" />
              <p className="text-xs">
                Scan or enter a client QR pass to view real-time attendance verification dossier.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
