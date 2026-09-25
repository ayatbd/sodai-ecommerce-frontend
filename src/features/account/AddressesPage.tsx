import React, { useState } from 'react';
import { AccountLayout } from './AccountLayout';
import { useAppDispatch } from '../../store/hooks';
import { addToast } from '../../store/slices/uiSlice';
import {
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from '../../services/api';
import { Address } from '../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Check,
  Building,
  Phone,
  User,
  Star,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required (min 2 characters)'),
  street: z.string().min(5, 'Street address is required'),
  apartment: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State / Province is required'),
  postalCode: z.string().min(4, 'Postal code / ZIP is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().min(7, 'Valid contact phone number is required'),
  type: z.enum(['shipping', 'billing', 'both']),
  isDefaultShipping: z.boolean(),
  isDefaultBilling: z.boolean(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export function AddressesPage() {
  const dispatch = useAppDispatch();
  const { data: addresses = [], isLoading, isError, refetch } = useGetAddressesQuery();

  const [addAddressMutation, { isLoading: isAdding }] = useAddAddressMutation();
  const [updateAddressMutation, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddressMutation] = useDeleteAddressMutation();
  const [setDefaultMutation] = useSetDefaultAddressMutation();

  // Dialog controls
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      phone: '',
      type: 'both',
      isDefaultShipping: false,
      isDefaultBilling: false,
    },
  });

  const selectedType = watch('type');

  const openAddDialog = () => {
    setEditingAddress(null);
    reset({
      fullName: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      phone: '',
      type: 'both',
      isDefaultShipping: addresses.length === 0,
      isDefaultBilling: addresses.length === 0,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (addr: Address) => {
    setEditingAddress(addr);
    reset({
      fullName: addr.fullName,
      street: addr.street,
      apartment: addr.apartment || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone,
      type: addr.type || 'both',
      isDefaultShipping: addr.isDefaultShipping,
      isDefaultBilling: addr.isDefaultBilling,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: AddressFormData) => {
    try {
      if (editingAddress) {
        await updateAddressMutation({
          id: editingAddress.id,
          ...data,
        }).unwrap();
        dispatch(
          addToast({
            title: 'Address Updated',
            description: `${data.street} has been saved.`,
            type: 'success',
          })
        );
      } else {
        await addAddressMutation({
          ...data,
          userId: 'usr-default-1',
        }).unwrap();
        dispatch(
          addToast({
            title: 'Address Created',
            description: `${data.street} added to your address book.`,
            type: 'success',
          })
        );
      }
      setIsDialogOpen(false);
      reset();
    } catch {
      dispatch(
        addToast({
          title: 'Operation Failed',
          description: 'Could not save address. Please check all fields.',
          type: 'destructive',
        })
      );
    }
  };

  const handleDelete = async (id: string, street: string) => {
    try {
      await deleteAddressMutation(id).unwrap();
      dispatch(
        addToast({
          title: 'Address Removed',
          description: `${street} was removed from your address book.`,
          type: 'info',
        })
      );
      setDeletingId(null);
    } catch {
      dispatch(
        addToast({
          title: 'Delete Failed',
          type: 'destructive',
        })
      );
    }
  };

  const handleSetDefault = async (id: string, type: 'shipping' | 'billing') => {
    try {
      await setDefaultMutation({ id, type }).unwrap();
      dispatch(
        addToast({
          title: `Default ${type === 'shipping' ? 'Shipping' : 'Billing'} Updated`,
          description: 'Your default address preferences have been saved.',
          type: 'success',
        })
      );
    } catch {
      dispatch(
        addToast({
          title: 'Update Failed',
          type: 'destructive',
        })
      );
    }
  };

  return (
    <AccountLayout
      activeTab="addresses"
      title="Saved Addresses"
      subtitle="Manage your primary delivery destinations and billing profiles for streamlined checkout."
    >
      <div className="space-y-6">
        {/* Top Header / Add Button */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved on file
          </p>

          <Button
            size="sm"
            onClick={openAddDialog}
            className="gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Address</span>
          </Button>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-3"
              >
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && addresses.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-800">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 mb-3">
              <MapPin className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-neutral-950 dark:text-white">
              No Saved Addresses Yet
            </h3>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              Save your residential or studio address to enable seamless 1-click checkout dispatches.
            </p>
            <Button
              size="sm"
              onClick={openAddDialog}
              className="mt-5 text-xs gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Address</span>
            </Button>
          </div>
        )}

        {/* Addresses Grid */}
        {!isLoading && addresses.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {addresses.map((address) => {
              const addressType = address.type || 'both';

              return (
                <div
                  key={address.id}
                  className={`relative flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition-all ${
                    address.isDefaultShipping
                      ? 'border-neutral-900 bg-white ring-1 ring-neutral-900/10 dark:border-neutral-400 dark:bg-neutral-900 dark:ring-white/10'
                      : 'border-neutral-200/80 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Badge Strip */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {address.isDefaultShipping && (
                        <Badge variant="default" className="text-[10px] gap-1 py-0.5">
                          <Check className="h-3 w-3" />
                          Default Shipping
                        </Badge>
                      )}
                      {address.isDefaultBilling && (
                        <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-[10px] text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 py-0.5">
                          Default Billing
                        </Badge>
                      )}
                      <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 capitalize">
                        {addressType === 'both' ? 'Shipping & Billing' : `${addressType} Address`}
                      </span>
                    </div>

                    {/* Contact & Street Info */}
                    <div>
                      <h4 className="text-sm font-bold text-neutral-950 dark:text-white">
                        {address.fullName}
                      </h4>
                      <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                        {address.street} {address.apartment || ''}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {address.country}
                      </p>
                      <p className="mt-2 text-[11px] text-neutral-400 flex items-center gap-1.5">
                        <Phone className="h-3 w-3" />
                        {address.phone}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 border-t border-neutral-150 pt-3.5 dark:border-neutral-800 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {!address.isDefaultShipping && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(address.id, 'shipping')}
                          className="text-[11px] font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white underline decoration-neutral-300 underline-offset-4"
                        >
                          Make Shipping Default
                        </button>
                      )}
                      {!address.isDefaultBilling && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(address.id, 'billing')}
                          className="text-[11px] font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white underline decoration-neutral-300 underline-offset-4"
                        >
                          Make Billing Default
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(address)}
                        className="h-8 px-2 text-xs gap-1 text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingId(address.id)}
                        className="h-8 px-2 text-xs gap-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add / Edit Dialog Modal */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => setIsDialogOpen(open)}
          title={editingAddress ? 'Edit Saved Address' : 'Add New Address'}
          maxWidth="xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            {/* Address Type Selector */}
            <div>
              <label className="font-semibold text-neutral-900 dark:text-white block mb-1.5">
                Address Purpose:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'shipping', label: 'Shipping Only' },
                  { value: 'billing', label: 'Billing Only' },
                  { value: 'both', label: 'Both Types' },
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setValue('type', t.value as any)}
                    className={`rounded-xl border p-2 text-center text-xs font-semibold transition-all ${
                      selectedType === t.value
                        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Full Name */}
            <div>
              <label className="font-semibold text-neutral-900 dark:text-white block mb-1">
                Full Name / Recipient
              </label>
              <Input
                {...register('fullName')}
                placeholder="e.g. Alex Rivera"
                className="h-9 text-xs"
              />
              {errors.fullName && (
                <p className="mt-1 text-[11px] text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            {/* Street Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-neutral-900 dark:text-white block mb-1">
                  Street Address
                </label>
                <Input
                  {...register('street')}
                  placeholder="e.g. 742 Evergreen Terrace"
                  className="h-9 text-xs"
                />
                {errors.street && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.street.message}</p>
                )}
              </div>

              <div>
                <label className="font-semibold text-neutral-900 dark:text-white block mb-1">
                  Apt / Suite (Opt.)
                </label>
                <Input
                  {...register('apartment')}
                  placeholder="Loft 4B"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* City, State, ZIP */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-neutral-900 dark:text-white block mb-1">
                  City
                </label>
                <Input
                  {...register('city')}
                  placeholder="San Francisco"
                  className="h-9 text-xs"
                />
                {errors.city && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="font-semibold text-neutral-900 dark:text-white block mb-1">
                  State / Province
                </label>
                <Input
                  {...register('state')}
                  placeholder="CA"
                  className="h-9 text-xs"
                />
                {errors.state && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.state.message}</p>
                )}
              </div>

              <div>
                <label className="font-semibold text-neutral-900 dark:text-white block mb-1">
                  ZIP / Postal Code
                </label>
                <Input
                  {...register('postalCode')}
                  placeholder="94107"
                  className="h-9 text-xs"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.postalCode.message}</p>
                )}
              </div>
            </div>

            {/* Country & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-900 dark:text-white block mb-1">
                  Country
                </label>
                <Input
                  {...register('country')}
                  placeholder="United States"
                  className="h-9 text-xs"
                />
                {errors.country && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.country.message}</p>
                )}
              </div>

              <div>
                <label className="font-semibold text-neutral-900 dark:text-white block mb-1">
                  Phone Number
                </label>
                <Input
                  {...register('phone')}
                  type="tel"
                  placeholder="+1 (415) 882-9011"
                  className="h-9 text-xs"
                />
                {errors.phone && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Default Toggles */}
            <div className="space-y-2 pt-2 border-t border-neutral-150 dark:border-neutral-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isDefaultShipping')}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 dark:border-neutral-700"
                />
                <span className="text-neutral-700 dark:text-neutral-300">
                  Set as default shipping address
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isDefaultBilling')}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 dark:border-neutral-700"
                />
                <span className="text-neutral-700 dark:text-neutral-300">
                  Set as default billing address
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-150 dark:border-neutral-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isAdding || isUpdating}
              >
                {isAdding || isUpdating
                  ? 'Saving...'
                  : editingAddress
                  ? 'Update Address'
                  : 'Save Address'}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!deletingId}
          onOpenChange={(open) => !open && setDeletingId(null)}
          title="Delete Address"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-neutral-600 dark:text-neutral-400">
              Are you sure you want to remove this address from your address book? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (deletingId) {
                    const addr = addresses.find((a) => a.id === deletingId);
                    handleDelete(deletingId, addr?.street || 'Address');
                  }
                }}
              >
                Delete Address
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </AccountLayout>
  );
}
