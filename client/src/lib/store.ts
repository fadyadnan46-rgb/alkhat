import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
  email?: string;
  password?: string;
  profilePicture?: string;
}

export interface Car {
  id: string;
  vin: string;
  lot: string;
  year: number;
  make: string;
  model: string;
  fuelType?: string;
  destination: string;
  status?: string;
  auction?: string;
  branch?: string;
  hasTitle: boolean;
  hasKey: boolean;
  note: string;
  adminNote?: string;
  assignedToUserId?: string;
  
  // Logistics
  containerNumber?: string;
  bookingNumber?: string;
  etd?: string;
  eta?: string;
  
  // Photos (stored as JSON in DB)
  loadingPhotos?: string[]; 
  unloadingPhotos?: string[]; 
  warehousePhotos?: string[];
  auctionPhotos?: string[];
  
  // Invoices (stored as JSON array in DB)
  invoices?: string[]; 
}

// Configuration
export interface SystemConfig {
  makes: string[];
  models: Record<string, string[]>; 
  destinations: string[];
  auctions: string[];
  branches: string[];
}

interface AppState {
  currentUser: User | null;
  users: User[];
  cars: Car[];
  config: SystemConfig;
  
  // Init methods to load data from backend
  initializeApp: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  fetchUsers: () => Promise<void>;
  fetchCars: () => Promise<void>;
  fetchConfig: () => Promise<void>;
  
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  uploadProfilePicture: (userId: string, file: File) => Promise<void>;
  addCar: (car: Omit<Car, 'id'>) => Promise<{ success: boolean; error?: string; code?: string }>;
  updateCar: (id: string, updates: Partial<Car>) => Promise<void>;
  deleteCar: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Config actions
  addMake: (make: string) => Promise<void>;
  deleteMake: (make: string) => Promise<void>;
  addModel: (make: string, model: string) => Promise<void>;
  deleteModel: (make: string, model: string) => Promise<void>;
  addDestination: (dest: string) => Promise<void>;
  deleteDestination: (dest: string) => Promise<void>;
  addAuction: (auction: string) => Promise<void>;
  deleteAuction: (auction: string) => Promise<void>;
  addBranch: (branch: string) => Promise<void>;
  deleteBranch: (branch: string) => Promise<void>;
  
  sendUpdateEmail: (carId: string) => void;
}

const API_BASE = '/api';

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      cars: [],
      config: { makes: [], models: {}, destinations: [], auctions: [], branches: [] },

      // Initialize app by fetching all data
      initializeApp: async () => {
        await Promise.all([
          get().fetchUsers(),
          get().fetchCars(),
          get().fetchConfig(),
        ]);
      },

      // Check if user session is still valid on the server
      checkAuth: async () => {
        try {
          const res = await fetch(`${API_BASE}/auth/me`);
          if (res.ok) {
            const { user } = await res.json();
            set({ currentUser: user });
            // Re-fetch all data to ensure fresh state
            await get().initializeApp();
            return true;
          } else {
            // Session is invalid, clear local state
            set({ currentUser: null, users: [], cars: [], config: { makes: [], models: {}, destinations: [], auctions: [], branches: [] } });
            return false;
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ currentUser: null, users: [], cars: [], config: { makes: [], models: {}, destinations: [], auctions: [], branches: [] } });
          return false;
        }
      },

      fetchUsers: async () => {
        try {
          const res = await fetch(`${API_BASE}/users`);
          if (res.ok) {
            const users = await res.json();
            set({ users });
          }
        } catch (error) {
          console.error('Failed to fetch users:', error);
        }
      },

      fetchCars: async () => {
        try {
          const res = await fetch(`${API_BASE}/vehicles`);
          if (res.ok) {
            const cars = await res.json();
            set({ cars });
          }
        } catch (error) {
          console.error('Failed to fetch vehicles:', error);
        }
      },

      fetchConfig: async () => {
        try {
          const res = await fetch(`${API_BASE}/config`);
          if (res.ok) {
            const configData = await res.json();
            
            // Transform flat config to the format the frontend expects
            const makes = configData.makes || [];
            const models = configData.models || {};
            const destinations = configData.destinations || [];
            const auctions = configData.auctions || [];
            const branches = configData.branches || [];
            
            set({ config: { makes, models, destinations, auctions, branches } });
          }
        } catch (error) {
          console.error('Failed to fetch config:', error);
        }
      },

      login: async (username, password) => {
        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
          
          if (res.ok) {
            const { user } = await res.json();
            set({ currentUser: user });
            // Fetch all data after successful login
            await get().initializeApp();
            return true;
          }
          return false;
        } catch (error) {
          console.error('Login failed:', error);
          return false;
        }
      },

      logout: async () => {
        try {
          await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
        } catch (error) {
          console.error('Logout failed:', error);
        } finally {
          set({ currentUser: null, users: [], cars: [], config: { makes: [], models: {}, destinations: [], auctions: [], branches: [] } });
        }
      },

      addUser: async (user) => {
        try {
          const res = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
          });
          
          if (res.ok) {
            const newUser = await res.json();
            set((state) => ({ users: [...state.users, newUser] }));
          }
        } catch (error) {
          console.error('Failed to add user:', error);
        }
      },

      updateUser: async (id, updates) => {
        try {
          const res = await fetch(`${API_BASE}/users/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          
          if (res.ok) {
            const updatedUser = await res.json();
            set((state) => ({
              users: state.users.map(u => u.id === id ? updatedUser : u),
              currentUser: state.currentUser?.id === id ? updatedUser : state.currentUser
            }));
          }
        } catch (error) {
          console.error('Failed to update user:', error);
        }
      },

      uploadProfilePicture: async (userId, file) => {
        try {
          const formData = new FormData();
          formData.append('profilePicture', file);
          
          const res = await fetch(`${API_BASE}/users/${userId}/profile-picture`, {
            method: 'POST',
            body: formData,
          });
          
          if (res.ok) {
            const updatedUser = await res.json();
            set((state) => ({
              users: state.users.map(u => u.id === userId ? updatedUser : u),
              currentUser: state.currentUser?.id === userId ? updatedUser : state.currentUser
            }));
          }
        } catch (error) {
          console.error('Failed to upload profile picture:', error);
        }
      },

      deleteUser: async (id) => {
        try {
          const res = await fetch(`${API_BASE}/users/${id}`, {
            method: 'DELETE',
          });
          
          if (res.ok) {
            set((state) => ({ users: state.users.filter(u => u.id !== id) }));
          }
        } catch (error) {
          console.error('Failed to delete user:', error);
        }
      },

      addCar: async (car) => {
        try {
          const res = await fetch(`${API_BASE}/vehicles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(car),
          });
          
          if (res.ok) {
            const newCar = await res.json();
            set((state) => ({ cars: [...state.cars, newCar] }));
            return { success: true };
          } else {
            const errorData = await res.json();
            return { success: false, error: errorData.error, code: errorData.code };
          }
        } catch (error) {
          console.error('Failed to add vehicle:', error);
          return { success: false, error: 'Network error' };
        }
      },

      updateCar: async (id, updates) => {
        try {
          const res = await fetch(`${API_BASE}/vehicles/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          
          if (res.ok) {
            const updatedCar = await res.json();
            set((state) => ({
              cars: state.cars.map(c => c.id === id ? updatedCar : c)
            }));
          }
        } catch (error) {
          console.error('Failed to update vehicle:', error);
        }
      },

      deleteCar: async (id) => {
        try {
          const res = await fetch(`${API_BASE}/vehicles/${id}`, {
            method: 'DELETE',
          });
          
          if (res.ok) {
            set((state) => ({ cars: state.cars.filter(c => c.id !== id) }));
          }
        } catch (error) {
          console.error('Failed to delete vehicle:', error);
        }
      },

      addMake: async (make) => {
        const currentMakes = get().config.makes;
        const newMakes = [...currentMakes, make];
        
        try {
          const res = await fetch(`${API_BASE}/config/makes`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newMakes }),
          });
          
          if (res.ok) {
            set((state) => ({
              config: { ...state.config, makes: newMakes }
            }));
          }
        } catch (error) {
          console.error('Failed to add make:', error);
        }
      },

      deleteMake: async (make) => {
        const currentMakes = get().config.makes;
        const newMakes = currentMakes.filter(m => m !== make);
        
        try {
          const res = await fetch(`${API_BASE}/config/makes`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newMakes }),
          });
          
          if (res.ok) {
            set((state) => ({
              config: { ...state.config, makes: newMakes }
            }));
          }
        } catch (error) {
          console.error('Failed to delete make:', error);
        }
      },

      addModel: async (make, model) => {
        const currentModels = get().config.models;
        const makeModels = currentModels[make] || [];
        const newModels = { ...currentModels, [make]: [...makeModels, model] };
        
        try {
          const res = await fetch(`${API_BASE}/config/models`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newModels }),
          });
          
          if (res.ok) {
            set((state) => ({
              config: { ...state.config, models: newModels }
            }));
          }
        } catch (error) {
          console.error('Failed to add model:', error);
        }
      },

      deleteModel: async (make, model) => {
        const currentModels = get().config.models;
        const makeModels = currentModels[make] || [];
        const newModels = { ...currentModels, [make]: makeModels.filter(m => m !== model) };
        
        try {
          const res = await fetch(`${API_BASE}/config/models`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newModels }),
          });
          
          if (res.ok) {
            set((state) => ({
              config: { ...state.config, models: newModels }
            }));
          }
        } catch (error) {
          console.error('Failed to delete model:', error);
        }
      },

      addDestination: async (dest) => {
        const currentDests = get().config.destinations;
        const newDests = [...currentDests, dest];
        
        try {
          const res = await fetch(`${API_BASE}/config/destinations`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newDests }),
          });
          
          if (res.ok) {
            set((state) => ({
              config: { ...state.config, destinations: newDests }
            }));
          }
        } catch (error) {
          console.error('Failed to add destination:', error);
        }
      },

      deleteDestination: async (dest) => {
        const currentDests = get().config.destinations;
        const newDests = currentDests.filter(d => d !== dest);
        
        try {
          const res = await fetch(`${API_BASE}/config/destinations`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newDests }),
          });
          
          if (res.ok) {
            set((state) => ({
              config: { ...state.config, destinations: newDests }
            }));
          }
        } catch (error) {
          console.error('Failed to delete destination:', error);
        }
      },

      addAuction: async (auction) => {
        const currentAuctions = get().config.auctions || [];
        const newAuctions = [...currentAuctions, auction];
        
        try {
          const res = await fetch(`${API_BASE}/config/auctions`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newAuctions }),
          });
          
          if (res.ok) {
            set((state) => ({
              config: { ...state.config, auctions: newAuctions }
            }));
          }
        } catch (error) {
          console.error('Failed to add auction:', error);
        }
      },

      deleteAuction: async (auction) => {
        const currentAuctions = get().config.auctions || [];
        const newAuctions = currentAuctions.filter(a => a !== auction);
        
        try {
          const res = await fetch(`${API_BASE}/config/auctions`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newAuctions }),
          });
          
          if (res.ok) {
            set((state) => ({
              config: { ...state.config, auctions: newAuctions }
            }));
          }
        } catch (error) {
          console.error('Failed to delete auction:', error);
        }
      },

      addBranch: async (branch) => {
        const currentBranches = get().config.branches || [];
        const newBranches = [...currentBranches, branch];
        
        try {
          const res = await fetch(`${API_BASE}/config/branches`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newBranches }),
          });
          
          if (res.ok) {
            set((state) => ({
              config: { ...state.config, branches: newBranches }
            }));
          }
        } catch (error) {
          console.error('Failed to add branch:', error);
        }
      },

      deleteBranch: async (branch) => {
        const currentBranches = get().config.branches || [];
        const newBranches = currentBranches.filter(b => b !== branch);
        
        try {
          const res = await fetch(`${API_BASE}/config/branches`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newBranches }),
          });
          
          if (res.ok) {
            set((state) => ({
              config: { ...state.config, branches: newBranches }
            }));
          }
        } catch (error) {
          console.error('Failed to delete branch:', error);
        }
      },

      sendUpdateEmail: (carId) => {
        const car = get().cars.find(c => c.id === carId);
        const user = get().users.find(u => u.id === car?.assignedToUserId);
        if (car && user) {
          console.log(`MOCK EMAIL SENT TO: ${user.email}`);
        }
      }
    }),
    {
      name: 'app-storage-v4', // Bumped version for backend integration
      partialize: (state) => ({ currentUser: state.currentUser }), // Only persist current user
    }
  )
);
