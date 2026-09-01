export interface UserProfile {
  name: string;
  empId: string;
  email: string;
  dept: string;
  designation: string;
  organisation: string;
  rank: string;
  role: 'employee' | 'admin';
  password?: string;
}

const DEFAULT_USERS: UserProfile[] = [
  {
    name: 'Priya Sharma',
    empId: 'MOS/2019/1842',
    email: 'priya.sharma@mospi.gov.in',
    dept: 'Price Statistics Division',
    designation: 'Statistical Officer',
    organisation: 'Ministry of Statistics & Programme Implementation',
    rank: 'Group A',
    role: 'employee',
    password: 'demo123'
  },
  {
    name: 'Dr. Rajesh Kumar',
    empId: 'ADMIN/001',
    email: 'rajesh.kumar@mospi.gov.in',
    dept: 'IT Division',
    designation: 'Director',
    organisation: 'Ministry of Statistics & Programme Implementation',
    rank: 'Group A',
    role: 'admin',
    password: 'demo123'
  }
];

const STORAGE_KEYS = {
  USERS: 'statpath_registered_users',
  CURRENT: 'statpath_current_user'
};

export const getRegisteredUsers = (): UserProfile[] => {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_USERS;
  }
};

export const registerUser = (newUser: UserProfile): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const users = getRegisteredUsers();
    // Check if employee ID already exists
    const existingIndex = users.findIndex(u => u.empId.toLowerCase() === newUser.empId.toLowerCase());
    if (existingIndex !== -1) {
      users[existingIndex] = { ...users[existingIndex], ...newUser };
    } else {
      users.push(newUser);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT, JSON.stringify(newUser));
    return true;
  } catch (e) {
    console.error('Failed to register user', e);
    return false;
  }
};

export const loginUser = (empId: string, password: string, role: string = 'employee'): { success: boolean; user?: UserProfile; error?: string } => {
  if (typeof window === 'undefined') return { success: false, error: 'Browser storage unavailable' };
  try {
    const users = getRegisteredUsers();
    const cleanId = empId.trim().toLowerCase();
    
    const user = users.find(u => u.empId.trim().toLowerCase() === cleanId);
    
    if (!user) {
      return { success: false, error: `Employee ID "${empId}" not found. Please register first.` };
    }
    
    if (user.password && user.password !== password) {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }
    
    // Override role if specified in form selection
    const loggedInUser = { ...user, role: (role as 'employee' | 'admin') || user.role };
    localStorage.setItem(STORAGE_KEYS.CURRENT, JSON.stringify(loggedInUser));
    return { success: true, user: loggedInUser };
  } catch (e) {
    return { success: false, error: 'Authentication error' };
  }
};

export const getCurrentUser = (): UserProfile | null => {
  if (typeof window === 'undefined') return DEFAULT_USERS[0];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT);
    if (!data) return DEFAULT_USERS[0];
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_USERS[0];
  }
};

export const updateCurrentUserProfile = (updatedFields: Partial<UserProfile>): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const current = getCurrentUser();
    if (!current) return null;
    // empId is locked and cannot be edited
    const updated = { ...current, ...updatedFields, empId: current.empId };
    
    localStorage.setItem(STORAGE_KEYS.CURRENT, JSON.stringify(updated));

    const users = getRegisteredUsers();
    const idx = users.findIndex(u => u.empId.toLowerCase() === current.empId.toLowerCase());
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updated };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    return updated;
  } catch (e) {
    console.error('Failed to update user profile', e);
    return null;
  }
};

export const logoutUser = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT);
  } catch (e) {
    console.error(e);
  }
};
