import { User, Component, BorrowRequest, Transaction } from '../types';

const STORAGE_KEYS = {
  USERS: 'isaac_lab_users',
  COMPONENTS: 'isaac_lab_components',
  REQUESTS: 'isaac_lab_requests',
  TRANSACTIONS: 'isaac_lab_transactions',
  CURRENT_USER: 'isaac_lab_current_user'
};

// Default data
const defaultComponents: Component[] = [
  {
    id: '1',
    name: 'Arduino Uno R3',
    category: 'Microcontroller',
    description: 'Open-source microcontroller board',
    available: 15,
    total: 20,
    location: 'Shelf A1'
  },
  {
    id: '2',
    name: 'Raspberry Pi 4',
    category: 'Single Board Computer',
    description: '4GB RAM variant',
    available: 8,
    total: 12,
    location: 'Shelf A2'
  },
  {
    id: '3',
    name: 'Ultrasonic Sensor HC-SR04',
    category: 'Sensor',
    description: 'Distance measuring sensor',
    available: 25,
    total: 30,
    location: 'Drawer B1'
  },
  {
    id: '4',
    name: 'PIR Motion Sensor',
    category: 'Sensor',
    description: 'Passive infrared motion detector',
    available: 12,
    total: 15,
    location: 'Drawer B2'
  },
  {
    id: '5',
    name: 'L298N Motor Driver',
    category: 'Motor Controller',
    description: 'Dual H-bridge motor driver',
    available: 18,
    total: 25,
    location: 'Drawer C1'
  },
  {
    id: '6',
    name: 'ESP32 DevKit',
    category: 'Microcontroller',
    description: 'WiFi and Bluetooth enabled MCU',
    available: 10,
    total: 15,
    location: 'Shelf A3'
  },
  {
    id: '7',
    name: 'Servo Motor SG90',
    category: 'Actuator',
    description: '9g micro servo motor',
    available: 20,
    total: 30,
    location: 'Drawer C2'
  },
  {
    id: '8',
    name: 'Breadboard 830 Points',
    category: 'Prototyping',
    description: 'Solderless breadboard',
    available: 25,
    total: 35,
    location: 'Shelf D1'
  }
];

const defaultAdmin: User = {
  id: 'admin_001',
  name: 'Lab Administrator',
  email: 'admin@issacasimov.in',
  role: 'admin',
  lastLogin: new Date().toISOString(),
  joinedDate: '2024-01-01T00:00:00.000Z'
};

export const storage = {
  // Users
  getUsers(): User[] {
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!stored) {
      const users = [defaultAdmin];
      this.saveUsers(users);
      return users;
    }
    return JSON.parse(stored);
  },

  saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
  },

  updateUser(updatedUser: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      this.saveUsers(users);
    }
  },

  // Components
  getComponents(): Component[] {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPONENTS);
    if (!stored) {
      this.saveComponents(defaultComponents);
      return defaultComponents;
    }
    return JSON.parse(stored);
  },

  saveComponents(components: Component[]): void {
    localStorage.setItem(STORAGE_KEYS.COMPONENTS, JSON.stringify(components));
  },

  updateComponent(updatedComponent: Component): void {
    const components = this.getComponents();
    const index = components.findIndex(c => c.id === updatedComponent.id);
    if (index !== -1) {
      components[index] = updatedComponent;
      this.saveComponents(components);
    }
  },

  addComponent(component: Component): void {
    const components = this.getComponents();
    components.push(component);
    this.saveComponents(components);
  },

  deleteComponent(componentId: string): void {
    const components = this.getComponents();
    const filtered = components.filter(c => c.id !== componentId);
    this.saveComponents(filtered);
  },

  // Requests
  getRequests(): BorrowRequest[] {
    const stored = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return stored ? JSON.parse(stored) : [];
  },

  saveRequests(requests: BorrowRequest[]): void {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  },

  addRequest(request: BorrowRequest): void {
    const requests = this.getRequests();
    requests.push(request);
    this.saveRequests(requests);
  },

  updateRequest(updatedRequest: BorrowRequest): void {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === updatedRequest.id);
    if (index !== -1) {
      requests[index] = updatedRequest;
      this.saveRequests(requests);
    }
  },

  // Transactions
  getTransactions(): Transaction[] {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return stored ? JSON.parse(stored) : [];
  },

  saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  addTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    transactions.push(transaction);
    this.saveTransactions(transactions);
  },

  // Current User
  getCurrentUser(): User | null {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Clear all data
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};