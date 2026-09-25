import React, { useState, useEffect } from 'react';
import { AccountLayout } from './AccountLayout';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateUser } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import {
  useGetCurrentUserQuery,
  useUpdateUserProfileMutation,
  useChangeUserPasswordMutation,
} from '../../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Camera,
  ShieldCheck,
  AlertCircle,
  Save,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

// Profile schema with Zod
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address format'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  avatar: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Password change schema with Zod
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

// Curated avatar presets for easy studio personalization
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
];

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const { data: userProfile, refetch: refetchProfile } = useGetCurrentUserQuery(undefined, {
    skip: !auth.isAuthenticated,
  });

  const [updateProfileMutation, { isLoading: isUpdatingProfile }] =
    useUpdateUserProfileMutation();
  const [changePasswordMutation, { isLoading: isChangingPassword }] =
    useChangeUserPasswordMutation();

  const user = userProfile || auth.user;

  // Split name if firstName/lastName not explicitly stored
  const parsedFirstName =
    user?.firstName ||
    (user?.name ? user.name.split(' ')[0] : 'Alex');
  const parsedLastName =
    user?.lastName ||
    (user?.name ? user.name.split(' ').slice(1).join(' ') : 'Rivera');

  // Profile Form state
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    watch: watchProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: parsedFirstName,
      lastName: parsedLastName,
      email: user?.email || '',
      phone: user?.phone || '+1 (415) 882-9011',
      avatar: user?.avatar || AVATAR_PRESETS[0],
    },
  });

  const selectedAvatar = watchProfile('avatar');

  // Password Form state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watchPassword('newPassword') || '';

  // Synchronize form when user data loads
  useEffect(() => {
    if (user) {
      setProfileValue('firstName', user.firstName || (user.name ? user.name.split(' ')[0] : ''));
      setProfileValue('lastName', user.lastName || (user.name ? user.name.split(' ').slice(1).join(' ') : ''));
      setProfileValue('email', user.email);
      setProfileValue('phone', user.phone || '+1 (415) 882-9011');
      if (user.avatar) {
        setProfileValue('avatar', user.avatar);
      }
    }
  }, [user, setProfileValue]);

  // Handle Profile Update
  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      const updated = await updateProfileMutation({
        name: fullName,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
      }).unwrap();

      // Synchronize in Redux auth slice
      dispatch(
        updateUser({
          name: fullName,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          avatar: data.avatar,
        })
      );

      dispatch(
        addToast({
          title: 'Profile Updated',
          description: 'Your personal information has been saved successfully.',
          type: 'success',
        })
      );
      refetchProfile();
    } catch {
      dispatch(
        addToast({
          title: 'Update Failed',
          description: 'Failed to update your personal details. Please try again.',
          type: 'destructive',
        })
      );
    }
  };

  // Handle Password Change
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      await changePasswordMutation({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();

      dispatch(
        addToast({
          title: 'Password Changed',
          description: 'Your security password has been updated successfully.',
          type: 'success',
        })
      );
      resetPasswordForm();
    } catch {
      dispatch(
        addToast({
          title: 'Password Update Failed',
          description: 'Could not change password. Please check your credentials.',
          type: 'destructive',
        })
      );
    }
  };

  return (
    <AccountLayout
      activeTab="profile"
      title="Profile &amp; Security"
      subtitle="Manage your contact details, profile photo, and password credentials."
    >
      <div className="space-y-8">
        {/* Profile Details Card */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-150 pb-5 dark:border-neutral-800">
            <h3 className="text-base font-bold text-neutral-950 dark:text-white">
              Personal Information
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Used for your purchase confirmations, customer support, and carrier dispatches.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="mt-6 space-y-6">
            {/* Avatar Section */}
            <div>
              <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block mb-2">
                Profile Photo
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="relative group shrink-0">
                  <Avatar
                    src={selectedAvatar}
                    fallback={parsedFirstName.slice(0, 2).toUpperCase()}
                    size="xl"
                    className="h-20 w-20 rounded-2xl ring-2 ring-neutral-200 dark:ring-neutral-700 shadow-xs"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <Camera className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Select a curated studio portrait or enter a custom avatar image URL:
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfileValue('avatar', preset, { shouldDirty: true })}
                        className={`h-9 w-9 rounded-xl overflow-hidden ring-2 transition-transform hover:scale-105 ${
                          selectedAvatar === preset
                            ? 'ring-neutral-900 dark:ring-white scale-105'
                            : 'ring-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={preset}
                          alt="Avatar preset"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  <div className="mt-2">
                    <Input
                      placeholder="Or paste image URL (https://...)"
                      {...registerProfile('avatar')}
                      className="text-xs h-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Name Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block mb-1.5">
                  First Name
                </label>
                <div className="relative">
                  <Input
                    {...registerProfile('firstName')}
                    placeholder="First name"
                    className="h-10 text-xs pl-9"
                  />
                  <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                </div>
                {profileErrors.firstName && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {profileErrors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block mb-1.5">
                  Last Name
                </label>
                <div className="relative">
                  <Input
                    {...registerProfile('lastName')}
                    placeholder="Last name"
                    className="h-10 text-xs pl-9"
                  />
                  <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                </div>
                {profileErrors.lastName && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {profileErrors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    {...registerProfile('email')}
                    type="email"
                    placeholder="Email address"
                    className="h-10 text-xs pl-9"
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                </div>
                {profileErrors.email && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {profileErrors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Input
                    {...registerProfile('phone')}
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="h-10 text-xs pl-9"
                  />
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                </div>
                {profileErrors.phone && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {profileErrors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isUpdatingProfile}
                className="gap-2 text-xs font-medium"
              >
                {isUpdatingProfile ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-150 pb-5 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
              <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                Change Password
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Keep your customer account secure by choosing a strong, distinct password.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="mt-6 space-y-5">
            {/* Current Password */}
            <div>
              <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Input
                  {...registerPassword('currentPassword')}
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter your current password"
                  className="h-10 text-xs pl-9 pr-10"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-[11px] text-red-500">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    {...registerPassword('newPassword')}
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className="h-10 text-xs pl-9 pr-10"
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    {...registerPassword('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    className="h-10 text-xs pl-9 pr-10"
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Criteria Checklist */}
            <div className="rounded-xl border border-neutral-150 bg-neutral-50/70 p-3.5 text-[11px] dark:border-neutral-800 dark:bg-neutral-850/40">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
                Password Requirements:
              </span>
              <ul className="space-y-1 text-neutral-600 dark:text-neutral-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${
                      newPasswordValue.length >= 6
                        ? 'text-emerald-500'
                        : 'text-neutral-300 dark:text-neutral-600'
                    }`}
                  />
                  <span>At least 6 characters</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${
                      /[0-9]/.test(newPasswordValue)
                        ? 'text-emerald-500'
                        : 'text-neutral-300 dark:text-neutral-600'
                    }`}
                  />
                  <span>Contains at least one number (0-9)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${
                      /[a-z]/.test(newPasswordValue)
                        ? 'text-emerald-500'
                        : 'text-neutral-300 dark:text-neutral-600'
                    }`}
                  />
                  <span>Contains at least one lowercase letter</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="outline"
                disabled={isChangingPassword}
                className="gap-2 text-xs font-medium"
              >
                {isChangingPassword ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>Update Password</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AccountLayout>
  );
}
