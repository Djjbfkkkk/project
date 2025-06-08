export interface User {
  id: string;
  name: string;
  email: string;
  rollNo?: string;
  mobile?: string;
  role: 'student' | 'admin';
  lastLogin: string;
  joinedDate: string;
}

export interface Component {
  id: string;
  name: string;
  category: string;
  description: string;
  available: number;
  total: number;
  location?: string;
}

export interface BorrowRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  mobile: string;
  componentId: string;
  componentName: string;
  quantity: number;
  requestDate: string;
  dueDate: string;
  status: 'pending' | 'approved' | 'returned' | 'rejected' | 'overdue';
  approvedDate?: string;
  returnedDate?: string;
  adminNotes: string;
  approvedBy?: string;
}

export interface Transaction {
  id: string;
  type: 'borrow' | 'return';
  studentId: string;
  studentName: string;
  componentId: string;
  componentName: string;
  quantity: number;
  timestamp: string;
  notes?: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  components: Component[];
  requests: BorrowRequest[];
  transactions: Transaction[];
}