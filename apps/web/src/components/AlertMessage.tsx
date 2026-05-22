import type { Message } from '../types';

type AlertMessageProps = {
  message: Message;
};

export function AlertMessage({ message }: AlertMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${
        message.type === 'success'
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
      }`}
    >
      {message.text}
    </div>
  );
}
