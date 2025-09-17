import React from 'react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ToolbarProvider } from './toolbar-provider';
import { Editor } from '@tiptap/core';
import { HeadingsToolbar } from './headings';
import { BlockquoteToolbar } from './blockquote';
import { BoldToolbar } from './bold';
import { ItalicToolbar } from './italic';
import { UnderlineToolbar } from './underline';
import { StrikeThroughToolbar } from './strikethrough';
import { LinkToolbar } from './link';
import { EnhancedLinkToolbar } from './enhanced-link';
import { HorizontalRuleToolbar } from './horizontal-rule';
// import { BulletListToolbar } from './bullet-list';
// import { HardBreakToolbar } from './hard-break';
import AlignmentToolbar from './alignment';

interface EditorToolbarProps {
  editor: Editor;
  linkBase?: string;
  enableCharacterSearch?: boolean;
}

export default function EditorToolbar({ editor, linkBase, enableCharacterSearch }: EditorToolbarProps) {
  return (
    <div className='sticky top-0 z-20 w-full border-b bg-background hidden sm:block'>
      <ToolbarProvider editor={editor}>
        <TooltipProvider>
          <ScrollArea className='h-fit py-0.5'>
            <div>
              <div className='flex items-center gap-1 px-2'>
                {/* History Group */}
                {/* <UndoToolbar /> */}
                {/* <RedoToolbar /> */}
                {/* <Separator orientation='vertical' className='mx-1 h-7' /> */}

                {/* Text Structure Group */}
                <HeadingsToolbar />
                <BlockquoteToolbar />
                <Separator orientation='vertical' className='mx-1 h-7' />

                {/* Basic Formatting Group */}
                <BoldToolbar />
                <ItalicToolbar />
                <UnderlineToolbar />
                <StrikeThroughToolbar />
                {enableCharacterSearch ? (
                  <EnhancedLinkToolbar enableCharacterSearch={enableCharacterSearch} />
                ) : (
                  <LinkToolbar linkBase={linkBase} />
                )}
                <Separator orientation='vertical' className='mx-1 h-7' />

                {/* Lists & Structure Group */}
                {/* <BulletListToolbar /> */}
                <HorizontalRuleToolbar />
                <Separator orientation='vertical' className='mx-1 h-7' />

                {/* Alignment Group */}
                <AlignmentToolbar />
                <Separator orientation='vertical' className='mx-1 h-7' />

                {/* Media & Styling Group */}
                {/* <ImagePlaceholderToolbar /> */}
                <Separator orientation='vertical' className='mx-1 h-7' />
              </div>
            </div>
            <ScrollBar className='hidden' orientation='horizontal' />
          </ScrollArea>
        </TooltipProvider>
      </ToolbarProvider>
    </div>
  );
}
