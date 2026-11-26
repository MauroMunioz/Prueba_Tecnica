'use client';

import { LoaderCircle, Trash2, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  busyLabel?: string;
  /** Mientras es true los botones se deshabilitan y no se puede cerrar */
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  busyLabel = 'Procesando...',
  busy = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      icon={<TriangleAlert />}
      iconTone="danger"
      onClose={onCancel}
      preventClose={busy}
      role="alertdialog"
    >
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-accent-100 bg-accent-50 px-3 py-2 text-sm text-accent-700"
        >
          {error}
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {/* El foco inicial va a Cancelar: un Enter accidental no borra nada */}
        <Button variant="secondary" onClick={onCancel} disabled={busy} autoFocus>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>
          {busy ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
          {busy ? busyLabel : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
