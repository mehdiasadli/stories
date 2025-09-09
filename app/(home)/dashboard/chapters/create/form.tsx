'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function CreateChapterForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingOrders, setExistingOrders] = useState<number[]>([]);
  const [nextOrder, setNextOrder] = useState<number>(1);
  const [orderInput, setOrderInput] = useState<string>('');

  // Fetch existing orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/chapters/create');
        if (response.ok) {
          const result = await response.json();
          setExistingOrders(result.data.existingOrders);
          setNextOrder(result.data.nextOrder);
          setOrderInput(result.data.nextOrder.toString());
        }
      } catch (error) {
        console.error('Error fetching chapter orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData(e.currentTarget);

      const data = {
        title: formData.get('title') as string,
        order: parseInt(formData.get('order') as string),
        synopsis: (formData.get('synopsis') as string) || null,
        coverImageUrl: null, // Will be implemented later
      };

      const response = await fetch('/api/chapters/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(result.message || 'Chapter created successfully');
        toast.success('Chapter created successfully');

        // Redirect to edit content page
        router.push(`/dashboard/chapters/${result.data.slug}/edit/content`);
      } else {
        setError(result.error || 'Failed to create chapter');
        toast.error(result.error || 'Failed to create chapter');
      }
    } catch (error) {
      console.error('Error creating chapter:', error);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsPending(false);
    }
  };

  const isOrderTaken = (order: number) => existingOrders.includes(order);

  return (
    <div>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>chapter title</label>
          <input
            type='text'
            placeholder='enter chapter title...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isPending}
            name='title'
            required
          />
        </div>

        {/* Order */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>chapter order</label>
          <p className='text-sm text-gray-600 mb-2'>position of this chapter in the book</p>
          <input
            type='number'
            placeholder='enter chapter order...'
            className={`w-full px-4 py-3 text-sm border rounded-none focus:outline-none bg-white ${
              orderInput && isOrderTaken(parseInt(orderInput))
                ? 'border-red-300 focus:border-red-400'
                : 'border-gray-200 focus:border-gray-400'
            }`}
            disabled={isPending}
            min={1}
            name='order'
            value={orderInput}
            onChange={(e) => setOrderInput(e.target.value)}
            required
          />
          {orderInput && isOrderTaken(parseInt(orderInput)) && (
            <p className='mt-1 text-sm text-red-600'>Chapter order {orderInput} is already taken</p>
          )}
          {existingOrders.length > 0 && (
            <p className='mt-1 text-xs text-gray-500'>
              Existing orders: {existingOrders.join(', ')} • Suggested next: {nextOrder}
            </p>
          )}
        </div>

        {/* Synopsis */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>chapter synopsis</label>
          <p className='text-sm text-gray-600 mb-2'>brief description of this chapter (optional)</p>
          <textarea
            placeholder='brief description of this chapter...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white resize-none'
            rows={3}
            disabled={isPending}
            name='synopsis'
          />
        </div>

        {/* Cover Image URL - Placeholder */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>cover image url</label>
          <p className='text-sm text-gray-600 mb-2'>chapter cover image (optional - feature coming soon)</p>
          <input
            type='url'
            placeholder='https://example.com/image.jpg'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-gray-50'
            disabled={true}
            name='coverImageUrl'
          />
          <p className='text-xs text-gray-500 mt-1'>Image upload functionality will be implemented later</p>
        </div>

        {!!error && <div className='text-sm text-red-600 p-3 border border-red-200 bg-red-50'>{error}</div>}

        {!!success && <div className='text-sm text-green-600 p-3 border border-green-200 bg-green-50'>{success}</div>}

        {/* Submit Button */}
        <div className='pt-4 border-t border-gray-200'>
          <button
            type='submit'
            className='w-full py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={isPending || (orderInput ? isOrderTaken(parseInt(orderInput)) : false)}
          >
            {isPending ? 'creating chapter...' : 'create chapter'}
          </button>
        </div>
      </form>
    </div>
  );
}
