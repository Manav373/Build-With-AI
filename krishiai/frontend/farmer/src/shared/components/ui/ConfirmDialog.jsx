import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertCircle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 text-amber-300 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
          <p>{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
