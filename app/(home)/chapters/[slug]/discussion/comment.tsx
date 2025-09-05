/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useActionState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { AddReply } from './add-reply';
import { EditComment } from './edit-comment';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

interface CommentProps {
  comment: CommentData;
  currentUserId?: string;
  chapterAuthorId: string;
  chapterSlug: string;
  chapterTitle: string;
  createCommentAction: (prevState: any, formData: FormData) => Promise<any>;
  deleteCommentAction: (prevState: any, formData: FormData) => Promise<any>;
  updateCommentAction: (prevState: any, formData: FormData) => Promise<any>;
}

export function Comment({
  comment,
  currentUserId,
  chapterAuthorId,
  chapterSlug,
  chapterTitle,
  createCommentAction,
  deleteCommentAction,
  updateCommentAction,
}: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [localComment] = useState(comment);

  const [deleteState, deleteAction, isDeleting] = useActionState(deleteCommentAction, {
    success: false,
    data: null,
    error: null,
    message: '',
  });

  const canEdit = currentUserId === comment.userId || currentUserId === chapterAuthorId;
  const canDelete = currentUserId === comment.userId || currentUserId === chapterAuthorId;
  const canReply = comment.depth < 4;

  // Handle delete success - close modal and refresh
  useEffect(() => {
    if (deleteState.success && !isDeleting) {
      setIsDeleteModalOpen(false);
      // Refresh the page to show updated comments
      window.location.reload();
    }
  }, [deleteState.success, isDeleting]);

  const handleReplyAdded = () => {
    setIsReplying(false);
    // Refresh the page to show new reply
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleCommentUpdate = () => {
    setIsEditing(false);
    // Refresh the page to show updated comment
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className='border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:mb-0'>
      {/* Comment Header */}
      <div className='flex justify-between items-start mb-3'>
        <div className='flex items-center gap-3'>
          <div className='w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-700'>
            {comment.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <Link
                href={`/users/${comment.user.slug}`}
                className='text-sm text-gray-900 hover:text-gray-700 transition-colors'
              >
                {comment.user.name}
              </Link>
              {comment.userId === chapterAuthorId && <span className='text-xs text-gray-500'>yazar</span>}
            </div>
            <div className='text-xs text-gray-500'>
              {formatDistanceToNow(new Date(comment.createdAt))} əvvəl
              {comment.updatedAt > comment.createdAt && ' (düzəliş)'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex items-center gap-4 text-xs'>
          {canReply && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className='text-gray-600 hover:text-gray-900 transition-colors border-b border-dotted border-gray-400 hover:border-gray-600'
            >
              cavabla
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className='text-gray-600 hover:text-gray-900 transition-colors border-b border-dotted border-gray-400 hover:border-gray-600'
            >
              düzəliş
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className='text-gray-600 hover:text-gray-900 transition-colors border-b border-dotted border-gray-400 hover:border-gray-600'
            >
              sil
            </button>
          )}
        </div>
      </div>

      {/* Comment Content */}
      {isEditing ? (
        <EditComment
          comment={localComment}
          onUpdate={handleCommentUpdate}
          onCancel={() => setIsEditing(false)}
          updateCommentAction={updateCommentAction}
        />
      ) : (
        <div className='text-gray-800 mb-4 text-sm leading-relaxed'>
          <p className='whitespace-pre-wrap'>{localComment.content}</p>
        </div>
      )}

      {/* Reply Form */}
      {isReplying && (
        <div className='mb-4'>
          <AddReply
            parentId={comment.id}
            chapterSlug={chapterSlug}
            onReplyAdded={handleReplyAdded}
            onCancel={() => setIsReplying(false)}
            createCommentAction={createCommentAction}
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className='mt-4'>
          <div className='space-y-4 ml-4 border-l border-gray-200 pl-4'>
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className='bg-white border border-gray-200 shadow-lg max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-lg font-serif text-gray-900'>şərhi sil</DialogTitle>
            <DialogDescription className='text-sm text-gray-600'>
              şərhi silmək istədiyinizdən əminsinizmi? bu əməliyyat geri qaytarıla bilməz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex justify-end gap-3'>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className='text-sm text-gray-600 hover:text-gray-900 transition-colors px-4 py-2'
            >
              ləğv et
            </button>
            <form action={deleteAction} className='inline'>
              <input type='hidden' name='id' value={comment.id} />
              <button
                type='submit'
                disabled={isDeleting}
                className='text-sm text-white bg-gray-900 hover:bg-gray-800 transition-colors px-4 py-2 disabled:opacity-50'
              >
                {isDeleting ? 'silinir...' : 'sil'}
              </button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
