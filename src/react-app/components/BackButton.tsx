import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ to = '/', label = 'الرئيسية', className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-lg shadow-md hover:shadow-lg transition-all ${className}`}
    >
      <ArrowRight size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );
}
