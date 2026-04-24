import { supabase } from '../integrations/supabase/client';
import { errorHandler } from '../lib/errorHandler';

export interface AdminUser {
  id: string;
  email: string;
  role: 'student' | 'tpo';
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

export interface PlacementStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Registered' | 'Unregistered' | 'Shortlisted' | 'Rejected';
  registration_email_sent: boolean;
  shortlist_email_sent: boolean;
  drive_id?: string;
  uploaded_at: string;
  updated_at: string;
}

export interface UploadLog {
  id: string;
  file_name: string;
  total_students: number;
  registered_count: number;
  shortlisted_count: number;
  rejected_count: number;
  uploaded_by: string;
  uploaded_at: string;
}

class AdminService {
  // User Management
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      console.log('Fetching all users...');
      
      // Try the admin function first
      const { data, error } = await supabase.rpc('admin_get_users');
      
      if (error) {
        console.error('Admin function failed:', error);
        throw error;
      }
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response from admin function');
      }
      
      // Transform the data to match the expected interface
      const transformedData = data.map((row: { 
        user_id: string; 
        email: string; 
        role: string; 
        created_at: string; 
        last_sign_in_at: string | null; 
        email_confirmed_at: string | null; 
      }) => ({
        id: row.user_id,
        email: row.email,
        role: (row.role === 'tpo' ? 'tpo' : 'student') as 'student' | 'tpo',
        created_at: row.created_at,
        last_sign_in_at: row.last_sign_in_at,
        email_confirmed_at: row.email_confirmed_at
      }));
      
      console.log('Users fetched successfully:', transformedData.length);
      return transformedData;
    } catch (error: unknown) {
      errorHandler.handleSupabaseError(error as any, 'AdminService.getAllUsers');
      throw error;
    }
  }

  async updateUserRole(userId: string, newRole: 'student' | 'tpo'): Promise<void> {
    try {
      console.log('Updating user role:', userId, 'to', newRole);
      
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole
        });

      if (error) {
        console.error('Role update failed:', error);
        throw error;
      }
      
      console.log('User role updated successfully');
    } catch (error: unknown) {
      errorHandler.handleSupabaseError(error as any, 'AdminService.updateUserRole', {
        userId,
        additionalInfo: { newRole }
      });
      throw error;
    }
  }

  // Placement Management
  async getPlacementStudents(): Promise<PlacementStudent[]> {
    try {
      console.log('Fetching placement students...');
      
      const { data, error } = await supabase
        .from('placement_registrations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Placement students fetch failed:', error);
        throw error;
      }
      
      console.log('Placement students fetched successfully:', data?.length || 0);
      
      // Transform the data to match the expected interface
      const transformedData = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        status: row.status as 'Registered' | 'Unregistered' | 'Shortlisted' | 'Rejected',
        registration_email_sent: row.registration_email_sent,
        shortlist_email_sent: row.shortlist_email_sent,
        drive_id: row.drive_id,
        uploaded_at: row.uploaded_at,
        updated_at: row.updated_at
      }));
      
      return transformedData;
    } catch (error: unknown) {
      errorHandler.handleSupabaseError(error as any, 'AdminService.getPlacementStudents');
      throw error;
    }
  }

  async getUploadLogs(): Promise<UploadLog[]> {
    try {
      console.log('Fetching upload logs...');
      
      const { data, error } = await supabase
        .from('placement_upload_logs')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Upload logs fetch failed:', error);
        throw error;
      }
      
      console.log('Upload logs fetched successfully:', data?.length || 0);
      
      // Transform the data to match the expected interface
      const transformedData = (data || []).map((row: any) => ({
        id: row.id,
        file_name: row.file_name,
        total_students: row.total_students,
        registered_count: row.registered_count,
        shortlisted_count: row.shortlisted_count,
        rejected_count: row.rejected_count,
        uploaded_by: row.uploaded_by,
        uploaded_at: row.uploaded_at
      }));
      
      return transformedData;
    } catch (error: unknown) {
      errorHandler.handleSupabaseError(error as any, 'AdminService.getUploadLogs');
      throw error;
    }
  }

  async uploadPlacementStudents(students: Omit<PlacementStudent, 'id' | 'uploaded_at' | 'updated_at'>[]): Promise<PlacementStudent[]> {
    try {
      console.log('Uploading placement students:', students.length);
      
      const { data, error } = await supabase
        .from('placement_registrations')
        .insert(students)
        .select();

      if (error) {
        console.error('Student upload failed:', error);
        throw error;
      }
      
      console.log('Students uploaded successfully:', data?.length || 0);
      
      // Transform the data to match the expected interface
      const transformedData = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        status: row.status as 'Registered' | 'Unregistered' | 'Shortlisted' | 'Rejected',
        registration_email_sent: row.registration_email_sent,
        shortlist_email_sent: row.shortlist_email_sent,
        drive_id: row.drive_id,
        uploaded_at: row.uploaded_at,
        updated_at: row.updated_at
      }));
      
      return transformedData;
    } catch (error: unknown) {
      errorHandler.handleSupabaseError(error as any, 'AdminService.uploadPlacementStudents', {
        additionalInfo: { studentCount: students.length }
      });
      throw error;
    }
  }

  async createUploadLog(log: Omit<UploadLog, 'id' | 'uploaded_at'>): Promise<UploadLog> {
    try {
      console.log('Creating upload log...');
      
      const { data, error } = await supabase
        .from('placement_upload_logs')
        .insert(log)
        .select()
        .single();

      if (error) {
        console.error('Upload log creation failed:', error);
        throw error;
      }
      
      console.log('Upload log created successfully');
      
      // Transform the data to match the expected interface
      const transformedData: UploadLog = {
        id: data.id,
        file_name: data.file_name,
        total_students: data.total_students,
        registered_count: data.registered_count,
        shortlisted_count: data.shortlisted_count,
        rejected_count: data.rejected_count,
        uploaded_by: data.uploaded_by,
        uploaded_at: data.uploaded_at
      };
      
      return transformedData;
    } catch (error: unknown) {
      errorHandler.handleSupabaseError(error as any, 'AdminService.createUploadLog');
      throw error;
    }
  }

  async updateStudentStatus(studentId: string, status: PlacementStudent['status']): Promise<void> {
    try {
      console.log('Updating student status:', studentId, 'to', status);
      
      const { error } = await supabase
        .from('placement_registrations')
        .update({ status })
        .eq('id', studentId);

      if (error) {
        console.error('Student status update failed:', error);
        throw error;
      }
      
      console.log('Student status updated successfully');
    } catch (error: unknown) {
      errorHandler.handleSupabaseError(error as any, 'AdminService.updateStudentStatus', {
        studentId,
        additionalInfo: { status }
      });
      throw error;
    }
  }

  // Check for duplicates
  async checkDuplicateStudents(emails: string[]): Promise<string[]> {
    try {
      console.log('Checking for duplicate emails:', emails.length);
      
      const { data, error } = await supabase
        .from('placement_registrations')
        .select('email')
        .in('email', emails);

      if (error) {
        console.error('Duplicate check failed:', error);
        throw error;
      }
      
      const existingEmails = data?.map((row: { email: string }) => row.email) || [];
      console.log('Found existing emails:', existingEmails.length);
      
      return existingEmails;
    } catch (error: unknown) {
      errorHandler.handleSupabaseError(error as any, 'AdminService.checkDuplicateStudents');
      throw error;
    }
  }

  // Validate admin access
  async validateAdminAccess(userId: string, userEmail: string): Promise<boolean> {
    try {
      console.log('Validating admin access for:', userEmail);
      
      // Special case for TPO admin
      if (userEmail === 'muazshaikh7861@gmail.com') {
        console.log('TPO admin access granted via email');
        return true;
      }
      
      // Check role in database
      const { data, error } = await supabase
        .rpc('get_user_role', { _user_id: userId });

      if (error) {
        console.error('Role validation failed:', error);
        return false;
      }
      
      const isAdmin = data === 'tpo';
      console.log('Admin access result:', isAdmin);
      
      return isAdmin;
    } catch (error: unknown) {
      errorHandler.handleSupabaseError(error as any, 'AdminService.validateAdminAccess', {
        userId,
        userEmail
      });
      return false;
    }
  }
}

export const adminService = new AdminService();
