import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import { useRegisterMutation } from '../../services/authApi';
import { useNavigateView } from '../../hooks/useNavigateView';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service to create an account',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigateView();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdSuccess, setCreatedSuccess] = useState<{
    email: string;
    token?: string;
    verificationToken?: string;
  } | null>(null);

  const [registerMutation, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeTerms: true,
    },
  });

  const watchedPassword = watch('password', '');

  // Password strength checks
  const hasMinLength = watchedPassword.length >= 6;
  const hasNumber = /\d/.test(watchedPassword);
  const hasUpper = /[A-Z]/.test(watchedPassword);

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    try {
      const result = await registerMutation({
        name: data.name,
        email: data.email,
        password: data.password,
      }).unwrap();

      if (result.success) {
        if (result.user && result.token) {
          dispatch(
            setCredentials({
              user: result.user,
              token: result.token,
            })
          );
        }

        setCreatedSuccess({
          email: data.email,
          token: result.token,
          verificationToken: result.verificationToken,
        });

        dispatch(
          addToast({
            title: 'Account Registered',
            description: `Welcome to AURA, ${data.name}!`,
            type: 'success',
          })
        );
      } else {
        setErrorMessage(result.message || 'Registration failed');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.error || 'Registration failed. An account with this email may already exist.'
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
            Create an Account
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Join AURA for personalized recommendations, order tracking, and exclusive releases.
          </p>
        </div>

        {/* Success Screen if Created */}
        {createdSuccess ? (
          <Card className="border-neutral-200/80 bg-white/95 backdrop-blur-md shadow-lg dark:border-neutral-800 dark:bg-neutral-900/90 text-center p-6 space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Account Created Successfully!
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                We sent a verification link to <strong className="text-neutral-800 dark:text-neutral-200">{createdSuccess.email}</strong>. Please confirm your email to unlock all features.
              </p>
            </div>

            {createdSuccess.verificationToken && (
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/80 dark:border-blue-900/50 dark:bg-blue-950/40 text-left space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                  Quick Verification Shortcut
                </span>
                <p className="text-xs text-blue-700 dark:text-blue-200">
                  In development mode, verify your account instantly with this token:
                </p>
                <button
                  type="button"
                  onClick={() =>
                    navigate('verify-email', `token=${createdSuccess.verificationToken}`)
                  }
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Verify Email Now <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => navigate('shop')}
              >
                Continue to Store
              </Button>
              <Button
                className="w-full text-xs"
                onClick={() => navigate('login')}
              >
                Go to Sign In
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="border-neutral-200/80 bg-white/95 backdrop-blur-md shadow-lg dark:border-neutral-800 dark:bg-neutral-900/90">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-bold">Register</CardTitle>
              <CardDescription>
                Fill in your details to create your secure profile
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 p-3 rounded-lg border border-red-200 bg-red-50/80 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <div className="flex-1 font-medium">{errorMessage}</div>
                </div>
              )}

              <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <Input
                  id="register-name"
                  type="text"
                  label="Full Name"
                  placeholder="e.g. Jordan Hayes"
                  autoComplete="name"
                  prefixIcon={<User className="h-4 w-4" />}
                  error={errors.name?.message}
                  {...register('name')}
                />

                {/* Email Address */}
                <Input
                  id="register-email"
                  type="email"
                  label="Email Address"
                  placeholder="name@example.com"
                  autoComplete="email"
                  prefixIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                {/* Password Field */}
                <Input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
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
                  error={errors.password?.message}
                  {...register('password')}
                />

                {/* Password Criteria Hints */}
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

                {/* Confirm Password */}
                <Input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  placeholder="Re-enter password"
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

                {/* Terms of Service Checkbox */}
                <div className="pt-1">
                  <Checkbox
                    id="register-terms"
                    label={
                      <span>
                        I agree to the{' '}
                        <a href="#terms" className="underline hover:text-neutral-950 dark:hover:text-white">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#privacy" className="underline hover:text-neutral-950 dark:hover:text-white">
                          Privacy Policy
                        </a>
                      </span>
                    }
                    error={errors.agreeTerms?.message}
                    {...register('agreeTerms')}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full mt-2 font-semibold shadow-md"
                  size="lg"
                  isLoading={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                  {!isLoading && <ArrowRight className="h-4 w-4 ml-1.5" />}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col items-center justify-center border-t border-neutral-100 dark:border-neutral-800 py-4 bg-neutral-50/50 dark:bg-neutral-850/50 rounded-b-xl">
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Already have an account?{' '}
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
        )}

        <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Data protected with End-to-End Encryption</span>
        </div>
      </div>
    </div>
  );
}
