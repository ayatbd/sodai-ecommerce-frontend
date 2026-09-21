import React, { useState } from 'react';
import {
  useGetAddressesQuery,
  useAddAddressMutation,
  useDeleteAddressMutation,
} from '../../services/api';
import { useAppDispatch } from '../../store/hooks';
import { setCurrentView, addToast } from '../../store/slices/uiSlice';
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
  Check,
  ArrowLeft,
  Building,
  Phone,
  User,
} from 'lucide-react';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  street: z.string().min(5, 'Street address is required'),
  apartment: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State or province is required'),
  postalCode: z.string().min(4, 'Postal or ZIP code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().min(8, 'Phone number is required'),
  isDefaultShipping: z.boolean(),
  isDefaultBilling: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export function AddressBook() {
  const dispatch = useAppDispatch();
  const { data: addresses = [], isLoading, isError, refetch } = useGetAddressesQuery();
  const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
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
      isDefaultShipping: false,
      isDefaultBilling: false,
    },
  });

  const onSubmit = async (data: AddressFormValues) => {
    try {
      await addAddress({
        ...data,
        userId: 'usr-default-1',
      }).unwrap();
      dispatch(
        addToast({
          title: 'Address Saved',
          description: `${data.street} added to your address book.`,
          type: 'success',
        })
      );
      reset();
      setIsDialogOpen(false);
    } catch {
      dispatch(
        addToast({
          title: 'Failed to Save Address',
          type: 'destructive',
        })
      );
    }
  };

  const handleDelete = async (id: string, street: string) => {
    try {
      await deleteAddress(id).unwrap();
      dispatch(
        addToast({
          title: 'Address Removed',
          description: street,
          type: 'default',
        })
      );
    } catch {
      dispatch(
        addToast({
          title: 'Failed to Delete Address',
          type: 'destructive',
        })
      );
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-6 dark:border-neutral-800">
        <div>
          <button
            onClick={() => dispatch(setCurrentView('shop'))}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to Store</span>
          </button>
          <h1 className="text-2xl font-bold text-neutral-950 dark:text-white">
            Saved Address Book
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage your personal studio locations, residences, and billing destinations.
          </p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)} className="gap-2" size="sm">
          <Plus className="h-4 w-4" />
          <span>Add New Address</span>
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-xs text-red-500">Failed to load saved addresses.</p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
            Retry
          </Button>
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-800">
          <MapPin className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            No saved addresses
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Add your primary shipping and billing address for accelerated checkout.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} size="sm" className="mt-4">
            Add Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="flex flex-col justify-between rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-neutral-400" />
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {addr.fullName}
                    </h4>
                  </div>
                  <div className="flex gap-1.5">
                    {addr.isDefaultShipping && (
                      <Badge variant="default" className="text-[10px]">
                        Default Shipping
                      </Badge>
                    )}
                    {addr.isDefaultBilling && (
                      <Badge variant="secondary" className="text-[10px]">
                        Default Billing
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-0.5">
                  <p>{addr.street} {addr.apartment || ''}</p>
                  <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p>{addr.country}</p>
                  <p className="pt-1 text-[11px] text-neutral-500 flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    <span>{addr.phone}</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 mt-4 border-t border-neutral-150 dark:border-neutral-800">
                <button
                  onClick={() => handleDelete(addr.id, addr.street)}
                  className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Add New Address"
        description="Enter destination details for your AURA deliveries."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <Input
            label="Full Name"
            placeholder="Alex Rivera"
            {...register('fullName')}
            error={errors.fullName?.message}
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="Street Address"
                placeholder="742 Evergreen Terrace"
                {...register('street')}
                error={errors.street?.message}
              />
            </div>
            <div>
              <Input
                label="Apt / Suite"
                placeholder="Loft 4B"
                {...register('apartment')}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Input
                label="City"
                placeholder="San Francisco"
                {...register('city')}
                error={errors.city?.message}
              />
            </div>
            <div>
              <Input
                label="State"
                placeholder="CA"
                {...register('state')}
                error={errors.state?.message}
              />
            </div>
            <div>
              <Input
                label="Postal Code"
                placeholder="94107"
                {...register('postalCode')}
                error={errors.postalCode?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Country"
              placeholder="United States"
              {...register('country')}
              error={errors.country?.message}
            />
            <Input
              label="Phone Number"
              placeholder="+1 (415) 882-9011"
              {...register('phone')}
              error={errors.phone?.message}
            />
          </div>

          <div className="flex items-center gap-6 pt-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('isDefaultShipping')}
                className="rounded text-neutral-900"
              />
              <span>Set as default shipping</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('isDefaultBilling')}
                className="rounded text-neutral-900"
              />
              <span>Set as default billing</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isAdding}>
              Save Address
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
