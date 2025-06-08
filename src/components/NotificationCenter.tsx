import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle, 
  Clock, 
  Package, 
  AlertTriangle,
  User,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { auth } from '../utils/auth';
import { storage } from '../utils/storage';
import { BorrowRequest } from '../types';

interface Notification {
  id: string;
  type: 'checkout' | 'return' | 'approval' | 'rejection' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  requestId?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationCenterProps {
  onNotificationUpdate?: (count: number) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNotificationUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUser = auth.getCurrentUser();

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
    onNotificationUpdate?.(count);
  }, [notifications, onNotificationUpdate]);

  const loadNotifications = () => {
    if (!currentUser) return;

    const requests = storage.getRequests();
    const userNotifications: Notification[] = [];

    if (currentUser.role === 'admin') {
      // Admin notifications
      const pendingRequests = requests.filter(r => r.status === 'pending');
      const overdueRequests = requests.filter(r => {
        if (r.status !== 'approved') return false;
        const dueDate = new Date(r.dueDate);
        const today = new Date();
        return dueDate < today;
      });

      // Pending approval notifications
      pendingRequests.forEach(request => {
        userNotifications.push({
          id: `pending_${request.id}`,
          type: 'approval',
          title: 'New Component Request',
          message: `${request.studentName} requested ${request.componentName} (${request.quantity} units)`,
          timestamp: request.requestDate,
          read: false,
          requestId: request.id,
          priority: 'high'
        });
      });

      // Overdue notifications
      overdueRequests.forEach(request => {
        userNotifications.push({
          id: `overdue_${request.id}`,
          type: 'reminder',
          title: 'Overdue Component',
          message: `${request.studentName} has overdue ${request.componentName} (Due: ${new Date(request.dueDate).toLocaleDateString()})`,
          timestamp: request.dueDate,
          read: false,
          requestId: request.id,
          priority: 'high'
        });
      });

      // Recent checkouts (last 24 hours)
      const recentCheckouts = requests.filter(r => {
        if (r.status !== 'approved' || !r.approvedDate) return false;
        const approvedDate = new Date(r.approvedDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return approvedDate > yesterday;
      });

      recentCheckouts.forEach(request => {
        userNotifications.push({
          id: `checkout_${request.id}`,
          type: 'checkout',
          title: 'Component Checked Out',
          message: `${request.studentName} checked out ${request.componentName} (${request.quantity} units)`,
          timestamp: request.approvedDate!,
          read: false,
          requestId: request.id,
          priority: 'medium'
        });
      });

      // Recent returns (last 24 hours)
      const recentReturns = requests.filter(r => {
        if (r.status !== 'returned' || !r.returnedDate) return false;
        const returnedDate = new Date(r.returnedDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return returnedDate > yesterday;
      });

      recentReturns.forEach(request => {
        userNotifications.push({
          id: `return_${request.id}`,
          type: 'return',
          title: 'Component Returned',
          message: `${request.studentName} returned ${request.componentName} (${request.quantity} units)`,
          timestamp: request.returnedDate!,
          read: false,
          requestId: request.id,
          priority: 'medium'
        });
      });

    } else {
      // Student notifications
      const userRequests = requests.filter(r => r.studentId === currentUser.id);

      userRequests.forEach(request => {
        // Approval notifications
        if (request.status === 'approved' && request.approvedDate) {
          userNotifications.push({
            id: `approved_${request.id}`,
            type: 'approval',
            title: 'Request Approved!',
            message: `Your request for ${request.componentName} has been approved. ${request.adminNotes || 'Please collect from the lab.'}`,
            timestamp: request.approvedDate,
            read: false,
            requestId: request.id,
            priority: 'high'
          });
        }

        // Rejection notifications
        if (request.status === 'rejected') {
          userNotifications.push({
            id: `rejected_${request.id}`,
            type: 'rejection',
            title: 'Request Rejected',
            message: `Your request for ${request.componentName} was rejected. ${request.adminNotes || 'Please contact admin for details.'}`,
            timestamp: request.requestDate,
            read: false,
            requestId: request.id,
            priority: 'medium'
          });
        }

        // Due date reminders
        if (request.status === 'approved') {
          const dueDate = new Date(request.dueDate);
          const today = new Date();
          const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

          if (daysDiff <= 2 && daysDiff >= 0) {
            userNotifications.push({
              id: `reminder_${request.id}`,
              type: 'reminder',
              title: 'Return Reminder',
              message: `${request.componentName} is due ${daysDiff === 0 ? 'today' : `in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`}`,
              timestamp: new Date().toISOString(),
              read: false,
              requestId: request.id,
              priority: daysDiff === 0 ? 'high' : 'medium'
            });
          }
        }
      });
    }

    // Sort by timestamp (newest first) and priority
    userNotifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    setNotifications(userNotifications.slice(0, 20)); // Limit to 20 notifications
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'checkout': return <Package className="w-5 h-5 text-blue-400" />;
      case 'return': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'approval': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejection': return <X className="w-5 h-5 text-red-400" />;
      case 'reminder': return <Clock className="w-5 h-5 text-yellow-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-900/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-900/20';
      case 'low': return 'border-l-blue-500 bg-blue-900/20';
      default: return 'border-l-gray-500 bg-gray-900/20';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-all duration-200 border border-gray-600/50 hover:border-gray-500/50"
      >
        <Bell className="w-6 h-6 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-gray-800/95 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Notifications</h3>
                  <p className="text-sm text-gray-400">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-teal-400 hover:text-teal-300 font-medium transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">No notifications yet</p>
                  <p className="text-gray-500 text-sm mt-1">You'll see updates here</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-4 rounded-xl mb-2 border-l-4 cursor-pointer transition-all duration-200 hover:bg-gray-700/30 ${
                        getPriorityColor(notification.priority)
                      } ${!notification.read ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-semibold ${
                              !notification.read ? 'text-white' : 'text-gray-300'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${
                            !notification.read ? 'text-gray-300' : 'text-gray-400'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.priority === 'high' && (
                              <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-medium">
                                Urgent
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm text-teal-400 hover:text-teal-300 font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Close notifications</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};