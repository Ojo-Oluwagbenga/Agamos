import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AgamosLogo } from '../../components/brand/AgamosLogo';
import { useToast } from '../../context/ToastContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setSubmitted(true);
      success('Instructions Sent', 'Please check your email inbox.');
    } catch (err: any) {
      error('Request Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black text-luxury-white flex flex-col justify-center items-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <AgamosLogo variant="stacked" />
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-luxury-white mt-4">
            Reset Password
          </h2>
          <p className="text-xs text-luxury-muted">
            Enter your registered email address to receive secure reset instructions.
          </p>
        </div>

        <div className="bg-luxury-card border border-luxury-border p-8 space-y-6 shadow-2xl">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <Mail className="w-10 h-10 text-luxury-gold mx-auto" />
              <h4 className="font-serif text-lg text-luxury-white">Check Your Inbox</h4>
              <p className="text-xs text-luxury-muted leading-relaxed">
                If an account exists for <span className="text-luxury-white font-medium">{email}</span>, you will receive a password reset link.
              </p>
              <Link to="/login" className="block pt-2">
                <Button variant="outline-gold" size="sm" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                placeholder="victoria@agamos.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                variant="gold"
                size="md"
                className="w-full"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="pt-2 text-center">
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 text-xs text-luxury-muted hover:text-luxury-gold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
