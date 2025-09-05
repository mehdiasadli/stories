'use client';

import { TCharacterUpdate } from '@/lib/schemas/character.schema';
import { CharacterGender } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface EditCharacterFormProps {
  character: {
    id: string;
    slug: string;
    name: string;
    nameDescription: string | null;
    description: string | null;
    titles: string[];
    aliases: string[];
    wiki: string | null;
    profileImageUrl: string | null;
    dateOfBirth: string | null;
    dateOfDeath: string | null;
    placeOfBirth: string | null;
    placeOfDeath: string | null;
    deathDescription: string | null;
    gender: CharacterGender;
    published: boolean;
  };
}

export function EditCharacterForm({ character }: EditCharacterFormProps) {
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

      const data: TCharacterUpdate = {
        name: formData.get('name') as string,
        gender: formData.get('gender') as CharacterGender,
        nameDescription: (formData.get('nameDescription') as string) || null,
        description: (formData.get('description') as string) || null,
        titles: stringToArray(formData.get('titles') as string),
        aliases: stringToArray(formData.get('aliases') as string),
        profileImageUrl: (formData.get('profileImageUrl') as string) || null,
        dateOfBirth: (formData.get('dateOfBirth') as string) || null,
        dateOfDeath: (formData.get('dateOfDeath') as string) || null,
        placeOfBirth: (formData.get('placeOfBirth') as string) || null,
        placeOfDeath: (formData.get('placeOfDeath') as string) || null,
        deathDescription: (formData.get('deathDescription') as string) || null,
        published: formData.get('published') === 'true',
      };

      const response = await fetch(`/api/characters/${character.slug}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(result.message || 'Character updated successfully');
        toast.success('Character updated successfully');

        // If the name changed, redirect to the new slug
        if (result.data.slug !== character.slug) {
          router.push(`/dashboard/characters/${result.data.slug}/edit`);
        }
      } else {
        setError(result.error || 'Failed to update character');
        toast.error(result.error || 'Failed to update character');
      }
    } catch (error) {
      console.error('Error updating character:', error);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsPending(false);
    }
  };

  // Helper function to convert array to comma-separated string
  const arrayToString = (arr: string[] | null): string => {
    if (!arr || arr.length === 0) return '';
    return arr.join(', ');
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Name */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>character Name</label>
          <input
            type='text'
            placeholder='enter character name...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isPending}
            name='name'
            defaultValue={character.name}
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
            defaultValue={character.nameDescription || ''}
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
            defaultValue={character.description || ''}
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
            defaultValue={arrayToString(character.titles)}
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
            defaultValue={arrayToString(character.aliases)}
          />
        </div>

        {/* Profile Image URL - Placeholder */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>profile Image URL</label>
          <p className='text-sm text-gray-600 mb-2'>character profile image (optional - feature coming soon)</p>
          <input
            type='url'
            placeholder='https://example.com/character-image.jpg'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-gray-50'
            disabled={true}
            name='profileImageUrl'
            defaultValue={character.profileImageUrl || ''}
          />
          <p className='text-xs text-gray-500 mt-1'>Image upload functionality will be implemented later</p>
        </div>

        {/* Date of Birth */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>date of Birth</label>
          <p className='text-sm text-gray-600 mb-2'>character&apos;s birth date (optional)</p>
          <input
            type='text'
            placeholder='January 1, 1990 or 1990-01-01'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isPending}
            name='dateOfBirth'
            defaultValue={character.dateOfBirth || ''}
          />
        </div>

        {/* Date of Death */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>date of Death</label>
          <p className='text-sm text-gray-600 mb-2'>character&apos;s death date (optional)</p>
          <input
            type='text'
            placeholder='December 31, 2020 or 2020-12-31'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isPending}
            name='dateOfDeath'
            defaultValue={character.dateOfDeath || ''}
          />
        </div>

        {/* Place of Birth */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>place of Birth</label>
          <p className='text-sm text-gray-600 mb-2'>character&apos;s birthplace (optional)</p>
          <input
            type='text'
            placeholder='New York, USA'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isPending}
            name='placeOfBirth'
            defaultValue={character.placeOfBirth || ''}
          />
        </div>

        {/* Place of Death */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>place of Death</label>
          <p className='text-sm text-gray-600 mb-2'>character&apos;s place of death (optional)</p>
          <input
            type='text'
            placeholder='London, England'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isPending}
            name='placeOfDeath'
            defaultValue={character.placeOfDeath || ''}
          />
        </div>

        {/* Death Description */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>death Description</label>
          <p className='text-sm text-gray-600 mb-2'>description of how the character died (optional)</p>
          <textarea
            placeholder='description of how the character died...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white resize-none'
            rows={3}
            disabled={isPending}
            name='deathDescription'
            defaultValue={character.deathDescription || ''}
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
                defaultChecked={character.gender === 'MALE'}
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
                defaultChecked={character.gender === 'FEMALE'}
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
                defaultChecked={character.gender === 'OTHER'}
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
              defaultChecked={character.published}
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
            {isPending ? 'updating character...' : 'update character'}
          </button>
        </div>
      </form>
    </div>
  );
}
