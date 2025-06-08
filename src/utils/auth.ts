import { User } from '../types';
import { storage } from './storage';

export const auth = {
  login(email: string, password: string): User | null {
    const users = storage.getUsers();
    
    // Check if admin with personal credentials
    if (email === 'admin@issacasimov.in' && password === 'ralab') {
      const admin = users.find(u => u.email === email && u.role === 'admin');
      if (admin) {
        // Update last login
        admin.lastLogin = new Date().toISOString();
        storage.updateUser(admin);
        storage.setCurrentUser(admin);
        return admin;
      }
    }
    
    // Check if student
    if (email.endsWith('@issacasimov.in') && password === 'issacasimov') {
      let student = users.find(u => u.email === email && u.role === 'student');
      
      if (!student) {
        // Create new student user
        const name = email.split('@')[0];
        student = {
          id: `student_${Date.now()}`,
          name: name,
          email: email,
          role: 'student',
          lastLogin: new Date().toISOString(),
          joinedDate: new Date().toISOString()
        };
        storage.addUser(student);
      } else {
        // Update last login
        student.lastLogin = new Date().toISOString();
        storage.updateUser(student);
      }
      
      storage.setCurrentUser(student);
      return student;
    }
    
    return null;
  },

  logout(): void {
    storage.setCurrentUser(null);
  },

  getCurrentUser(): User | null {
    return storage.getCurrentUser();
  },

  isAuthenticated(): boolean {
    return storage.getCurrentUser() !== null;
  },

  isAdmin(): boolean {
    const user = storage.getCurrentUser();
    return user?.role === 'admin';
  },

  isStudent(): boolean {
    const user = storage.getCurrentUser();
    return user?.role === 'student';
  }
};