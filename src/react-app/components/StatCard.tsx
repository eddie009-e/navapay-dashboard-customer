import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: number;
  trend?: 'up' | 'down';
  onClick?: () => void;
}

export default function StatCard({ title, value, icon, change, trend, onClick }: StatCardProps) {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl p-6 shadow-sm border border-gray-200 
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:shadow-md hover:border-primary-200' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 font-numbers">
            {value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
              trend === 'up' ? 'text-success' : 'text-error'
            }`}>
              {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
