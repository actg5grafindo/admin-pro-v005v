export type UserRole = 'superadmin' | 'admin' | 'user';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  preferred_language: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
    role?: UserRole;
  } | null;
  profile?: Profile;
}
