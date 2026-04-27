import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import { CyberCard } from '../components/ui/CyberCard';
import { CyberButton } from '../components/ui/CyberButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileSpreadsheet, Users, Mail, CheckCircle, XCircle,
  AlertTriangle, Download, RefreshCw, Send, Database, Shield,
  UserCheck, UserX, Clock, TrendingUp, Filter, Search, Edit2
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { toast } from '../hooks/use-toast';
import { adminService, PlacementStudent, UploadLog } from '../services/adminService';
import { supabase } from '../integrations/supabase/client';
import Navbar from '../components/Navbar';
import CursorGlow from '../components/CursorGlow';
import ErrorBoundary from '../components/ErrorBoundary';

interface ParsedStudent {
  name: string;
  email: string;
  phone: string;
  status: string;
  drive_id?: string;
}

const TPOPlacementPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [students, setStudents] = useState<PlacementStudent[]>([]);
  const [uploadLogs, setUploadLogs] = useState<UploadLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showPreview, setShowPreview] = useState(false);
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSummary, setUploadSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<PlacementStudent | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate('/role-selection');
        return;
      }

      // Allow TPO admin or any TPO role
      const isTPOAdmin = user.email === 'muazshaikh7861@gmail.com';
      
      if (!isTPOAdmin) {
        toast({
          title: "Access Denied",
          description: "Admin access required for TPO Placement Panel",
          variant: "destructive",
        });
        navigate('/tpo-dashboard');
        return;
      }
    };

    checkAdminAccess();
  }, [user, navigate, toast]);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching placement data...');
      
      // Always start with demo data to ensure the page loads
      const demoStudents = [
        {
          id: "demo-1",
          name: "Demo Student 1",
          email: "student1@apsit.edu.in",
          phone: "9876543210",
          status: "Registered" as const,
          registration_email_sent: false,
          shortlist_email_sent: false,
          uploaded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "demo-2", 
          name: "Demo Student 2",
          email: "student2@apsit.edu.in",
          phone: "9876543211",
          status: "Shortlisted" as const,
          registration_email_sent: true,
          shortlist_email_sent: false,
          uploaded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "demo-3",
          name: "Demo Student 3", 
          email: "student3@apsit.edu.in",
          phone: "9876543212",
          status: "Rejected" as const,
          registration_email_sent: true,
          shortlist_email_sent: false,
          uploaded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const demoLogs = [
        {
          id: "demo-log-1",
          file_name: "demo_upload.xlsx",
          total_students: 3,
          registered_count: 1,
          shortlisted_count: 1,
          rejected_count: 1,
          uploaded_by: user?.id || "admin",
          uploaded_at: new Date().toISOString()
        }
      ];

      // Try to fetch real data, but don't fail if it doesn't work
      try {
        const [studentsRes, logsRes] = await Promise.all([
          supabase
            .from('placement_registrations')
            .select('*')
            .order('updated_at', { ascending: false }),
          supabase
            .from('placement_upload_logs')
            .select('*')
            .order('uploaded_at', { ascending: false })
        ]);

        if (!studentsRes.error && studentsRes.data && studentsRes.data.length > 0) {
          setStudents(studentsRes.data);
          console.log('Real student data loaded:', studentsRes.data.length);
        } else {
          setStudents(demoStudents);
          console.log('Using demo student data');
        }

        if (!logsRes.error && logsRes.data && logsRes.data.length > 0) {
          setUploadLogs(logsRes.data);
          console.log('Real log data loaded:', logsRes.data.length);
        } else {
          setUploadLogs(demoLogs);
          console.log('Using demo log data');
        }
      } catch (dbError) {
        console.log('Database fetch failed, using demo data:', dbError);
        setStudents(demoStudents);
        setUploadLogs(demoLogs);
      }

    } catch (error) {
      console.error('Error in fetchData:', error);
      // Always set demo data as fallback
      setStudents([
        {
          id: "demo-1",
          name: "Demo Student 1",
          email: "student1@apsit.edu.in", 
          phone: "9876543210",
          status: "Registered" as const,
          registration_email_sent: false,
          shortlist_email_sent: false,
          uploaded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      setUploadLogs([
        {
          id: "demo-log-1",
          file_name: "demo_upload.xlsx",
          total_students: 1,
          registered_count: 1,
          shortlisted_count: 0,
          rejected_count: 0,
          uploaded_by: user?.id || "admin",
          uploaded_at: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);

    if (!file.name.endsWith('.xlsx')) {
      toast({
        title: "Invalid File",
        description: "Please upload an Excel file (.xlsx)",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);

    try {
      console.log('Starting file processing...');
      
      // Show a simple toast to indicate processing started
      toast({
        title: "Processing File",
        description: `Reading ${file.name}...`,
      });

      const data = await file.arrayBuffer();
      console.log('File read as array buffer, size:', data.byteLength);
      
      // Dynamic import of XLSX to avoid bundling issues
      const XLSX = await import('xlsx');
      console.log('XLSX imported successfully:', XLSX);
      
      const workbook = XLSX.read(data, { type: 'buffer' });
      console.log('Workbook read, sheets:', workbook.SheetNames);
      
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('No sheets found in Excel file');
      }
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
      console.log('Excel data parsed:', jsonData.length, 'rows');

      if (jsonData.length === 0) {
        throw new Error('No data found in Excel file');
      }

      // Validate and parse data
      const parsed: ParsedStudent[] = [];
      const errors: string[] = [];

      jsonData.forEach((row, index) => {
        console.log(`Processing row ${index + 1}:`, row);
        
        const student: ParsedStudent = {
          name: row.name || row.Name || '',
          email: row.email || row.Email || '',
          phone: row.phone || row.Phone || '',
          status: row.status || row.Status || '',
          drive_id: row.drive_id || row.DriveID || row.driveId
        };

        // Validation
        if (!student.name || !student.email || !student.phone || !student.status) {
          errors.push(`Row ${index + 1}: Missing required fields (name, email, phone, status)`);
          return;
        }

        if (!student.email.includes('@')) {
          errors.push(`Row ${index + 1}: Invalid email format`);
          return;
        }

        const validStatuses = ['Registered', 'Unregistered', 'Shortlisted', 'Rejected'];
        if (!validStatuses.includes(student.status)) {
          errors.push(`Row ${index + 1}: Invalid status. Must be one of: ${validStatuses.join(', ')}`);
          return;
        }

        parsed.push(student);
      });

      console.log('Parsed students:', parsed.length, 'Errors:', errors.length);

      if (errors.length > 0) {
        toast({
          title: "Validation Errors",
          description: errors.slice(0, 5).join('\n') + (errors.length > 5 ? '\n...' : ''),
          variant: "destructive",
        });
        return;
      }

      if (parsed.length === 0) {
        toast({
          title: "No Valid Data",
          description: "No valid student records found in the Excel file",
          variant: "destructive",
        });
        return;
      }

      setParsedStudents(parsed);
      setShowPreview(true);
      
      toast({
        title: "File Parsed Successfully",
        description: `Found ${parsed.length} valid student records`,
      });

    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        title: "Parse Error",
        description: `Failed to parse Excel file: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const confirmUpload = async () => {
    if (!selectedFile || parsedStudents.length === 0) return;

    setIsUploading(true);
    try {
      console.log('Starting upload confirmation for', parsedStudents.length, 'students');
      
      // Check for duplicates
      const emails = parsedStudents.map(s => s.email);
      const { data: existingStudents } = await supabase
        .from('placement_registrations')
        .select('email, drive_id')
        .in('email', emails);

      const duplicates = existingStudents?.filter(existing => 
        parsedStudents.some(parsed => 
          parsed.email === existing.email && 
          (!existing.drive_id || existing.drive_id === parsed.drive_id)
        )
      );

      if (duplicates && duplicates.length > 0) {
        toast({
          title: "Duplicate Entries",
          description: `Found ${duplicates.length} duplicate entries. Please review and remove duplicates.`,
          variant: "destructive",
        });
        return;
      }

      // Insert students
      const { data: insertedStudents, error: insertError } = await supabase
        .from('placement_registrations')
        .insert(parsedStudents)
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('Students inserted successfully:', insertedStudents?.length);

      // Create upload log
      const summary = {
        total_students: parsedStudents.length,
        registered_count: parsedStudents.filter(s => s.status === 'Registered').length,
        shortlisted_count: parsedStudents.filter(s => s.status === 'Shortlisted').length,
        rejected_count: parsedStudents.filter(s => s.status === 'Rejected').length,
      };

      const { error: logError } = await supabase.from('placement_upload_logs').insert({
        file_name: selectedFile.name,
        ...summary,
        uploaded_by: user?.id,
      });

      if (logError) {
        console.error('Log creation error:', logError);
        // Don't throw error, just log it
      }

      setUploadSummary(summary);
      setShowPreview(false);
      setParsedStudents([]);
      setSelectedFile(null);
      
      // Refresh data
      await fetchData();
      
      toast({
        title: "Upload Successful!",
        description: `Successfully uploaded ${parsedStudents.length} students`,
      });

    } catch (error) {
      console.error('Error uploading:', error);
      toast({
        title: "Upload Error",
        description: `Failed to upload student data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const updateStudentStatus = async (studentId: string, newStatus: string) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const { error } = await supabase
        .from('placement_registrations')
        .update({ status: newStatus })
        .eq('id', studentId);

      if (error) throw error;

      // Check if status changed FROM Registered TO Shortlisted
      if (newStatus === 'Shortlisted' && student.status === 'Registered' && student.shortlist_email_sent === false) {
        await sendShortlistEmail(student.email);
      }

      // Check if status changed FROM Unregistered TO Registered
      if (newStatus === 'Registered' && student.status === 'Unregistered' && student.registration_email_sent === false) {
        await sendRegistrationEmail(student.email);
      }

      await fetchData();
      
      toast({
        title: "Status Updated",
        description: "Student status has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Update Error",
        description: "Failed to update student status",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (student: PlacementStudent) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      const originalStudent = students.find(s => s.id === editingStudent.id);
      
      const { error } = await supabase
        .from('placement_registrations')
        .update({
          name: editingStudent.name,
          email: editingStudent.email,
          phone: editingStudent.phone,
          status: editingStudent.status
        })
        .eq('id', editingStudent.id);

      if (error) throw error;

      // Handle Email Triggers if status changed via Modal
      if (originalStudent) {
        // Registered -> Shortlisted
        if (editingStudent.status === 'Shortlisted' && originalStudent.status === 'Registered' && !originalStudent.shortlist_email_sent) {
          await sendShortlistEmail(editingStudent.email);
        }
        // Unregistered -> Registered
        if (editingStudent.status === 'Registered' && originalStudent.status === 'Unregistered' && !originalStudent.registration_email_sent) {
          await sendRegistrationEmail(editingStudent.email);
        }
      }

      setIsEditModalOpen(false);
      setEditingStudent(null);
      await fetchData();
      
      toast({
        title: "Student Updated",
        description: "Information has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Update Error",
        description: "Failed to update student information",
        variant: "destructive",
      });
    }
  };

  const sendShortlistEmail = async (email: string) => {
    try {
      // Use our reliable local backend instead of edge function
      const response = await fetch('http://localhost:3001/api/admin/send-shortlist-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }) // Pass specific email to only send to this student
      });

      if (!response.ok) throw new Error('Failed to send shortlist email');

      toast({
        title: "Shortlist Email Sent",
        description: `Notification has been sent to ${email}`,
      });
    } catch (error) {
      console.error('Error sending individual email:', error);
    }
  };

  const sendRegistrationEmail = async (email: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/send-registration-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) throw new Error('Failed to send registration email');

      toast({
        title: "Registration Email Sent",
        description: `Welcome email sent to ${email}`,
      });
    } catch (error) {
      console.error('Error sending registration email:', error);
    }
  };

  const sendBulkEmails = async (type: 'registration' | 'shortlist') => {
    setIsSendingEmails(true);
    try {
      const endpoint = type === 'registration' 
        ? 'http://localhost:3001/api/admin/send-registration-emails'
        : 'http://localhost:3001/api/admin/send-shortlist-emails';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) throw new Error('Failed to send emails');

      const result = await response.json();
      
      // Handle user-friendly messages
      let title, description;
      if (result.message && result.message.includes('already been sent')) {
        title = "Email Status";
        description = result.message;
      } else if (result.message && result.message.includes('campaign completed')) {
        title = "Email Campaign Completed";
        description = `Sent: ${result.sent || 0}, Failed: ${result.failed || 0}`;
      } else {
        title = "Email Campaign Completed";
        description = `Sent: ${result.sent || 0}, Failed: ${result.failed || 0}`;
      }
      
      // Additional check for shortlist emails already sent
      if (result.message && result.message.includes('Shortlist emails have already been sent')) {
        title = "Email Status";
        description = result.message;
      }
      
      toast({
        title,
        description,
      });

      await fetchData();
    } catch (error) {
      console.error('Error sending emails:', error);
      toast({
        title: "Email Error",
        description: "Failed to send bulk emails",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: students.length,
    registered: students.filter(s => s.status === 'Registered').length,
    shortlisted: students.filter(s => s.status === 'Shortlisted').length,
    rejected: students.filter(s => s.status === 'Rejected').length,
    unregistered: students.filter(s => s.status === 'Unregistered').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative grid-pattern">
        <CursorGlow color="primary" size={250} />
        <Navbar />
        <div className="relative z-10 container mx-auto px-4 pt-24 pb-12 flex items-center justify-center min-h-[60vh]">
          <CyberCard variant="glow" className="text-center max-w-md">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <Database className="w-16 h-16 text-primary" />
            </motion.div>
            <h3 className="font-display text-xl font-bold mb-2">Loading Placement Data</h3>
            <p className="text-muted-foreground text-sm">
              Fetching student records and upload history...
            </p>
          </CyberCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative grid-pattern">
      <CursorGlow color="primary" size={250} />
      <Navbar />
      
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold">TPO Placement Panel</h1>
            <Badge variant="outline" className="bg-primary/20 border-primary/30 text-primary">
              ADMIN ONLY
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage student registrations, upload Excel files, and send automated emails
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <CyberCard variant="glow" className="text-center p-4">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-display font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Students</p>
          </CyberCard>
          <CyberCard variant="glow" className="text-center p-4">
            <UserCheck className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-success">{stats.registered}</p>
            <p className="text-xs text-muted-foreground">Registered</p>
          </CyberCard>
          <CyberCard variant="glow" className="text-center p-4">
            <TrendingUp className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-accent">{stats.shortlisted}</p>
            <p className="text-xs text-muted-foreground">Shortlisted</p>
          </CyberCard>
          <CyberCard variant="glow" className="text-center p-4">
            <UserX className="w-6 h-6 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-destructive">{stats.rejected}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CyberCard>
          <CyberCard variant="glow" className="text-center p-4">
            <Clock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-2xl font-display font-bold">{stats.unregistered}</p>
            <p className="text-xs text-muted-foreground">Unregistered</p>
          </CyberCard>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <CyberCard variant="glow">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="w-6 h-6 text-primary" />
              <h2 className="font-display text-xl font-bold">Excel Upload</h2>
            </div>
            
            <div className="text-center">
              <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Upload Excel file (.xlsx) with columns: name, email, phone, status, drive_id (optional)
              </p>
              
              {/* Hidden file input for button */}
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-upload"
                ref={fileInputRef}
              />
              <CyberButton 
                variant="primary" 
                className="cursor-pointer min-w-[140px]" 
                disabled={isUploading}
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Excel File
                  </>
                )}
              </CyberButton>
            </div>

            {/* Email Actions */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
              {students.filter(s => !s.id.startsWith('demo-')).length === 0 && (
                <div className="w-full text-center text-muted-foreground text-sm">
                  Upload an Excel file with student data to enable email sending
                </div>
              )}
              <CyberButton
                variant="secondary"
                onClick={() => sendBulkEmails('registration')}
                disabled={isSendingEmails || students.filter(s => !s.id.startsWith('demo-')).length === 0}
              >
                {isSendingEmails ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Registration Emails
                  </>
                )}
              </CyberButton>
              <CyberButton
                variant="accent"
                onClick={() => sendBulkEmails('shortlist')}
                disabled={isSendingEmails || students.filter(s => !s.id.startsWith('demo-')).length === 0}
              >
                {isSendingEmails ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Shortlist Emails
                  </>
                )}
              </CyberButton>
            </div>
          </CyberCard>
        </motion.div>

        {/* Student List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CyberCard variant="glow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl font-bold">Student List</h2>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Registered">Registered</SelectItem>
                    <SelectItem value="Unregistered">Unregistered</SelectItem>
                    <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-mono text-sm text-muted-foreground">Name</th>
                    <th className="text-left p-3 font-mono text-sm text-muted-foreground">Email</th>
                    <th className="text-left p-3 font-mono text-sm text-muted-foreground">Phone</th>
                    <th className="text-left p-3 font-mono text-sm text-muted-foreground">Status</th>
                    <th className="text-left p-3 font-mono text-sm text-muted-foreground">Emails</th>
                    <th className="text-left p-3 font-mono text-sm text-muted-foreground">Updated</th>
                    <th className="text-left p-3 font-mono text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-border hover:bg-muted/30">
                      <td className="p-3 font-medium">{student.name}</td>
                      <td className="p-3 text-muted-foreground">{student.email}</td>
                      <td className="p-3 text-muted-foreground">{student.phone}</td>
                      <td className="p-3">
                        <Select
                          value={student.status}
                          onValueChange={(value) => updateStudentStatus(student.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Registered">Registered</SelectItem>
                            <SelectItem value="Unregistered">Unregistered</SelectItem>
                            <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1.5">
                          {/* Dynamic Status Tags */}
                          {student.status === 'Registered' && (
                            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary text-[10px] px-1.5 py-0">
                              Reg {student.registration_email_sent && <CheckCircle className="w-2.5 h-2.5 ml-1 text-success" />}
                            </Badge>
                          )}
                          {student.status === 'Shortlisted' && (
                            <Badge variant="outline" className="bg-accent/10 border-accent/30 text-accent text-[10px] px-1.5 py-0">
                              Short {student.shortlist_email_sent && <CheckCircle className="w-2.5 h-2.5 ml-1 text-success" />}
                            </Badge>
                          )}
                          {student.status === 'Rejected' && (
                            <Badge variant="outline" className="bg-destructive/10 border-destructive/30 text-destructive text-[10px] px-1.5 py-0">
                              Rej
                            </Badge>
                          )}
                          {student.status === 'Unregistered' && (
                            <Badge variant="outline" className="bg-muted border-border text-muted-foreground text-[10px] px-1.5 py-0">
                              Unreg
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground text-sm">
                        {new Date(student.updated_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <CyberButton 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditClick(student)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </CyberButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CyberCard>
        </motion.div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto"
            >
              <CyberCard variant="glow" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold">Preview Upload</h3>
                  <CyberButton variant="ghost" onClick={() => setShowPreview(false)}>
                    <XCircle className="w-4 h-4" />
                  </CyberButton>
                </div>

                <div className="mb-6">
                  <p className="text-muted-foreground mb-2">
                    File: {selectedFile?.name}
                  </p>
                  <p className="text-muted-foreground">
                    Found {parsedStudents.length} students to upload
                  </p>
                </div>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 font-mono text-sm">Name</th>
                        <th className="text-left p-2 font-mono text-sm">Email</th>
                        <th className="text-left p-2 font-mono text-sm">Phone</th>
                        <th className="text-left p-2 font-mono text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedStudents.slice(0, 10).map((student, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="p-2">{student.name}</td>
                          <td className="p-2">{student.email}</td>
                          <td className="p-2">{student.phone}</td>
                          <td className="p-2">{student.status}</td>
                        </tr>
                      ))}
                      {parsedStudents.length > 10 && (
                        <tr>
                          <td colSpan={4} className="p-2 text-center text-muted-foreground">
                            ... and {parsedStudents.length - 10} more rows
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-3 justify-end">
                  <CyberButton variant="ghost" onClick={() => setShowPreview(false)}>
                    Cancel
                  </CyberButton>
                  <CyberButton variant="primary" onClick={confirmUpload} disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Confirm Upload
                      </>
                    )}
                  </CyberButton>
                </div>
              </CyberCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Student Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="max-w-md w-full"
            >
              <CyberCard variant="glow" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Edit2 className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-xl font-bold">Edit Student</h3>
                  </div>
                  <CyberButton variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
                    <XCircle className="w-5 h-5" />
                  </CyberButton>
                </div>

                <form onSubmit={handleUpdateStudent} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase">Full Name</label>
                    <Input
                      value={editingStudent.name}
                      onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                      placeholder="Student Name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase">Email Address</label>
                    <Input
                      type="email"
                      value={editingStudent.email}
                      onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                      placeholder="email@apsit.edu.in"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase">Phone Number</label>
                    <Input
                      value={editingStudent.phone}
                      onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                      placeholder="Contact Number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase">Placement Status</label>
                    <Select 
                      value={editingStudent.status} 
                      onValueChange={(value) => setEditingStudent({ ...editingStudent, status: value as any })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Registered">Registered</SelectItem>
                        <SelectItem value="Unregistered">Unregistered</SelectItem>
                        <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <CyberButton 
                      type="button" 
                      variant="ghost" 
                      className="flex-1"
                      onClick={() => setIsEditModalOpen(false)}
                    >
                      Cancel
                    </CyberButton>
                    <CyberButton 
                      type="submit" 
                      variant="primary" 
                      className="flex-1"
                      glowing
                    >
                      Save Changes
                    </CyberButton>
                  </div>
                </form>
              </CyberCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TPOPlacementPanelWithBoundary = () => (
  <ErrorBoundary>
    <TPOPlacementPanel />
  </ErrorBoundary>
);

export default TPOPlacementPanelWithBoundary;
