export interface User {
    email: string;
    role: 'Admin' | 'User';
  }
  
  export interface AuthState {
    user: User | null;
    isLoading: boolean;
  }