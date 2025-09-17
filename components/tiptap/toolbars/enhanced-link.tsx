'use client';

/**
 * Enhanced Link Toolbar for TipTap Editor
 *
 * Features:
 * 1. Character Search Mode: Allows searching and selecting characters to auto-generate character links
 * 2. Manual Link Mode: Free-form link input for any URLs (external, internal, etc.)
 * 3. Backwards Compatible: Falls back to regular LinkToolbar when enableCharacterSearch is false
 *
 * Usage:
 * - Character Wiki Editor: enableCharacterSearch=true (shows character search functionality)
 * - Chapter Content Editor: enableCharacterSearch=false (uses regular link toolbar)
 */

import { PopoverClose } from '@radix-ui/react-popover';
import { Trash2, X, Search, ExternalLink } from 'lucide-react';
import React, { type FormEvent, useState, useEffect } from 'react';

import { Button, type ButtonProps } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToolbar } from './toolbar-provider';
import { getUrlFromString } from '../utils';

interface Character {
  id: string;
  name: string;
  slug: string;
  published: boolean;
}

const EnhancedLinkToolbar = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    enableCharacterSearch?: boolean;
  }
>(({ className, enableCharacterSearch = false, ...props }, ref) => {
  const { editor } = useToolbar();
  const [link, setLink] = React.useState('');
  const [isCharacterMode, setIsCharacterMode] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter characters based on search query
  const filteredCharacters = characters.filter((char) => char.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Load characters when character mode is enabled
  useEffect(() => {
    if (isCharacterMode && enableCharacterSearch && characters.length === 0) {
      loadCharacters();
    }
  }, [isCharacterMode, enableCharacterSearch, characters.length]);

  const loadCharacters = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/characters');
      const result = await response.json();
      if (result.success) {
        setCharacters(result.data.filter((char: Character) => char.published));
      }
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    let finalUrl = '';

    if (isCharacterMode && selectedCharacter && enableCharacterSearch) {
      // Generate character link
      finalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/characters/${selectedCharacter.slug}`;
    } else {
      // Use manual link input
      finalUrl = getUrlFromString(link) || '';
    }

    if (finalUrl) {
      editor?.chain().focus().setLink({ href: finalUrl }).run();
      // Reset state
      resetForm();
    }
  };

  const resetForm = () => {
    setLink('');
    setIsCharacterMode(false);
    setSearchQuery('');
    setSelectedCharacter(null);
  };

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setSearchQuery('');
  };

  React.useEffect(() => {
    const currentLink = editor?.getAttributes('link').href;
    if (currentLink) {
      setLink(currentLink);
      // Check if it's a character link
      if (enableCharacterSearch && currentLink.includes('/characters/')) {
        const slug = currentLink.split('/characters/')[1];
        const character = characters.find((c) => c.slug === slug);
        if (character) {
          setSelectedCharacter(character);
          setIsCharacterMode(true);
        }
      }
    }
  }, [editor, characters, enableCharacterSearch]);

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger disabled={!editor?.can().chain().setLink({ href: '' }).run()} asChild>
            <Button
              variant='ghost'
              size='sm'
              className={cn('h-8 w-max px-3 font-normal', editor?.isActive('link') && 'bg-accent', className)}
              ref={ref}
              {...props}
            >
              <p className='mr-2 text-base'>↗</p>
              <p className={'underline decoration-gray-7 underline-offset-4'}>Link</p>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <span>Link</span>
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
        asChild
        className='relative px-3 py-2.5 w-96'
      >
        <div className='relative'>
          <PopoverClose className='absolute right-3 top-3 z-10'>
            <X className='h-4 w-4' />
          </PopoverClose>

          <form onSubmit={handleSubmit}>
            <Label>Add Link</Label>
            <p className='text-sm text-gray-11 mb-4'>Attach a link to the selected text</p>

            {/* Mode Toggle - only show if character search is enabled */}
            {enableCharacterSearch && (
              <div className='flex items-center gap-2 mb-4'>
                <Button
                  type='button'
                  variant={!isCharacterMode ? 'primary' : 'outline'}
                  size='sm'
                  onClick={() => {
                    setIsCharacterMode(false);
                    setSelectedCharacter(null);
                    setSearchQuery('');
                  }}
                >
                  <ExternalLink className='h-4 w-4 mr-1' />
                  Manual Link
                </Button>
                <Button
                  type='button'
                  variant={isCharacterMode ? 'primary' : 'outline'}
                  size='sm'
                  onClick={() => {
                    setIsCharacterMode(true);
                    setLink('');
                  }}
                >
                  <Search className='h-4 w-4 mr-1' />
                  Character
                </Button>
              </div>
            )}

            {/* Character Search Mode */}
            {isCharacterMode && enableCharacterSearch ? (
              <div className='space-y-3'>
                {!selectedCharacter ? (
                  <>
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder='Search characters...'
                      className='w-full'
                    />

                    {searchQuery && (
                      <div className='max-h-48 overflow-y-auto border border-gray-200 rounded-md'>
                        {isLoading ? (
                          <div className='p-3 text-sm text-gray-500'>Loading characters...</div>
                        ) : filteredCharacters.length > 0 ? (
                          filteredCharacters.map((character) => (
                            <button
                              key={character.id}
                              type='button'
                              onClick={() => handleSelectCharacter(character)}
                              className='w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0'
                            >
                              <div className='font-medium text-gray-900'>{character.name}</div>
                              <div className='text-sm text-gray-500'>/characters/{character.slug}</div>
                            </button>
                          ))
                        ) : (
                          <div className='p-3 text-sm text-gray-500'>No characters found</div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className='p-3 bg-blue-50 border border-blue-200 rounded-md'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <div className='font-medium text-blue-900'>{selectedCharacter.name}</div>
                        <div className='text-sm text-blue-700'>/characters/{selectedCharacter.slug}</div>
                      </div>
                      <Button type='button' variant='ghost' size='sm' onClick={() => setSelectedCharacter(null)}>
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Manual Link Mode */
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className='w-full mb-3'
                placeholder='https://example.com or /internal-link'
              />
            )}

            <div className='flex items-center justify-end gap-3 mt-4'>
              {editor?.getAttributes('link').href && (
                <Button
                  type='reset'
                  size='sm'
                  className='h-8 text-gray-11'
                  variant='ghost'
                  onClick={() => {
                    editor?.chain().focus().unsetLink().run();
                    resetForm();
                  }}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Remove
                </Button>
              )}
              <Button
                size='sm'
                className='h-8'
                disabled={isCharacterMode && enableCharacterSearch ? !selectedCharacter : !link.trim()}
              >
                {editor?.getAttributes('link').href ? 'Update' : 'Add Link'}
              </Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
});

EnhancedLinkToolbar.displayName = 'EnhancedLinkToolbar';

export { EnhancedLinkToolbar };
