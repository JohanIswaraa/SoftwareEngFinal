import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface DeleteInternshipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (permanent: boolean) => void;
  internshipTitle: string;
}

export const DeleteInternshipDialog: React.FC<DeleteInternshipDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  internshipTitle,
}) => {
  const [isPermanent, setIsPermanent] = useState(false);

  const handleConfirm = () => {
    onConfirm(isPermanent);
    setIsPermanent(false);
    onClose();
  };

  const handleCancel = () => {
    setIsPermanent(false);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Internship</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Are you sure you want to delete <strong>"{internshipTitle}"</strong>?
            </p>
            <div className="flex items-start space-x-3 py-3">
              <Checkbox
                id="permanent-delete"
                checked={isPermanent}
                onCheckedChange={(checked) => setIsPermanent(checked as boolean)}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="permanent-delete"
                  className="text-sm font-medium cursor-pointer"
                >
                  Permanently delete (Advanced)
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isPermanent
                    ? 'This will remove all data and cannot be undone.'
                    : 'This will archive the internship. It can be restored later.'}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={isPermanent ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {isPermanent ? 'Permanently Delete' : 'Archive'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
