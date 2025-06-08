import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Package, 
  CheckCircle, 
  Clock, 
  User,
  Calendar,
  Filter,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { storage } from '../utils/storage';
import { auth } from '../utils/auth';
import { BorrowRequest } from '../types';
import { StatusBadge } from './StatusBadge';

interface ActivityItem {
  id: string;
  type: 'request' | 'approval' | 'checkout' | 'return' | 'rejection';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  component: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
}

interface ActivityFeedProps {
  maxItems?: number;
  showFilters?: boolean;
  compact?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  maxItems = 10, 
  showFilters = true,
  compact = false 
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'requests' | 'approvals' | 'returns'>('all');
  const [loading, setLoading] = useState(true);
  const currentUser = auth.getCurrentUser();

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadActivities = () => {
    setLoading(true);
    const requests = storage.getRequests();
    const activityItems: ActivityItem[] = [];

    requests.forEach(request => {
      // Request submission
      activityItems.push({
        id: `request_${request.id}`,
        type: 'request',
        title: 'Component Request Submitted',
        description: `${request.studentName} requested ${request.componentName} (${request.quantity} units)`,
        timestamp: request.requestDate,
        user: request.studentName,
        component: request.componentName,
        status: 'pending',
        priority: 'medium'
      });

      // Approval
      if (request.status === 'approved' && request.approvedDate) {
        activityItems.push({
          id: `approval_${request.id}`,
          type: 'approval',
          title: 'Request Approved',
          description: `${request.componentName} request approved for ${request.studentName}`,
          timestamp: request.approvedDate,
          user: request.approvedBy || 'Admin',
          component: request.componentName,
          status: 'approved',
          priority: 'high'
        });

        activityItems.push({
          id: `checkout_${request.id}`,
          type: 'checkout',
          title: 'Component Checked Out',
          description: `${request.studentName} checked out ${request.componentName} (${request.quantity} units)`,
          timestamp: request.approvedDate,
          user: request.studentName,
          component: request.componentName,
          status: 'approved',
          priority: 'medium'
        });
      }

      // Return
      if (request.status === 'returned' && request.returnedDate) {
        activityItems.push({
          id: `return_${request.id}`,
          type: 'return',
          title: 'Component Returned',
          description: `${request.studentName} returned ${request.componentName} (${request.quantity} units)`,
          timestamp: request.returnedDate,
          user: request.studentName,
          component: request.componentName,
          status: 'returned',
          priority: 'medium'
        });
      }

      // Rejection
      if (request.status === 'rejected') {
        activityItems.push({
          id: `rejection_${request.id}`,
          type: 'rejection',
          title: 'Request Rejected',
          description: `${request.componentName} request rejected for ${request.studentName}`,
          timestamp: request.requestDate,
          user: 'Admin',
          component: request.componentName,
          status: 'rejected',
          priority: 'low'
        });
      }
    });

    // Sort by timestamp (newest first)
    activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply filter
    let filteredActivities = activityItems;
    if (filter !== 'all') {
      filteredActivities = activityItems.filter(activity => {
        switch (filter) {
          case 'requests': return activity.type === 'request';
          case 'approvals': return activity.type === 'approval' || activity.type === 'checkout';
          case 'returns': return activity.type === 'return';
          default: return true;
        }
      });
    }

    setActivities(filteredActivities.slice(0, maxItems));
    setLoading(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'request': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'approval': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'checkout': return <Package className="w-5 h-5 text-blue-400" />;
      case 'return': return <CheckCircle className="w-5 h-5 text-teal-400" />;
      case 'rejection': return <Clock className="w-5 h-5 text-red-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Recent Activity</h3>
              <p className="text-sm text-gray-400">Live updates from the lab</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <span className="text-sm text-teal-400 font-medium">Live</span>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex space-x-2 mt-4">
            {[
              { key: 'all', label: 'All Activity' },
              { key: 'requests', label: 'Requests' },
              { key: 'approvals', label: 'Approvals' },
              { key: 'returns', label: 'Returns' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === key
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No recent activity</p>
            <p className="text-gray-500 text-sm mt-1">Activity will appear here as it happens</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-200 hover:bg-gray-700/30 ${
                  compact ? 'py-3' : 'py-4'
                } ${index === 0 ? 'bg-teal-900/20 border border-teal-700/30' : 'bg-gray-700/20'}`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 ${compact ? 'w-8 h-8' : 'w-10 h-10'} bg-gray-700/50 rounded-full flex items-center justify-center`}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>
                      {activity.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={activity.status as any} size="sm" />
                      {index === 0 && (
                        <span className="text-xs bg-teal-600 text-white px-2 py-1 rounded-full font-medium animate-pulse">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className={`text-gray-400 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{activity.user}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatTimestamp(activity.timestamp)}</span>
                      </div>
                    </div>
                    {activity.priority === 'high' && (
                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-medium">
                        Priority
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};