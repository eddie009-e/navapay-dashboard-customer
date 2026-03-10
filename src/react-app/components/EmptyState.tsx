import { LucideIcon } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fadeIn">
      <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl flex items-center justify-center mb-6">
        <Icon size={40} className="text-primary" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">{title}</h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
