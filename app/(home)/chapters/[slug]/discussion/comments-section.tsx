/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { AddComment } from './add-comment';
import { CommentList } from './comment-list';

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

interface CommentsSectionProps {
  chapterSlug: string;
  chapterTitle: string;
  initialComments: CommentData[];
  currentUserId?: string;
  chapterAuthorId: string;
  createCommentAction: (prevState: any, formData: FormData) => Promise<any>;
  deleteCommentAction: (prevState: any, formData: FormData) => Promise<any>;
  updateCommentAction: (prevState: any, formData: FormData) => Promise<any>;
  singleComment?: boolean;
}

export function CommentsSection({
  chapterSlug,
  chapterTitle,
  initialComments,
  currentUserId,
  chapterAuthorId,
  createCommentAction,
  deleteCommentAction,
  updateCommentAction,
  singleComment = false,
}: CommentsSectionProps) {
  const [comments] = useState<CommentData[]>(initialComments);

  const handleCommentOperation = () => {
    // Force a full page refresh to get updated comments and counts
    window.location.reload();
  };

  return (
    <div className='space-y-6'>
      {/* Add Comment Form */}
      {!singleComment && (
        <AddComment
          chapterSlug={chapterSlug}
          createCommentAction={createCommentAction}
          onCommentAdded={handleCommentOperation}
        />
      )}

      {/* Comments List */}
      <CommentList
        chapterSlug={chapterSlug}
        chapterTitle={chapterTitle}
        initialComments={comments}
        currentUserId={currentUserId}
        chapterAuthorId={chapterAuthorId}
        createCommentAction={createCommentAction}
        deleteCommentAction={deleteCommentAction}
        updateCommentAction={updateCommentAction}
      />
    </div>
  );
}
