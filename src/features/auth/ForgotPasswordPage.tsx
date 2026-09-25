import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import { useForgotPasswordMutation } from '../../services/authApi';
import { useNavigateView } from '../../hooks/useNavigateView';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const navigate = useNavigateView();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    email: string;
    resetToken?: string;
    testResetUrl?: string;
  } | null>(null);

  const [forgotPasswordMutation, { isLoading }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: 'alex.rivera@aura-studio.com',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setErrorMessage(null);
    try {
      const response = await forgotPasswordMutation({ email: data.email }).unwrap();
      if (response.success) {
        setSuccessInfo({
          email: data.email,
          resetToken: response.resetToken,
          testResetUrl: response.testResetUrl,
        });
      } else {
        setErrorMessage(response.message || 'Unable to process reset request.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.error || 'Unable to process reset request. Please try again.'
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
            Forgot Password?
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No worries! Enter your email and we'll send you recovery instructions.
          </p>
        </div>

        <Card className="border-neutral-200/80 bg-white/95 backdrop-blur-md shadow-lg dark:border-neutral-800 dark:bg-neutral-900/90">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">Password Recovery</CardTitle>
            <CardDescription>
              We'll send a secure password reset link to your registered email
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {successInfo ? (
              <div className="text-center space-y-4 py-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                    Reset Email Dispatched
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    If an account is associated with{' '}
                    <strong className="text-neutral-800 dark:text-neutral-200">{successInfo.email}</strong>, you
                    will receive an email shortly with reset instructions.
                  </p>
                </div>

                {/* Test Mode / Fast Track shortcut */}
                {successInfo.resetToken && (
                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/40 text-left space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      Development Test Token
                    </span>
                    <p className="text-xs text-amber-700 dark:text-amber-200">
                      You can proceed directly to password reset without checking an inbox:
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        navigate('reset-password', `token=${successInfo.resetToken}`)
                      }
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs font-semibold shadow-xs transition-colors"
                    >
                      <KeyRound className="h-3.5 w-3.5" /> Continue to Reset Page <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => setSuccessInfo(null)}
                  >
                    Try another email
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

                <form id="forgot-password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    id="forgot-email"
                    type="email"
                    label="Registered Email Address"
                    placeholder="name@example.com"
                    autoComplete="email"
                    prefixIcon={<Mail className="h-4 w-4" />}
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  <Button
                    type="submit"
                    className="w-full mt-2 font-semibold shadow-md"
                    size="lg"
                    isLoading={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                    {!isLoading && <ArrowRight className="h-4 w-4 ml-1.5" />}
                  </Button>
                </form>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center border-t border-neutral-100 dark:border-neutral-800 py-4 bg-neutral-50/50 dark:bg-neutral-850/50 rounded-b-xl">
            <button
              type="button"
              onClick={() => navigate('login')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </button>
          </CardFooter>
        </Card>

        <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Security tokens expire automatically in 60 minutes</span>
        </div>
      </div>
    </div>
  );
}
