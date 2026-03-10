export type UserRole = 'admin' | 'qa' | 'coach' | 'employer' | 'learner';

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Mock current user - change this to test different roles
export const currentUser: CurrentUser = {
  id: 1,
  name: 'Dr. Ahmed Hassan',
  email: 'ahmed.hassan@example.com',
  role: 'coach', // Change to: 'admin', 'qa', 'coach', 'employer', 'learner'
  avatar: undefined,
};

// Helper function to check if user has permission
export const hasPermission = (allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(currentUser.role);
};

// Role-based permissions
export const permissions = {
  canEditReview: hasPermission(['admin', 'qa', 'coach']),
  canExportReview: hasPermission(['admin', 'qa', 'coach', 'employer']),
  canViewAllReviews: hasPermission(['admin', 'qa']),
  canAddCommunicationLog: hasPermission(['admin', 'qa', 'coach']),
  canViewDashboard: hasPermission(['admin', 'qa', 'coach']),
  canDeleteReview: hasPermission(['admin']),
};