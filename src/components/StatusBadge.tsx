import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  Package, 
  AlertCircle, 
  XCircle,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'returned' | 'rejected' | 'overdue';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  animated?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  showIcon = true,
  animated = false 
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          textColor: 'text-white',
          icon: Clock,
          label: 'Pending Review',
          borderColor: 'border-yellow-500/30',
          glowColor: 'shadow-yellow-500/20'
        };
      case 'approved':
        return {
          color: 'bg-gradient-to-r from-green-500 to-emerald-500',
          textColor: 'text-white',
          icon: CheckCircle,
          label: 'Approved',
          borderColor: 'border-green-500/30',
          glowColor: 'shadow-green-500/20'
        };
      case 'returned':
        return {
          color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          textColor: 'text-white',
          icon: Package,
          label: 'Returned',
          borderColor: 'border-blue-500/30',
          glowColor: 'shadow-blue-500/20'
        };
      case 'rejected':
        return {
          color: 'bg-gradient-to-r from-red-500 to-pink-500',
          textColor: 'text-white',
          icon: XCircle,
          label: 'Rejected',
          borderColor: 'border-red-500/30',
          glowColor: 'shadow-red-500/20'
        };
      case 'overdue':
        return {
          color: 'bg-gradient-to-r from-red-600 to-red-700',
          textColor: 'text-white',
          icon: AlertCircle,
          label: 'Overdue',
          borderColor: 'border-red-600/30',
          glowColor: 'shadow-red-600/20'
        };
      default:
        return {
          color: 'bg-gradient-to-r from-gray-500 to-gray-600',
          textColor: 'text-white',
          icon: Calendar,
          label: 'Unknown',
          borderColor: 'border-gray-500/30',
          glowColor: 'shadow-gray-500/20'
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
          spacing: 'space-x-1'
        };
      case 'lg':
        return {
          container: 'px-4 py-2 text-base',
          icon: 'w-5 h-5',
          spacing: 'space-x-2'
        };
      default: // md
        return {
          container: 'px-3 py-1.5 text-sm',
          icon: 'w-4 h-4',
          spacing: 'space-x-1.5'
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full border
        ${config.color} ${config.textColor} ${config.borderColor}
        ${sizeClasses.container} ${sizeClasses.spacing}
        ${animated ? 'animate-pulse' : ''}
        shadow-lg ${config.glowColor}
        transition-all duration-200 hover:scale-105
      `}
    >
      {showIcon && <Icon className={sizeClasses.icon} />}
      <span>{config.label}</span>
    </span>
  );
};