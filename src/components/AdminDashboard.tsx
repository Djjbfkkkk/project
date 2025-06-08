import React, { useState, useEffect } from 'react';
import { 
  Settings, Package, Users, Clock, CheckCircle, AlertCircle, 
  Plus, Edit, Trash2, LogOut, Search, Filter, Download,
  BarChart3, TrendingUp, Calendar, User, Phone, Mail
} from 'lucide-react';
import { auth } from '../utils/auth';
import { storage } from '../utils/storage';
import { showNotification } from '../utils/notifications';
import { BorrowRequest, Component, User as UserType } from '../types';
import { NotificationCenter } from './NotificationCenter';
import { ActivityFeed } from './ActivityFeed';
import { StatusBadge } from './StatusBadge';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [components, setComponents] = useState<Component[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notificationCount, setNotificationCount] = useState(0);
  

  // Component form state
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [componentForm, setComponentForm] = useState({
    name: '',
    category: '',
    description: '',
    available: 0,
    total: 0,
    location: ''
  });

  const currentUser = auth.getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setComponents(storage.getComponents());
    setRequests(storage.getRequests());
    setUsers(storage.getUsers().filter(u => u.role === 'student'));
  };

  const handleApproveRequest = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const component = components.find(c => c.id === request.componentId);
    if (!component || component.available < request.quantity) {
      showNotification('Insufficient component availability', 'error');
      return;
    }

    // Update request status
    const updatedRequest = {
      ...request,
      status: 'approved' as const,
      approvedDate: new Date().toISOString(),
      approvedBy: currentUser?.name,
      adminNotes: 'Come and get in Robotics lab'
    };
    storage.updateRequest(updatedRequest);

    // Update component availability
    const updatedComponent = {
      ...component,
      available: component.available - request.quantity
    };
    storage.updateComponent(updatedComponent);

    loadData();
    showNotification(`Request approved for ${request.studentName}`, 'success');
  };

  const handleRejectRequest = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const updatedRequest = {
      ...request,
      status: 'rejected' as const,
      adminNotes: 'Request rejected by administrator'
    };
    storage.updateRequest(updatedRequest);

    loadData();
    showNotification(`Request rejected for ${request.studentName}`, 'info');
  };

  const handleReturnComponent = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const component = components.find(c => c.id === request.componentId);
    if (!component) return;

    // Update request status
    const updatedRequest = {
      ...request,
      status: 'returned' as const,
      returnedDate: new Date().toISOString()
    };
    storage.updateRequest(updatedRequest);

    // Update component availability
    const updatedComponent = {
      ...component,
      available: component.available + request.quantity
    };
    storage.updateComponent(updatedComponent);

    loadData();
    showNotification(`Component returned by ${request.studentName}`, 'success');
  };

  const handleAddComponent = () => {
    if (!componentForm.name || !componentForm.category) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    const newComponent: Component = {
      id: `comp_${Date.now()}`,
      ...componentForm
    };

    storage.addComponent(newComponent);
    loadData();
    setShowAddComponent(false);
    setComponentForm({
      name: '',
      category: '',
      description: '',
      available: 0,
      total: 0,
      location: ''
    });
    showNotification('Component added successfully', 'success');
  };

  const handleEditComponent = (component: Component) => {
    setEditingComponent(component);
    setComponentForm({
      name: component.name,
      category: component.category,
      description: component.description,
      available: component.available,
      total: component.total,
      location: component.location || ''
    });
    setShowAddComponent(true);
  };

  const handleUpdateComponent = () => {
    if (!editingComponent) return;

    const updatedComponent: Component = {
      ...editingComponent,
      ...componentForm
    };

    storage.updateComponent(updatedComponent);
    loadData();
    setShowAddComponent(false);
    setEditingComponent(null);
    setComponentForm({
      name: '',
      category: '',
      description: '',
      available: 0,
      total: 0,
      location: ''
    });
    showNotification('Component updated successfully', 'success');
  };

  const handleDeleteComponent = (componentId: string) => {
    if (confirm('Are you sure you want to delete this component?')) {
      storage.deleteComponent(componentId);
      loadData();
      showNotification('Component deleted successfully', 'success');
    }
  };

  const handleLogout = () => {
    auth.logout();
    onLogout();
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.componentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalComponents = components.reduce((sum, c) => sum + c.total, 0);
  const availableComponents = components.reduce((sum, c) => sum + c.available, 0);
  const borrowedComponents = totalComponents - availableComponents;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const activeUsers = users.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900">
      {/* Header */}
      <header className="bg-gray-800/60 backdrop-blur-lg border-b border-gray-700/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Settings className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-sm text-teal-300 font-medium">Isaac Asimov Robotics Laboratory</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <NotificationCenter onNotificationUpdate={setNotificationCount} />
              <div className="text-right">
                <p className="text-lg font-semibold text-white">{currentUser?.name}</p>
                <p className="text-sm text-gray-400">{currentUser?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-gray-700/50 mb-8 shadow-xl">
          <div className="flex flex-wrap">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'pending', label: 'Pending Requests', icon: Clock, count: pendingRequests },
              { id: 'checkout', label: 'Checkout/Return', icon: Package },
              { id: 'inventory', label: 'Inventory', icon: Package, count: components.length },
              { id: 'requests', label: 'All Requests', icon: Calendar, count: requests.length },
              { id: 'users', label: 'User Profiles', icon: Users, count: activeUsers }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-8 py-5 font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-teal-400 border-b-3 border-teal-400 bg-gray-700/50'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-6 shadow-lg backdrop-blur-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Package className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-300 font-semibold">Total Components</p>
                      <p className="text-3xl font-bold text-white">{totalComponents}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-600/20 border border-green-500/30 rounded-2xl p-6 shadow-lg backdrop-blur-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-green-300 font-semibold">Available</p>
                      <p className="text-3xl font-bold text-white">{availableComponents}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6 shadow-lg backdrop-blur-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-yellow-600 rounded-xl flex items-center justify-center">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-yellow-300 font-semibold">Pending Requests</p>
                      <p className="text-3xl font-bold text-white">{pendingRequests}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-600/20 border border-purple-500/30 rounded-2xl p-6 shadow-lg backdrop-blur-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-purple-300 font-semibold">Active Users</p>
                      <p className="text-3xl font-bold text-white">{activeUsers}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              <ActivityFeed maxItems={8} showFilters={true} />
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-xl">
              <h2 className="text-3xl font-bold text-white mb-8">Pending Requests</h2>
              <div className="space-y-6">
                {requests.filter(r => r.status === 'pending').map(request => (
                  <div key={request.id} className="bg-gray-700/50 rounded-2xl p-8 border border-gray-600/50 shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <Package className="w-8 h-8 text-teal-400" />
                          <h3 className="text-xl font-bold text-white">{request.componentName}</h3>
                          <StatusBadge status="pending" animated={true} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mb-6">
                          <div>
                            <p className="text-gray-400 font-medium">Student</p>
                            <p className="text-white font-bold">{request.studentName}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Roll No</p>
                            <p className="text-white font-bold">{request.rollNo}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Quantity</p>
                            <p className="text-white font-bold">{request.quantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Mobile</p>
                            <p className="text-white font-bold">{request.mobile}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 text-sm">
                          <div>
                            <p className="text-gray-400 font-medium">Requested</p>
                            <p className="text-white font-bold">{new Date(request.requestDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Due Date</p>
                            <p className="text-white font-bold">{new Date(request.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3 ml-6">
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {requests.filter(r => r.status === 'pending').length === 0 && (
                  <div className="text-center py-16">
                    <Clock className="w-20 h-20 text-gray-500 mx-auto mb-6" />
                    <p className="text-gray-400 text-xl font-medium">No pending requests</p>
                    <p className="text-gray-500 text-sm mt-2">All requests have been processed</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'checkout' && (
            <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-xl">
              <h2 className="text-3xl font-bold text-white mb-8">Checkout & Return Management</h2>
              <div className="space-y-6">
                {requests.filter(r => r.status === 'approved').map(request => (
                  <div key={request.id} className="bg-gray-700/50 rounded-2xl p-8 border border-gray-600/50 shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <Package className="w-8 h-8 text-green-400" />
                          <h3 className="text-xl font-bold text-white">{request.componentName}</h3>
                          <StatusBadge status="approved" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                          <div>
                            <p className="text-gray-400 font-medium">Student</p>
                            <p className="text-white font-bold">{request.studentName}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Roll No</p>
                            <p className="text-white font-bold">{request.rollNo}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Quantity</p>
                            <p className="text-white font-bold">{request.quantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Due Date</p>
                            <p className="text-white font-bold">{new Date(request.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleReturnComponent(request.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ml-6"
                      >
                        Mark as Returned
                      </button>
                    </div>
                  </div>
                ))}
                {requests.filter(r => r.status === 'approved').length === 0 && (
                  <div className="text-center py-16">
                    <Package className="w-20 h-20 text-gray-500 mx-auto mb-6" />
                    <p className="text-gray-400 text-xl font-medium">No components checked out</p>
                    <p className="text-gray-500 text-sm mt-2">All components are available in inventory</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">Inventory Management</h2>
                <button
                  onClick={() => setShowAddComponent(true)}
                  className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Component</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {components.map(component => (
                  <div key={component.id} className="bg-gray-700/50 rounded-2xl p-6 border border-gray-600/50 shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Package className="w-6 h-6 text-teal-400" />
                          <h3 className="text-lg font-bold text-white">{component.name}</h3>
                        </div>
                        <p className="text-teal-300 font-medium">{component.category}</p>
                        <p className="text-gray-400 text-sm mt-2">{component.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Available:</span>
                        <span className="text-green-400 font-bold text-lg">{component.available}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total:</span>
                        <span className="text-white font-bold text-lg">{component.total}</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(component.available / component.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditComponent(component)}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteComponent(component.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add/Edit Component Modal */}
              {showAddComponent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl">
                    <h3 className="text-2xl font-bold text-white mb-6">
                      {editingComponent ? 'Edit Component' : 'Add New Component'}
                    </h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Component Name"
                        value={componentForm.name}
                        onChange={(e) => setComponentForm({...componentForm, name: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="Category"
                        value={componentForm.category}
                        onChange={(e) => setComponentForm({...componentForm, category: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500"
                      />
                      <textarea
                        placeholder="Description"
                        value={componentForm.description}
                        onChange={(e) => setComponentForm({...componentForm, description: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 h-24 resize-none"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          placeholder="Available"
                          value={componentForm.available}
                          onChange={(e) => setComponentForm({...componentForm, available: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500"
                        />
                        <input
                          type="number"
                          placeholder="Total"
                          value={componentForm.total}
                          onChange={(e) => setComponentForm({...componentForm, total: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Location (optional)"
                        value={componentForm.location}
                        onChange={(e) => setComponentForm({...componentForm, location: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div className="flex space-x-4 mt-8">
                      <button
                        onClick={() => {
                          setShowAddComponent(false);
                          setEditingComponent(null);
                          setComponentForm({
                            name: '',
                            category: '',
                            description: '',
                            available: 0,
                            total: 0,
                            location: ''
                          });
                        }}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={editingComponent ? handleUpdateComponent : handleAddComponent}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200"
                      >
                        {editingComponent ? 'Update' : 'Add'} Component
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">All Component Requests</h2>
                <div className="flex space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by student or component"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 w-64"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="returned">Returned</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {filteredRequests.map(request => (
                  <div key={request.id} className="bg-gray-700/50 rounded-2xl p-8 border border-gray-600/50 shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <Package className="w-8 h-8 text-teal-400" />
                          <h3 className="text-xl font-bold text-white">{request.componentName}</h3>
                          <StatusBadge status={request.status} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mb-4">
                          <div>
                            <p className="text-gray-400 font-medium">Student</p>
                            <p className="text-white font-bold">{request.studentName}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Roll No</p>
                            <p className="text-white font-bold">{request.rollNo}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Quantity</p>
                            <p className="text-white font-bold">{request.quantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Mobile</p>
                            <p className="text-white font-bold">{request.mobile}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                          <div>
                            <p className="text-gray-400 font-medium">Requested</p>
                            <p className="text-white font-bold">{new Date(request.requestDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Due Date</p>
                            <p className="text-white font-bold">{new Date(request.dueDate).toLocaleDateString()}</p>
                          </div>
                          {request.approvedDate && (
                            <div>
                              <p className="text-gray-400 font-medium">Approved</p>
                              <p className="text-white font-bold">{new Date(request.approvedDate).toLocaleDateString()}</p>
                            </div>
                          )}
                          {request.returnedDate && (
                            <div>
                              <p className="text-gray-400 font-medium">Returned</p>
                              <p className="text-white font-bold">{new Date(request.returnedDate).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                        {request.adminNotes && request.status === 'approved' && (
                          <div className="mt-6 p-4 bg-teal-900/40 border border-teal-700/50 rounded-xl">
                            <p className="text-sm text-teal-300 font-medium">
                              <strong>Admin Notes:</strong> {request.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredRequests.length === 0 && (
                  <div className="text-center py-16">
                    <Calendar className="w-20 h-20 text-gray-500 mx-auto mb-6" />
                    <p className="text-gray-400 text-xl font-medium">No requests found</p>
                    <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-xl">
              <h2 className="text-3xl font-bold text-white mb-8">User Profiles & History</h2>
              <div className="space-y-6">
                {users.map(user => {
                  const userRequests = requests.filter(r => r.studentId === user.id);
                  const currentlyBorrowed = userRequests.filter(r => r.status === 'approved').length;
                  const totalBorrowed = userRequests.length;
                  const approvedRequests = userRequests.filter(r => r.status === 'approved' || r.status === 'returned').length;
                  const onTimeReturns = userRequests.filter(r => r.status === 'returned').length;

                  return (
                    <div key={user.id} className="bg-gray-700/50 rounded-2xl p-8 border border-gray-600/50 shadow-lg">
                      <div className="flex items-start space-x-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold text-white">{user.name}</h3>
                              <p className="text-gray-400">{user.rollNo || 'Roll No not provided'}</p>
                              <p className="text-teal-300 font-medium">{user.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-400 text-sm">Last Login</p>
                              <p className="text-white font-bold">{new Date(user.lastLogin).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                            <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4">
                              <div className="flex items-center space-x-3">
                                <Package className="w-6 h-6 text-blue-400" />
                                <div>
                                  <p className="text-blue-300 font-semibold">Currently Borrowed</p>
                                  <p className="text-2xl font-bold text-white">{currentlyBorrowed}</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4">
                              <div className="flex items-center space-x-3">
                                <TrendingUp className="w-6 h-6 text-green-400" />
                                <div>
                                  <p className="text-green-300 font-semibold">Total Borrowed</p>
                                  <p className="text-2xl font-bold text-white">{totalBorrowed}</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-4">
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-6 h-6 text-purple-400" />
                                <div>
                                  <p className="text-purple-300 font-semibold">Approved</p>
                                  <p className="text-2xl font-bold text-white">{approvedRequests}</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-teal-600/20 border border-teal-500/30 rounded-xl p-4">
                              <div className="flex items-center space-x-3">
                                <Calendar className="w-6 h-6 text-teal-400" />
                                <div>
                                  <p className="text-teal-300 font-semibold">On Time</p>
                                  <p className="text-2xl font-bold text-white">{onTimeReturns}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-lg font-bold text-white mb-4">Recent Activity</h4>
                            <div className="space-y-2">
                              {userRequests.slice(0, 3).map(request => (
                                <div key={request.id} className="flex items-center justify-between bg-gray-600/30 rounded-lg p-3">
                                  <div>
                                    <p className="text-white font-medium">{request.componentName}</p>
                                    <p className="text-gray-400 text-sm">{new Date(request.requestDate).toLocaleDateString()}</p>
                                  </div>
                                  <StatusBadge status={request.status} size="sm" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {users.length === 0 && (
                  <div className="text-center py-16">
                    <Users className="w-20 h-20 text-gray-500 mx-auto mb-6" />
                    <p className="text-gray-400 text-xl font-medium">No student users yet</p>
                    <p className="text-gray-500 text-sm mt-2">Student profiles will appear here after they register</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};