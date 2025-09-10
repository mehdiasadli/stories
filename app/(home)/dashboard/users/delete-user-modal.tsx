'use client';

import { Button } from '@/components/ui/button';
import DialogContent, {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';

export function DeleteUserModal({ isOpen, onClose, slug }: { isOpen: boolean; onClose: () => void; slug: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteUser = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/users/delete/${slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.message('User deleted successfully');
        window.location.reload();
        onClose();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
        </DialogHeader>
        <DialogDescription>Are you sure you want to delete this user?</DialogDescription>
        <DialogFooter>
          <Button className='bg-destructive hover:bg-destructive/90' onClick={handleDeleteUser}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
