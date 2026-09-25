import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { updateUser } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import { useVerifyEmailMutation, useResendVerificationMutation } from '../../services/authApi';
import { useNavigateView } from '../../hooks/useNavigateView';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';

const tokenSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

const resendSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

type TokenFormData = z.infer<typeof tokenSchema>;
type ResendFormData = z.infer<typeof resendSchema>;

export function VerifyEmailPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigateView();

  const [verifyEmailMutation, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendMutation, { isLoading: isResending }] = useResendVerificationMutation();

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [verifiedUser, setVerifiedUser] = useState<any>(null);

  const getTokenFromUrl = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('token') || '';
    }
    return '';
  };

  const {
    register: registerToken,
    handleSubmit: handleTokenSubmit,
    setValue: setTokenValue,
    formState: { errors: tokenErrors },
  } = useForm<TokenFormData>({
    resolver: zodResolver(tokenSchema),
    defaultValues: { token: getTokenFromUrl() },
  });

  const {
    register: registerResend,
    handleSubmit: handleResendSubmit,
    formState: { errors: resendErrors },
  } = useForm<ResendFormData>({
    resolver: zodResolver(resendSchema),
    defaultValues: { email: '' },
  });

  // Automatically execute verification if token is present in URL
  useEffect(() => {
    const token = getTokenFromUrl();
    if (token) {
      setTokenValue('token', token);
      executeVerification(token);
    }
  }, []);

  const executeVerification = async (token: string) => {
    setErrorMessage(null);
    try {
      const result = await verifyEmailMutation({ token }).unwrap();
      if (result.success) {
        setStatus('success');
        if (result.user) {
          setVerifiedUser(result.user);
          dispatch(updateUser({ isEmailVerified: true }));
        }
        dispatch(
          addToast({
            title: 'Email Verified',
            description: 'Your email address has been successfully confirmed.',
            type: 'success',
          })
        );
      } else {
        setStatus('error');
        setErrorMessage(result.message || 'Invalid or expired verification token');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(
        err?.data?.message || err?.error || 'Invalid or expired verification token. Please request a new link.'
      );
    }
  };

  const onManualVerify = (data: TokenFormData) => {
    executeVerification(data.token.trim());
  };

  const onResend = async (data: ResendFormData) => {
    setErrorMessage(null);
    setResendSuccess(null);
    try {
      const result = await resendMutation({ email: data.email }).unwrap();
      if (result.success) {
        setResendSuccess(
          result.testVerifyUrl
            ? `New link generated! You can test it directly with the button below.`
            : 'A fresh verification email has been dispatched.'
        );
        if (result.verificationToken) {
          setTokenValue('token', result.verificationToken);
        }
      } else {
        setErrorMessage(result.message || 'Unable to resend verification email.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.error || 'Unable to resend verification. Please verify the email address.'
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50/50 dark:bg-neutral-950 transition-colors">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-white font-mono text-xl font-bold shadow-md dark:bg-neutral-100 dark:text-neutral-950">
            AU
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Verify Email Address
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Confirm your identity to ensure seamless orders, invoices, and communication.
          </p>
        </div>

        <Card className="border-neutral-200/80 bg-white/95 backdrop-blur-md shadow-lg dark:border-neutral-800 dark:bg-neutral-900/90">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">Email Verification</CardTitle>
            <CardDescription>
              {status === 'success'
                ? 'Your email address is verified and active'
                : 'Confirm using the link sent to your inbox or enter token manually'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isVerifying ? (
              <div className="py-8 text-center space-y-3">
                <RefreshCw className="h-8 w-8 text-neutral-900 dark:text-neutral-100 animate-spin mx-auto" />
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Verifying your security credentials...
                </p>
              </div>
            ) : status === 'success' ? (
              <div className="text-center space-y-4 py-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Email Confirmed!
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {verifiedUser
                      ? `Thank you, ${verifiedUser.name}. Your account is authenticated.`
                      : 'Your email address has been verified. You can now access your full account privileges.'}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <Button
                    className="w-full text-xs font-semibold"
                    onClick={() => navigate('shop')}
                  >
                    Start Shopping <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => navigate('login')}
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 p-3 rounded-lg border border-red-200 bg-red-50/80 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                    <div className="flex-1 font-medium">{errorMessage}</div>
                  </div>
                )}

                {/* Manual Token Verification */}
                <form id="verify-token-form" onSubmit={handleTokenSubmit(onManualVerify)} className="space-y-3">
                  <Input
                    id="verify-token"
                    type="text"
                    label="Verification Code or Token"
                    placeholder="Paste token or enter verification code"
                    prefixIcon={<Mail className="h-4 w-4" />}
                    error={tokenErrors.token?.message}
                    {...registerToken('token')}
                  />

                  <Button
                    type="submit"
                    className="w-full font-semibold shadow-md"
                    size="md"
                    isLoading={isVerifying}
                  >
                    Verify Email
                  </Button>
                </form>

                {/* Resend Section */}
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Need a new verification link?
                    </span>
                  </div>

                  {resendSuccess && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/80 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="flex-1">{resendSuccess}</div>
                    </div>
                  )}

                  <form id="resend-form" onSubmit={handleResendSubmit(onResend)} className="space-y-3">
                    <Input
                      id="resend-email"
                      type="email"
                      placeholder="Enter registered email address"
                      prefixIcon={<Mail className="h-4 w-4" />}
                      error={resendErrors.email?.message}
                      {...registerResend('email')}
                    />

                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full text-xs"
                      size="sm"
                      isLoading={isResending}
                    >
                      <Send className="h-3.5 w-3.5 mr-1.5" /> Resend Link
                    </Button>
                  </form>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center border-t border-neutral-100 dark:border-neutral-800 py-4 bg-neutral-50/50 dark:bg-neutral-850/50 rounded-b-xl">
            <button
              type="button"
              onClick={() => navigate('login')}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white transition-colors"
            >
              Return to Sign In
            </button>
          </CardFooter>
        </Card>

        <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>AURA Trusted Customer Verification</span>
        </div>
      </div>
    </div>
  );
}
