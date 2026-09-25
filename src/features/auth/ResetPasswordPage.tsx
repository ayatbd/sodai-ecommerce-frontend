import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { addToast } from '../../store/slices/uiSlice';
import { useResetPasswordMutation } from '../../services/authApi';
import { useNavigateView } from '../../hooks/useNavigateView';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigateView();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [resetPasswordMutation, { isLoading }] = useResetPasswordMutation();

  // Extract token from URL query string if present
  const getTokenFromUrl = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('token') || '';
    }
    return '';
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: getTokenFromUrl(),
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const token = getTokenFromUrl();
    if (token) {
      setValue('token', token);
    }
  }, [setValue]);

  const watchedPassword = watch('newPassword', '');
  const hasMinLength = watchedPassword.length >= 6;
  const hasNumber = /\d/.test(watchedPassword);
  const hasUpper = /[A-Z]/.test(watchedPassword);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setErrorMessage(null);
    try {
      const result = await resetPasswordMutation({
        token: data.token.trim(),
        newPassword: data.newPassword,
      }).unwrap();

      if (result.success) {
        setIsSuccess(true);
        dispatch(
          addToast({
            title: 'Password Updated',
            description: 'Your password has been reset successfully.',
            type: 'success',
          })
        );
      } else {
        setErrorMessage(result.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message ||
          err?.error ||
          'Failed to reset password. The link or token may be expired or invalid.'
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
            Reset Password
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Choose a strong, unique password to secure your AURA profile.
          </p>
        </div>

        <Card className="border-neutral-200/80 bg-white/95 backdrop-blur-md shadow-lg dark:border-neutral-800 dark:bg-neutral-900/90">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">New Password</CardTitle>
            <CardDescription>
              Enter the reset token received and your new credentials
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isSuccess ? (
              <div className="text-center space-y-4 py-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Password Successfully Changed!
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Your password has been updated. You can now use your new credentials to sign in to your AURA account.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    className="w-full font-semibold"
                    size="lg"
                    onClick={() => navigate('login')}
                  >
                    Continue to Sign In <ArrowRight className="h-4 w-4 ml-1.5" />
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

                <form id="reset-password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Reset Token Input */}
                  <Input
                    id="reset-token"
                    type="text"
                    label="Reset Security Token"
                    placeholder="Enter or paste reset token"
                    prefixIcon={<KeyRound className="h-4 w-4" />}
                    error={errors.token?.message}
                    {...register('token')}
                  />

                  {/* New Password Input */}
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    label="New Password"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    prefixIcon={<Lock className="h-4 w-4" />}
                    suffixIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    error={errors.newPassword?.message}
                    {...register('newPassword')}
                  />

                  {/* Password Strength Checklist */}
                  <div className="flex flex-wrap gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span className={`inline-flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                      {hasMinLength ? '✓' : '•'} 6+ chars
                    </span>
                    <span className={`inline-flex items-center gap-1 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                      {hasNumber ? '✓' : '•'} 1+ number
                    </span>
                    <span className={`inline-flex items-center gap-1 ${hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                      {hasUpper ? '✓' : '•'} 1+ uppercase
                    </span>
                  </div>

                  {/* Confirm New Password */}
                  <Input
                    id="confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm New Password"
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    prefixIcon={<Lock className="h-4 w-4" />}
                    suffixIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />

                  <Button
                    type="submit"
                    className="w-full mt-2 font-semibold shadow-md"
                    size="lg"
                    isLoading={isLoading}
                  >
                    {isLoading ? 'Updating Password...' : 'Save New Password'}
                    {!isLoading && <ArrowRight className="h-4 w-4 ml-1.5" />}
                  </Button>
                </form>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center border-t border-neutral-100 dark:border-neutral-800 py-4 bg-neutral-50/50 dark:bg-neutral-850/50 rounded-b-xl">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => navigate('login')}
                className="font-semibold text-neutral-950 dark:text-white underline-offset-4 hover:underline ml-1"
              >
                Sign in
              </button>
            </p>
          </CardFooter>
        </Card>

        <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Encrypted with SHA-256 password hashing</span>
        </div>
      </div>
    </div>
  );
}
