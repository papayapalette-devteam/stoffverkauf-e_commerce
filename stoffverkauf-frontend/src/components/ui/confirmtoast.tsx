import React from "react";
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
} from "../ui/toast";

type ConfirmToastProps = {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export const ConfirmToast: React.FC<ConfirmToastProps> = ({
  open,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <Toast variant="destructive" open={open}>
      <ToastTitle>Confirm</ToastTitle>
      <ToastDescription>{message}</ToastDescription>
      <div className="flex gap-2 mt-2 justify-end">
        <ToastAction
          asChild
          onClick={() => {
            onCancel?.();
          }}
        >
          <button className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
            Cancel
          </button>
        </ToastAction>
        <ToastAction
          asChild
          onClick={() => {
            onConfirm();
          }}
        >
          <button className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">
            Delete
          </button>
        </ToastAction>
      </div>
    </Toast>
  );
};