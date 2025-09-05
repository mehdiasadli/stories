/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Comment } from './comment';

interface CommentUser {
  id: string;
  name: string;
  slug: string;
}

interface CommentReplies {
  id: string;
  slug: string;
  content: string;
  depth: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: CommentUser;
  parentId: string | null;
  _count: {
    replies: number;
  };
  replies?: CommentReplies[];
}

interface CommentData {
  id: string;
  slug: string;
  content: string;
  depth: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: CommentUser;
  parentId: string | null;
  _count: {
    replies: number;
  };
  replies?: CommentReplies[];
}

interface CommentListProps {
  chapterSlug: string;
  chapterTitle: string;
  initialComments: CommentData[];
  currentUserId?: string;
  chapterAuthorId: string;
  createCommentAction: (prevState: any, formData: FormData) => Promise<any>;
  deleteCommentAction: (prevState: any, formData: FormData) => Promise<any>;
  updateCommentAction: (prevState: any, formData: FormData) => Promise<any>;
}

export function CommentList({
  chapterSlug,
  chapterTitle,
  initialComments,
  currentUserId,
  chapterAuthorId,
  createCommentAction,
  deleteCommentAction,
  updateCommentAction,
}: CommentListProps) {
  const [comments, setComments] = useState<CommentData[]>(initialComments);

  // Update comments when initialComments prop changes (from parent refresh)
  if (JSON.stringify(comments) !== JSON.stringify(initialComments)) {
    setComments(initialComments);
  }

  if (comments.length === 0) {
    return (
      <div className='text-center text-gray-500 py-8'>
        <p className='text-lg font-medium'>şərh yoxdur</p>
        <p className='text-sm'>diskusiyanı başlat!</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={{
            ...comment,
            replies: comment.replies || [],
          }}
          currentUserId={currentUserId}
          chapterAuthorId={chapterAuthorId}
          chapterSlug={chapterSlug}
          chapterTitle={chapterTitle}
          createCommentAction={createCommentAction}
          deleteCommentAction={deleteCommentAction}
          updateCommentAction={updateCommentAction}
        />
      ))}
    </div>
  );
}
