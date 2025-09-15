'use client';

import { TCharacterCreate } from '@/lib/schemas/character.schema';
import { CharacterGender } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function CreateCharacterForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsPending(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData(e.currentTarget);

      // Helper function to convert comma-separated string to array
      const stringToArray = (value: string | null): string[] | null => {
        if (!value || value.trim() === '') return null;
        return value
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      };

      let uploadedProfileImageUrl: string | null = null;

      const imageFile = formData.get('profileImage') as File | null;
      if (imageFile && imageFile.size > 0) {
        const MAX_SIZE = 3 * 1024 * 1024; // 3MB
        if (imageFile.size > MAX_SIZE) {
          setError('Image must be 3MB or smaller');
          toast.error('Image must be 3MB or smaller');
          setIsPending(false);
          return;
        }
        const uploadForm = new FormData();
        uploadForm.append('file', imageFile);

        const uploadRes = await fetch('/api/uploads/image', {
          method: 'POST',
          body: uploadForm,
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok || !uploadJson?.success) {
          throw new Error(uploadJson?.error || 'Failed to upload image');
        }
        uploadedProfileImageUrl = uploadJson.secureUrl as string;
      }

      const data: TCharacterCreate = {
        name: formData.get('name') as string,
        gender: formData.get('gender') as CharacterGender,
        published: formData.get('published') === 'true',
        nameDescription: (formData.get('nameDescription') as string) || null,
        description: (formData.get('description') as string) || null,
        titles: stringToArray(formData.get('titles') as string),
        aliases: stringToArray(formData.get('aliases') as string),
        profileImageUrl: uploadedProfileImageUrl,
        dateOfBirth: (formData.get('dateOfBirth') as string) || null,
        dateOfDeath: (formData.get('dateOfDeath') as string) || null,
        placeOfBirth: (formData.get('placeOfBirth') as string) || null,
        placeOfDeath: (formData.get('placeOfDeath') as string) || null,
        deathDescription: (formData.get('deathDescription') as string) || null,
      };

      const response = await fetch('/api/characters/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(result.message || 'Character created successfully');
        toast.success('Character created successfully');
        if (result.data.published) {
          router.push(`/characters/${result.data.slug}`);
        } else {
          router.push(`/dashboard/characters`);
        }
      } else {
        setError(result.error || 'Failed to create character');
        toast.error(result.error || 'Failed to create character');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Name */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>character name</label>
          <input
            type='text'
            placeholder='enter character name...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isPending}
            name='name'
            required
          />
        </div>

        {/* Name Description */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>name description</label>
          <p className='text-sm text-gray-600 mb-2'>brief description of the character&apos;s name (optional)</p>
          <input
            placeholder='brief description of the character name...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white resize-none'
            disabled={isPending}
            name='nameDescription'
          />
        </div>

        {/* Description */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>description</label>
          <p className='text-sm text-gray-600 mb-2'>brief description of the character (optional)</p>
          <textarea
            placeholder='brief description of the character...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white resize-none'
            rows={3}
            disabled={isPending}
            name='description'
          />
        </div>

        {/* Titles */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>titles</label>
          <p className='text-sm text-gray-600 mb-2'>character titles, separated by commas (optional)</p>
          <input
            type='text'
            placeholder='King, Lord, Hero, etc...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isPending}
            name='titles'
          />
        </div>

        {/* Aliases */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>aliases</label>
          <p className='text-sm text-gray-600 mb-2'>character aliases, separated by commas (optional)</p>
          <input
            type='text'
            placeholder='The Chosen One, Dragon Slayer, etc...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isPending}
            name='aliases'
          />
        </div>

        {/* Profile Image */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>profile image</label>
          <p className='text-sm text-gray-600 mb-2'>upload a character profile image (optional)</p>
          <input
            type='file'
            accept='image/*'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isPending}
            name='profileImage'
          />
          <p className='text-xs text-gray-500 mt-1'>Max 3MB. JPEG/PNG/WebP recommended.</p>
        </div>

        {/* Date of Birth */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>date of birth</label>
          <p className='text-sm text-gray-600 mb-2'>character&apos;s birth date (optional)</p>
          <input
            type='text'
            placeholder='January 1, 1990 or 1990-01-01'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isPending}
            name='dateOfBirth'
          />
        </div>

        {/* Date of Death */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>date of death</label>
          <p className='text-sm text-gray-600 mb-2'>character&apos;s death date (optional)</p>
          <input
            type='text'
            placeholder='December 31, 2020 or 2020-12-31'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isPending}
            name='dateOfDeath'
          />
        </div>

        {/* Place of Birth */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>place of birth</label>
          <p className='text-sm text-gray-600 mb-2'>character&apos;s birthplace (optional)</p>
          <input
            type='text'
            placeholder='New York, USA'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isPending}
            name='placeOfBirth'
          />
        </div>

        {/* Place of Death */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>place of death</label>
          <p className='text-sm text-gray-600 mb-2'>character&apos;s place of death (optional)</p>
          <input
            type='text'
            placeholder='London, England'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isPending}
            name='placeOfDeath'
          />
        </div>

        {/* Birth Description */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>birth description</label>
          <p className='text-sm text-gray-600 mb-2'>description of how the character was born (optional)</p>
          <textarea
            placeholder='description of how the character died...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white resize-none'
            rows={3}
            disabled={isPending}
            name='birthDescription'
          />
        </div>

        {/* Death Description */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>death description</label>
          <p className='text-sm text-gray-600 mb-2'>description of how the character died (optional)</p>
          <textarea
            placeholder='description of how the character died...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white resize-none'
            rows={3}
            disabled={isPending}
            name='deathDescription'
          />
        </div>

        {/* Gender */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>gender</label>
          <p className='text-sm text-gray-600 mb-2'>character&apos;s gender</p>
          <div className='flex gap-6'>
            <label className='flex items-center gap-2'>
              <input
                type='radio'
                name='gender'
                value='MALE'
                className='text-gray-600 focus:ring-gray-400'
                disabled={isPending}
                defaultChecked
              />
              <span className='text-sm text-gray-700'>Male</span>
            </label>
            <label className='flex items-center gap-2'>
              <input
                type='radio'
                name='gender'
                value='FEMALE'
                className='text-gray-600 focus:ring-gray-400'
                disabled={isPending}
              />
              <span className='text-sm text-gray-700'>Female</span>
            </label>
            <label className='flex items-center gap-2'>
              <input
                type='radio'
                name='gender'
                value='OTHER'
                className='text-gray-600 focus:ring-gray-400'
                disabled={isPending}
              />
              <span className='text-sm text-gray-700'>Other</span>
            </label>
          </div>
        </div>

        {/* Published */}
        <div>
          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              name='published'
              value='true'
              className='text-gray-600 focus:ring-gray-400'
              disabled={isPending}
            />
            <span className='text-sm font-medium text-gray-900'>publish character</span>
          </label>
          <p className='text-sm text-gray-600 mt-1'>make this character visible to readers</p>
        </div>

        {!!error && <div className='text-sm text-red-600 p-3 border border-red-200 bg-red-50'>{error}</div>}

        {!!success && <div className='text-sm text-green-600 p-3 border border-green-200 bg-green-50'>{success}</div>}

        {/* Submit Button */}
        <div className='pt-4 border-t border-gray-200'>
          <button
            type='submit'
            className='w-full py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={isPending}
          >
            {isPending ? 'creating character...' : 'create character'}
          </button>
        </div>
      </form>
    </div>
  );
}
