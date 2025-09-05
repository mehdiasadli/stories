'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CharacterAppearanceType, CharacterGender } from '@prisma/client';
import { Trash2, Edit2, Plus, X } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  slug: string;
  gender: CharacterGender;
  published: boolean;
}

interface ChapterCharacter {
  id: string;
  characterId: string;
  character: {
    id: string;
    name: string;
    slug: string;
    gender: CharacterGender;
  };
  appearanceType: CharacterAppearanceType;
  note: string | null;
  quotesAndThoughts: string[];
}

interface Chapter {
  id: string;
  slug: string;
  title: string;
  characters: ChapterCharacter[];
}

interface ChapterCharactersFormProps {
  chapter: Chapter;
}

export function ChapterCharactersForm({ chapter }: ChapterCharactersFormProps) {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [appearanceType, setAppearanceType] = useState<CharacterAppearanceType>('APPEARANCE');
  const [note, setNote] = useState('');
  const [quotes, setQuotes] = useState<string[]>(['']);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<ChapterCharacter | null>(null);

  // Check if chapter already has a POV character
  const hasPOV = chapter.characters.some((cc) => cc.appearanceType === 'POV');

  // Filter characters based on search query
  const filteredCharacters = characters.filter((char) => char.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Load all characters
  useEffect(() => {
    const loadCharacters = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/characters');
        const result = await response.json();
        if (result.success) {
          setCharacters(result.data);
        } else {
          toast.error('Failed to load characters');
        }
      } catch (error) {
        console.error('Error loading characters:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacters();
  }, []);

  // Handle adding a new character to chapter
  const handleAddCharacter = async () => {
    if (!selectedCharacter) {
      toast.error('Please select a character');
      return;
    }

    // Check if character is already in chapter
    const existingCharacter = chapter.characters.find((cc) => cc.characterId === selectedCharacter.id);
    if (existingCharacter) {
      toast.error('This character is already in the chapter');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/chapters/${chapter.slug}/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: selectedCharacter.id,
          appearanceType,
          note: note.trim() || null,
          quotesAndThoughts: quotes.filter((q) => q.trim() !== ''),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Character added successfully');
        router.refresh();
        // Reset form
        setSelectedCharacter(null);
        setAppearanceType('APPEARANCE');
        setNote('');
        setQuotes(['']);
        setSearchQuery('');
      } else {
        toast.error(result.message || 'Failed to add character');
      }
    } catch (error) {
      console.error('Error adding character:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating an existing character
  const handleUpdateCharacter = async () => {
    if (!editingCharacter) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/chapters/${chapter.slug}/characters/${editingCharacter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appearanceType,
          note: note.trim() || null,
          quotesAndThoughts: quotes.filter((q) => q.trim() !== ''),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Character updated successfully');
        router.refresh();
        setEditingCharacter(null);
        setAppearanceType('APPEARANCE');
        setNote('');
        setQuotes(['']);
      } else {
        toast.error(result.message || 'Failed to update character');
      }
    } catch (error) {
      console.error('Error updating character:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a character from chapter
  const handleDeleteCharacter = async (chapterCharacterId: string) => {
    if (!confirm('Are you sure you want to remove this character from the chapter?')) {
      return;
    }

    try {
      const response = await fetch(`/api/chapters/${chapter.slug}/characters/${chapterCharacterId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Character removed successfully');
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to remove character');
      }
    } catch (error) {
      console.error('Error removing character:', error);
      toast.error('An unexpected error occurred');
    }
  };

  // Handle editing a character
  const handleEditCharacter = (chapterCharacter: ChapterCharacter) => {
    setEditingCharacter(chapterCharacter);
    setAppearanceType(chapterCharacter.appearanceType);
    setNote(chapterCharacter.note || '');
    setQuotes(chapterCharacter.quotesAndThoughts.length > 0 ? chapterCharacter.quotesAndThoughts : ['']);
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingCharacter(null);
    setAppearanceType('APPEARANCE');
    setNote('');
    setQuotes(['']);
  };

  // Handle adding a new quote
  const addQuote = () => {
    setQuotes([...quotes, '']);
  };

  // Handle removing a quote
  const removeQuote = (index: number) => {
    setQuotes(quotes.filter((_, i) => i !== index));
  };

  // Handle updating a quote
  const updateQuote = (index: number, value: string) => {
    const newQuotes = [...quotes];
    newQuotes[index] = value;
    setQuotes(newQuotes);
  };

  return (
    <div className='space-y-8'>
      {/* Add/Edit Character Form */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
          {editingCharacter ? 'Edit Character' : 'Add Character to Chapter'}
        </h2>

        {!editingCharacter && (
          <div className='mb-6'>
            <Label htmlFor='character-search' className='block text-sm font-medium text-gray-700 mb-2'>
              Search and Select Character
            </Label>
            <Input
              id='character-search'
              type='text'
              placeholder='Type character name to search...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full'
            />

            {searchQuery && (
              <div className='mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md'>
                {isLoading ? (
                  <div className='p-3 text-sm text-gray-500'>Loading characters...</div>
                ) : filteredCharacters.length > 0 ? (
                  filteredCharacters.map((character) => (
                    <button
                      key={character.id}
                      type='button'
                      onClick={() => {
                        setSelectedCharacter(character);
                        setSearchQuery('');
                      }}
                      className='w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0'
                    >
                      <div className='font-medium text-gray-900'>{character.name}</div>
                      <div className='text-sm text-gray-500'>
                        {character.gender} • {character.published ? 'Published' : 'Draft'}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className='p-3 text-sm text-gray-500'>No characters found</div>
                )}
              </div>
            )}

            {selectedCharacter && (
              <div className='mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium text-blue-900'>{selectedCharacter.name}</div>
                    <div className='text-sm text-blue-700'>
                      {selectedCharacter.gender} • {selectedCharacter.published ? 'Published' : 'Draft'}
                    </div>
                  </div>
                  <Button type='button' variant='ghost' size='sm' onClick={() => setSelectedCharacter(null)}>
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {editingCharacter && (
          <div className='mb-6 p-3 bg-gray-50 border border-gray-200 rounded-md'>
            <div className='font-medium text-gray-900'>{editingCharacter.character.name}</div>
            <div className='text-sm text-gray-500'>Editing character appearance</div>
          </div>
        )}

        {/* Appearance Type */}
        <div className='mb-6'>
          <Label className='block text-sm font-medium text-gray-700 mb-3'>Appearance Type</Label>
          <div className='space-y-2'>
            {(['POV', 'APPEARANCE', 'MENTION'] as CharacterAppearanceType[]).map((type) => (
              <label key={type} className='flex items-center'>
                <input
                  type='radio'
                  name='appearanceType'
                  value={type}
                  checked={appearanceType === type}
                  onChange={(e) => setAppearanceType(e.target.value as CharacterAppearanceType)}
                  disabled={type === 'POV' && hasPOV && !editingCharacter}
                  className='mr-2'
                />
                <span
                  className={`text-sm ${type === 'POV' && hasPOV && !editingCharacter ? 'text-gray-400' : 'text-gray-700'}`}
                >
                  {type}
                  {type === 'POV' && hasPOV && !editingCharacter && ' (Already has POV character)'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className='mb-6'>
          <Label htmlFor='note' className='block text-sm font-medium text-gray-700 mb-2'>
            Note (Optional)
          </Label>
          <textarea
            id='note'
            value={note}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
            placeholder='Add notes about this character in this chapter...'
            rows={3}
            className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>

        {/* Quotes and Thoughts */}
        <div className='mb-6'>
          <Label className='block text-sm font-medium text-gray-700 mb-2'>Quotes and Thoughts (Optional)</Label>
          <div className='space-y-2'>
            {quotes.map((quote, index) => (
              <div key={index} className='flex items-center gap-2'>
                <Input
                  value={quote}
                  onChange={(e) => updateQuote(index, e.target.value)}
                  placeholder={`Quote/thought ${index + 1}...`}
                  className='flex-1'
                />
                {quotes.length > 1 && (
                  <Button type='button' variant='ghost' size='sm' onClick={() => removeQuote(index)}>
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>
            ))}
            <Button type='button' variant='outline' size='sm' onClick={addQuote} className='mt-2'>
              <Plus className='h-4 w-4 mr-1' />
              Add Quote
            </Button>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className='flex items-center gap-3'>
          {editingCharacter ? (
            <>
              <Button type='button' onClick={handleUpdateCharacter} disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Character'}
              </Button>
              <Button type='button' variant='outline' onClick={handleCancelEdit} disabled={isSubmitting}>
                Cancel
              </Button>
            </>
          ) : (
            <Button type='button' onClick={handleAddCharacter} disabled={!selectedCharacter || isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Character'}
            </Button>
          )}
        </div>
      </div>

      {/* Existing Characters */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
          Characters in Chapter ({chapter.characters.length})
        </h2>

        {chapter.characters.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>No characters added to this chapter yet.</div>
        ) : (
          <div className='space-y-4'>
            {chapter.characters.map((chapterCharacter) => (
              <div
                key={chapterCharacter.id}
                className='border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <h3 className='font-semibold text-gray-900'>{chapterCharacter.character.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          chapterCharacter.appearanceType === 'POV'
                            ? 'bg-purple-100 text-purple-800'
                            : chapterCharacter.appearanceType === 'APPEARANCE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {chapterCharacter.appearanceType}
                      </span>
                    </div>

                    {chapterCharacter.note && <p className='text-sm text-gray-600 mb-2'>{chapterCharacter.note}</p>}

                    {chapterCharacter.quotesAndThoughts.length > 0 && (
                      <div className='mb-2'>
                        <div className='text-sm font-medium text-gray-700 mb-1'>Quotes & Thoughts:</div>
                        <ul className='text-sm text-gray-600 space-y-1'>
                          {chapterCharacter.quotesAndThoughts.map((quote, index) => (
                            <li key={index} className='italic'>
                              &quot;{quote}&quot;
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className='flex items-center gap-2 ml-4'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => handleEditCharacter(chapterCharacter)}
                      disabled={editingCharacter?.id === chapterCharacter.id}
                    >
                      <Edit2 className='h-4 w-4 mr-1' />
                      Edit
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => handleDeleteCharacter(chapterCharacter.id)}
                    >
                      <Trash2 className='h-4 w-4 mr-1' />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
