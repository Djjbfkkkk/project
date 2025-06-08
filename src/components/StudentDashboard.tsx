import React, { useState, useEffect } from 'react';
import { User, Package, Calendar, Phone, LogOut, Plus, Clock, CheckCircle, AlertCircle, Award, TrendingUp } from 'lucide-react';
import { auth } from '../utils/auth';
import { storage } from '../utils/storage';
import { showNotification } from '../utils/notifications';
import { BorrowRequest, Component } from '../types';
import { NotificationCenter } from './NotificationCenter';
import { StatusBadge } from './StatusBadge';

interface StudentDashboardProps {
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('request');
  const [components, setComponents] = useState<Component[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Form state
  const [selectedComponent, setSelectedComponent] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [rollNo, setRollNo] = useState('');
  const [mobile, setMobile] = useState('');
  const [dueDate, setDueDate] = useState('');

  const currentUser = auth.getCurrentUser();

  useEffect(() => {
    loadData();
    // Pre-fill user data if available
    if (currentUser?.rollNo) setRollNo(currentUser.rollNo);
    if (currentUser?.mobile) setMobile(currentUser.mobile);
  }, []);

  const loadData = () => {
    setComponents(storage.getComponents());
    const allRequests = storage.getRequests();
    setRequests(allRequests.filter(r => r.studentId === currentUser?.id));
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);

    try {
      const component = components.find(c => c.id === selectedComponent);
      if (!component) {
        showNotification('Please select a valid component', 'error');
        return;
      }

      if (quantity > component.available) {
        showNotification(`Only ${component.available} units available`, 'error');
        return;
      }

      const newRequest: BorrowRequest = {
        id: `req_${Date.now()}`,
        studentId: currentUser.id,
        studentName: currentUser.name,
        rollNo,
        mobile,
        componentId: component.id,
        componentName: component.name,
        quantity,
        requestDate: new Date().toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        status: 'pending',
        adminNotes: ''
      };

      storage.addRequest(newRequest);
      
      // Update user info if provided
      if (rollNo || mobile) {
        const updatedUser = { ...currentUser };
        if (rollNo) updatedUser.rollNo = rollNo;
        if (mobile) updatedUser.mobile = mobile;
        storage.updateUser(updatedUser);
      }

      loadData();
      
      // Reset form
      setSelectedComponent('');
      setQuantity(1);
      setDueDate('');
      
      showNotification('Request submitted successfully! Admin will review shortly.', 'success');
      setActiveTab('status');
    } catch (error) {
      showNotification('Failed to submit request. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    onLogout();
  };

  const currentlyBorrowed = requests.filter(r => r.status === 'approved').length;
  const totalBorrowed = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const approvedRequests = requests.filter(r => r.status === 'approved' || r.status === 'returned').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900">
      {/* Header */}
      <header className="bg-gray-800/60 backdrop-blur-lg border-b border-gray-700/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Student Portal</h1>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Currently Borrowed</p>
                <p className="text-3xl font-bold text-white">{currentlyBorrowed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Total Approved</p>
                <p className="text-3xl font-bold text-white">{approvedRequests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Pending Requests</p>
                <p className="text-3xl font-bold text-white">{pendingRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Total Requests</p>
                <p className="text-3xl font-bold text-white">{totalBorrowed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-gray-700/50 mb-8 shadow-xl">
          <div className="flex flex-wrap">
            {[
              { id: 'request', label: 'Submit Request', icon: Plus },
              { id: 'status', label: 'My Requests', icon: Package },
              { id: 'history', label: 'History', icon: Calendar },
              { id: 'contact', label: 'Contact Admin', icon: Phone }
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
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-xl">
          {activeTab === 'request' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Submit Component Request</h2>
              <form onSubmit={handleSubmitRequest} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 font-medium"
                      placeholder="Enter your Name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 font-medium"
                      placeholder="Enter your mobile number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Component *
                  </label>
                  <select
                    value={selectedComponent}
                    onChange={(e) => setSelectedComponent(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 font-medium"
                    required
                  >
                    <option value="">Select a component</option>
                    {components.filter(c => c.available > 0).map(component => (
                      <option key={component.id} value={component.id}>
                        {component.name} (Available: {component.available})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      min="1"
                      max={components.find(c => c.id === selectedComponent)?.available || 1}
                      className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 font-medium"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold py-4 px-8 rounded-xl hover:from-blue-600 hover:to-teal-600 focus:ring-2 focus:ring-teal-500 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {loading ? 'Submitting Request...' : 'Submit Component Request'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'status' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">My Current Requests</h2>
              <div className="space-y-6">
                {requests.filter(r => r.status !== 'returned').map(request => (
                  <div key={request.id} className="bg-gray-700/50 rounded-2xl p-8 border border-gray-600/50 shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <h3 className="text-xl font-bold text-white">{request.componentName}</h3>
                          <StatusBadge 
                            status={request.status} 
                            animated={request.status === 'pending'} 
                          />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                          <div>
                            <p className="text-gray-400 font-medium">Quantity</p>
                            <p className="text-white font-bold text-lg">{request.quantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Requested</p>
                            <p className="text-white font-bold text-lg">{new Date(request.requestDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Due Date</p>
                            <p className="text-white font-bold text-lg">{new Date(request.dueDate).toLocaleDateString()}</p>
                          </div>
                          {request.approvedDate && (
                            <div>
                              <p className="text-gray-400 font-medium">Approved</p>
                              <p className="text-white font-bold text-lg">{new Date(request.approvedDate).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                        {request.adminNotes && request.status === 'approved' && (
                          <div className="mt-6 p-4 bg-teal-900/40 border border-teal-700/50 rounded-xl">
                            <p className="text-sm text-teal-300 font-medium">
                              <strong>Admin Instructions:</strong> {request.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {requests.filter(r => r.status !== 'returned').length === 0 && (
                  <div className="text-center py-16">
                    <Package className="w-20 h-20 text-gray-500 mx-auto mb-6" />
                    <p className="text-gray-400 text-xl font-medium">No active requests</p>
                    <p className="text-gray-500 text-sm mt-2">Submit a request to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Borrowing History</h2>
              <div className="space-y-6">
                {requests.map(request => (
                  <div key={request.id} className="bg-gray-700/50 rounded-2xl p-8 border border-gray-600/50 shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <h3 className="text-xl font-bold text-white">{request.componentName}</h3>
                          <StatusBadge status={request.status} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                          <div>
                            <p className="text-gray-400 font-medium">Quantity</p>
                            <p className="text-white font-bold text-lg">{request.quantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Requested</p>
                            <p className="text-white font-bold text-lg">{new Date(request.requestDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Due Date</p>
                            <p className="text-white font-bold text-lg">{new Date(request.dueDate).toLocaleDateString()}</p>
                          </div>
                          {request.returnedDate && (
                            <div>
                              <p className="text-gray-400 font-medium">Returned</p>
                              <p className="text-white font-bold text-lg">{new Date(request.returnedDate).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {requests.length === 0 && (
                  <div className="text-center py-16">
                    <Calendar className="w-20 h-20 text-gray-500 mx-auto mb-6" />
                    <p className="text-gray-400 text-xl font-medium">No history yet</p>
                    <p className="text-gray-500 text-sm mt-2">Your borrowing history will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Contact Lab Administrator</h2>
              <div className="bg-gray-700/50 rounded-2xl p-8 border border-gray-600/50 shadow-lg">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">Isaac Asimov Robotics Laboratory</h3>
                    <p className="text-teal-300 text-lg font-medium">Lab Administrator</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Phone className="w-6 h-6 text-teal-400" />
                      <span className="text-white text-lg font-medium">+91 98765 43210</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <User className="w-6 h-6 text-teal-400" />
                      <span className="text-white text-lg font-medium">letsmaildilip@gmail.com</span>
                    </div>
                  </div>
                  <div className="mt-8 p-6 bg-teal-900/40 border border-teal-700/50 rounded-xl">
                    <p className="text-teal-300 font-medium">
                      <strong>Lab Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM<br />
                      <strong>Location:</strong> Robotics Laboratory, 2nd Floor, Engineering Block<br />
                      <strong>Emergency Contact:</strong> Available during lab hours for urgent requests
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};