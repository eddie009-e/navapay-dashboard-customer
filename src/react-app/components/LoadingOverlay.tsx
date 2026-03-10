import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = 'جاري التحميل...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center gap-4 min-w-[200px]">
        <LoadingSpinner size="lg" />
        <p className="text-gray-900 font-medium">{message}</p>
      </div>
    </div>
  );
}
