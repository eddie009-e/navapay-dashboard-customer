import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: number;
  trend?: 'up' | 'down';
  onClick?: () => void;
  variant?: 'default' | 'gradient' | 'glass';
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

const colorMap = {
  blue: {
    iconBg: 'bg-primary-50',
    iconText: 'text-primary',
    gradient: 'bg-gradient-to-l from-primary to-primary-400',
  },
  green: {
    iconBg: 'bg-accent-50',
    iconText: 'text-accent',
    gradient: 'bg-gradient-to-l from-accent-700 to-accent',
  },
  orange: {
    iconBg: 'bg-orange-50',
    iconText: 'text-orange-600',
    gradient: 'bg-gradient-to-l from-orange-600 to-orange-400',
  },
  purple: {
    iconBg: 'bg-purple-50',
    iconText: 'text-purple-600',
    gradient: 'bg-gradient-to-l from-purple-700 to-purple-500',
  },
};

export default function StatCard({
  title, value, icon, change, trend, onClick,
  variant = 'default', color = 'blue'
}: StatCardProps) {
  const isClickable = !!onClick;
  const colors = colorMap[color];

  if (variant === 'gradient') {
    return (
      <div
        onClick={onClick}
        className={`
          ${colors.gradient} rounded-2xl p-6 shadow-stat text-white
          transition-all duration-300
          ${isClickable ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
            <p className="text-2xl md:text-3xl font-bold font-numbers">
              {value}
            </p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-sm font-medium text-white/90`}>
                {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`
        glass-card p-6
        transition-all duration-300
        ${isClickable ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 font-numbers">
            {value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
              trend === 'up' ? 'text-accent' : 'text-error'
            }`}>
              {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 ${colors.iconBg} rounded-xl flex items-center justify-center ${colors.iconText}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
