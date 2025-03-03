import { createClient } from '@supabase/supabase-js';
import type { User } from '@/types/database.types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we're in a development environment without proper Supabase setup
const isMockMode = !supabaseUrl || supabaseUrl === 'your-supabase-url' || !supabaseAnonKey || supabaseAnonKey === 'your-supabase-anon-key';

// Create a mock client or real client based on environment
export const supabase = isMockMode 
  ? createMockClient() 
  : createClient(supabaseUrl, supabaseAnonKey);

// Create a mock Supabase client for development without actual Supabase setup
function createMockClient() {
  console.warn('Using mock Supabase client. Set up proper environment variables for production use.');
  
  // Mock user database for development
  const mockUsers = [
    {
      id: 'mock-hospital-user-id',
      email: 'hospital@test.com',
      password: 'password',
      firstName: 'Hospital',
      lastName: 'Admin',
      phone: '123-456-7890',
      organizationName: 'General Hospital',
      userType: 'hospital',
      created_at: '2023-01-15T10:00:00Z',
      isRegistrationComplete: true
    },
    {
      id: 'mock-ambulance-user-id',
      email: 'ambulance@test.com',
      password: 'password',
      firstName: 'Ambulance',
      lastName: 'Manager',
      phone: '987-654-3210',
      organizationName: 'Rapid Response EMS',
      userType: 'ambulance',
      created_at: '2023-02-20T14:30:00Z',
      isRegistrationComplete: true
    }
  ];

  // Mock organizations database
  const mockHospitals = [
    {
      id: 'mock-hospital-id',
      userId: 'mock-hospital-user-id',
      name: 'General Hospital',
      address: '123 Medical Center Blvd',
      city: 'Healthville',
      state: 'CA',
      zipCode: '90210',
      contactPhone: '123-456-7890',
      contactEmail: 'hospital@test.com',
      created_at: '2023-01-15T10:30:00Z'
    }
  ];

  const mockAmbulanceServices = [
    {
      id: 'mock-ambulance-id',
      userId: 'mock-ambulance-user-id',
      name: 'Rapid Response EMS',
      address: '456 Emergency Drive',
      city: 'Rescueville',
      state: 'CA',
      zipCode: '90211',
      contactPhone: '987-654-3210',
      contactEmail: 'ambulance@test.com',
      fleetSize: 8,
      created_at: '2023-01-20T15:00:00Z'
    }
  ];
  
  // Track current session
  let currentSession = null;
  
  // Function to clear all session data
  const clearAllSessions = () => {
    console.log('Clearing all mock session data');
    currentSession = null;
    
    // Only access localStorage in the browser
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mockSupabaseSession');
    }
    
    return { error: null };
  };
  
  // Try to restore session from localStorage
  if (typeof window !== 'undefined') {
    try {
      const savedSession = localStorage.getItem('mockSupabaseSession');
      if (savedSession) {
        currentSession = JSON.parse(savedSession);
        console.log('Restored mock session for user:', currentSession?.user?.email);
      }
    } catch (e) {
      console.error('Error restoring mock session:', e);
    }
  }
  
  return {
    auth: {
      signUp: async ({ email, password, options }) => {
        // Check if user already exists
        const existingUser = mockUsers.find(user => user.email === email);
        if (existingUser) {
          return { 
            data: null, 
            error: { message: 'User already exists' } 
          };
        }

        // Create new user with registration incomplete by default
        const userType = options?.data?.userType || 'hospital';
        const newUser = {
          id: `mock-${userType}-user-id-${Date.now()}`,
          email,
          password,
          ...options?.data,
          userType,
          isRegistrationComplete: false,
          created_at: new Date().toISOString()
        };
        
        // Add to mock database
        mockUsers.push(newUser);
        
        return { 
          data: { 
            user: { 
              id: newUser.id,
              email,
              user_metadata: { 
                ...options?.data,
                userType,
                isRegistrationComplete: false
              }
            } 
          }, 
          error: null 
        };
      },
      signInWithPassword: async ({ email, password }) => {
        // Find user in mock database
        const user = mockUsers.find(u => u.email === email && u.password === password);
        
        if (!user) {
          return { 
            data: null, 
            error: { message: 'Invalid login credentials' } 
          };
        }
        
        console.log('Mock login successful for:', email, 'User type:', user.userType);
        
        // Create and store session
        currentSession = { 
          user: { 
            id: user.id, 
            email: user.email,
            user_metadata: { 
              userType: user.userType,
              isRegistrationComplete: user.isRegistrationComplete,
              firstName: user.firstName,
              lastName: user.lastName
            }
          },
          access_token: 'mock-token-' + Date.now()
        };
        
        // Save to localStorage (browser only)
        if (typeof window !== 'undefined') {
          localStorage.setItem('mockSupabaseSession', JSON.stringify(currentSession));
        }
        
        return { 
          data: { 
            user: currentSession.user,
            session: { access_token: currentSession.access_token }
          }, 
          error: null 
        };
      },
      signOut: async () => {
        console.log('Mock sign out');
        return clearAllSessions();
      },
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      getSession: async () => {
        if (!currentSession) {
          console.log('No active mock session');
          return { data: { session: null }, error: null };
        }
        
        console.log('Active mock session for:', currentSession.user.email);
        return { 
          data: { 
            session: { 
              user: currentSession.user
            } 
          }, 
          error: null 
        };
      },
      getUser: async () => {
        if (!currentSession) {
          console.log('No active mock session for getUser');
          return { data: { user: null }, error: null };
        }
        
        console.log('getUser returning mock user:', currentSession.user.email);
        return { 
          data: { 
            user: currentSession.user
          }, 
          error: null 
        };
      },
    },
    from: (table: string) => ({
      select: () => ({
        eq: (field: string, value: any) => ({
          single: async () => {
            // Return mock data based on the table and query
            if (table === 'users') {
              const user = mockUsers.find(u => 
                (field === 'id' && u.id === value) || 
                (field === 'email' && u.email === value)
              );
              
              return user 
                ? { data: user, error: null } 
                : { data: null, error: null };
            } else if (table === 'hospitals') {
              const hospital = mockHospitals.find(h => 
                (field === 'id' && h.id === value) || 
                (field === 'userId' && h.userId === value)
              );
              
              return hospital 
                ? { data: hospital, error: null } 
                : { data: null, error: null };
            } else if (table === 'ambulance_services') {
              const ambulanceService = mockAmbulanceServices.find(a => 
                (field === 'id' && a.id === value) || 
                (field === 'userId' && a.userId === value)
              );
              
              return ambulanceService 
                ? { data: ambulanceService, error: null } 
                : { data: null, error: null };
            }
            return { data: null, error: null };
          },
          order: () => ({
            data: [],
            error: null
          })
        }),
        order: () => ({
          data: [],
          error: null
        })
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: { id: 'mock-id' }, error: null })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: { id: 'mock-id' }, error: null })
          })
        })
      })
    })
  } as any;
}

// Authentication functions
export const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

export const signOut = async () => {
  console.log('Signing out user...');
  
  // Clear any local storage items that might be persisting user state
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('supabase.auth.refreshToken');
  
  try {
    const { error } = await supabase.auth.signOut({
      scope: 'local' // Ensure we're clearing the local session only, not all devices
    });
    
    if (error) {
      console.error('Error signing out:', error);
    } else {
      console.log('User signed out successfully');
    }
    
    return { error };
  } catch (err) {
    console.error('Exception during sign out:', err);
    return { error: err as Error };
  }
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  return { data, error };
};

export const getCurrentUser = async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    return { data: null, error: sessionError || new Error('No active session') };
  }
  
  console.log('getCurrentUser: Session found:', session);
  
  try {
    // Get the user from the session
    const user = session.user;
    
    if (!user) {
      return { data: null, error: new Error('User not found in session') };
    }
    
    console.log('getCurrentUser: User found:', user);
    
    // Return the user data
    return { 
      data: { 
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata
        } 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return { data: null, error: error as Error };
  }
};

// Function to clear all saved account information
export const clearAllAccountInfo = async () => {
  console.log('Clearing all saved account information');
  
  // Clear localStorage items (browser only)
  if (typeof window !== 'undefined') {
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    localStorage.removeItem('mockSupabaseSession');
  }
  
  // Sign out from Supabase
  await signOut();
  
  console.log('All account information cleared');
  return { success: true };
}; 