export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  duration: string;
  description: string;
  major: string[];
  industry: string[];
  views: number;
  isStarred?: boolean;
  isViewed?: boolean;
  applyClicks: number;
  applicationMethod: 'external' | 'email';
  applicationValue: string; // URL for external, email address for email
  expiresAt?: Date; // Optional expiration date
  listingDuration?: number; // Optional custom duration in months
  createdAt?: Date; // Creation date for time filtering
  imageUrl?: string; // Optional flyer/image for the internship
}

export interface FilterState {
  majors: string[];
  industries: string[];
  timePosted: string;
  location: string;
}

export interface DashboardMetrics {
  totalInternships: number;
  totalClicks: number;
  totalStudents: number;
  activeApplications: number;
}

export interface AIGeneratedDraft {
  id: string;
  title: string;
  company: string;
  sourceFile: string;
  parsedContent: Partial<Internship>;
  status: 'pending' | 'approved' | 'rejected';
}