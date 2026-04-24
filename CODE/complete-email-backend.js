import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file upload
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'muazshaikh7861@gmail.com',
    pass: 'zizl cdoc olfn tevw' // App password
  }
});

// Supabase client with service role key
const supabase = createClient(
  'https://eqydeitsqzvpuucbfsyu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeWRlaXRzcXp2cHV1Y2Jmc3l1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ5NDU2NCwiZXhwIjoyMDg3MDcwNTY0fQ.4EFZdogZ-XEqEaeqfSTH8VCH57KcEEj9X_IAieo9Sk4',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// Helper function to normalize status
const normalizeStatus = (status) => {
  if (!status) return 'Unregistered';
  const normalized = status.toString().trim().toLowerCase();
  switch (normalized) {
    case 'registered': return 'Registered';
    case 'unregistered': return 'Unregistered';
    case 'shortlisted': return 'Shortlisted';
    case 'rejected': return 'Rejected';
    default: return 'Unregistered';
  }
};

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to send email
const sendEmail = async (student, type) => {
  const emailContent = type === 'registration' 
    ? {
        subject: '🎓 Placement Registration Confirmation - APSIT',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #2563eb; margin: 0;">🎓 Placement Registration Confirmed</h1>
              <p style="color: #666; margin: 5px 0;">APSIT Placement Drive 2026</p>
            </div>
            <p style="font-size: 16px; color: #333;">Dear <strong>${student.name}</strong>,</p>
            <p style="font-size: 16px; color: #333;">Your placement registration has been successfully received and confirmed.</p>
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="color: #2563eb; margin-top: 0;">📋 Registration Details:</h3>
              <p><strong>👤 Name:</strong> ${student.name}</p>
              <p><strong>📧 Email:</strong> ${student.email}</p>
              <p><strong>📱 Phone:</strong> ${student.phone}</p>
              <p><strong>📊 Status:</strong> ${student.status}</p>
              ${student.drive_id ? `<p><strong>🚀 Drive ID:</strong> ${student.drive_id}</p>` : ''}
            </div>
            <p style="font-size: 16px; color: #333;">We will keep you updated on any further developments.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="margin: 0; color: #666;">Best regards,<br><strong>Placement Team</strong><br>APSIT Placement Cell<br>Mumbai, Maharashtra</p>
            </div>
          </div>
        `
      }
    : {
        subject: '🎉 Congratulations! You Have Been Shortlisted - APSIT',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #f0fdf4;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #28a745; margin: 0;">🎉 Congratulations!</h1>
              <p style="color: #666; margin: 5px 0;">APSIT Placement Drive 2026</p>
            </div>
            <p style="font-size: 16px; color: #333;">Dear <strong>${student.name}</strong>,</p>
            <p style="font-size: 16px; color: #333;">We are pleased to inform you that you have been <strong style="color: #28a745;">shortlisted</strong> for placement drive.</p>
            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0;">🏆 Shortlist Details:</h3>
              <p><strong>👤 Name:</strong> ${student.name}</p>
              <p><strong>📧 Email:</strong> ${student.email}</p>
              <p><strong>📱 Phone:</strong> ${student.phone}</p>
              <p><strong>📊 Status:</strong> ${student.status}</p>
              ${student.drive_id ? `<p><strong>🚀 Drive ID:</strong> ${student.drive_id}</p>` : ''}
            </div>
            <p style="font-size: 16px; color: #333;">Please keep an eye on your email for further instructions regarding interview schedules and next steps.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="margin: 0; color: #666;">Best regards,<br><strong>Placement Team</strong><br>APSIT Placement Cell<br>Mumbai, Maharashtra</p>
            </div>
          </div>
        `
      };

  try {
    await transporter.sendMail({
      from: 'muazshaikh7861@gmail.com',
      to: student.email,
      subject: emailContent.subject,
      html: emailContent.html
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 1️⃣ Excel Upload Endpoint
app.post('/api/admin/upload-excel', upload.single('excel'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Excel row numbers start from 2

      // Validate required columns
      if (!row.Name || !row.Email) {
        errors.push(`Row ${rowNumber}: Missing Name or Email column`);
        errorCount++;
        continue;
      }

      // Validate email format
      if (!isValidEmail(row.Email)) {
        errors.push(`Row ${rowNumber}: Invalid email format: ${row.Email}`);
        errorCount++;
        continue;
      }

      // Validate status
      const normalizedStatus = normalizeStatus(row.Status);
      if (!['Registered', 'Unregistered', 'Shortlisted', 'Rejected'].includes(normalizedStatus)) {
        errors.push(`Row ${rowNumber}: Invalid status "${row.Status}". Use: Registered, Unregistered, Shortlisted, or Rejected`);
        errorCount++;
        continue;
      }

      const studentData = {
        name: row.Name.trim(),
        email: row.Email.trim(),
        phone: row.Phone ? row.Phone.toString().trim() : '',
        status: normalizedStatus,
        registration_email_sent: false,
        shortlist_email_sent: false,
        drive_id: row['Drive ID'] ? row['Drive ID'].toString().trim() : null,
        uploaded_at: new Date().toISOString()
      };

      try {
        // Check if student already exists using Supabase client
        const { data: existingStudents, error: checkError } = await supabase
          .from('placement_registrations')
          .select('id')
          .eq('email', studentData.email);

        if (checkError) {
          throw new Error(`Database check error: ${checkError.message}`);
        }

        if (existingStudents && existingStudents.length > 0) {
          // Update existing student
          const { error: updateError } = await supabase
            .from('placement_registrations')
            .update(studentData)
            .eq('email', studentData.email);

          if (updateError) {
            throw new Error(`Database update error: ${updateError.message}`);
          }
        } else {
          // Insert new student
          const { error: insertError } = await supabase
            .from('placement_registrations')
            .insert(studentData);

          if (insertError) {
            throw new Error(`Database insert error: ${insertError.message}`);
          }
        }
        successCount++;
      } catch (error) {
        errors.push(`Row ${rowNumber}: Database error - ${error.message}`);
        errorCount++;
      }
    }

    // Clean up uploaded file
    const fs = await import('fs');
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Excel file processed successfully',
      success: successCount,
      failed: errorCount,
      errors: errors
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2️⃣ Send Registration Emails Endpoint
app.post('/api/admin/send-registration-emails', async (req, res) => {
  try {
    console.log('🚀 Sending registration emails...');

    const { data: students, error } = await supabase
      .from('placement_registrations')
      .select('*')
      .eq('status', 'Registered')
      .eq('registration_email_sent', false);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch students', details: error.message });
    }

    if (!students || students.length === 0) {
      return res.json({ 
        message: 'All registration emails have already been sent! 📧',
        success: 0, 
        failed: 0,
        note: 'No students found with Registered status who haven\'t received registration emails yet.',
        tip: 'To send emails again, reset the "registration_email_sent" flag to false for specific students.'
      });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors = [];

    console.log(`📧 Sending registration emails to ${students.length} students...`);

    for (const student of students) {
      if (!isValidEmail(student.email)) {
        errors.push(`Invalid email format: ${student.email}`);
        failedCount++;
        continue;
      }

      try {
        console.log(`📧 Sending registration email to ${student.email}...`);
        const result = await sendEmail(student, 'registration');
        
        if (result.success) {
          console.log(`✅ Registration email sent to ${student.email}`);
          
          // Update email sent flag
          await supabase
            .from('placement_registrations')
            .update({ registration_email_sent: true })
            .eq('id', student.id);
          
          successCount++;
        } else {
          console.log(`❌ Failed to send to ${student.email}: ${result.error}`);
          errors.push(`${student.email}: ${result.error}`);
          failedCount++;
        }

        // Rate limiting - 2 second delay between emails
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Error sending to ${student.email}:`, error);
        errors.push(`${student.email}: ${error.message}`);
        failedCount++;
      }
    }

    res.json({
      message: 'Registration email campaign completed',
      success: successCount,
      failed: failedCount,
      errors: errors
    });

  } catch (error) {
    console.error('❌ Registration email error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3️⃣ Send Shortlist Emails Endpoint
app.post('/api/admin/send-shortlist-emails', async (req, res) => {
  try {
    console.log('🚀 Sending shortlist emails...');

    const { data: students, error } = await supabase
      .from('placement_registrations')
      .select('*')
      .eq('status', 'Shortlisted')
      .eq('shortlist_email_sent', false);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch students', details: error.message });
    }

    if (!students || students.length === 0) {
      return res.json({ 
        message: 'All shortlist emails have already been sent! 🎉',
        success: 0, 
        failed: 0,
        note: 'No students found with Shortlisted status who haven\'t received shortlist emails yet.',
        tip: 'To send emails again, reset the "shortlist_email_sent" flag to false for specific students.'
      });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors = [];

    console.log(`📧 Sending shortlist emails to ${students.length} students...`);

    for (const student of students) {
      if (!isValidEmail(student.email)) {
        errors.push(`Invalid email format: ${student.email}`);
        failedCount++;
        continue;
      }

      try {
        console.log(`📧 Sending shortlist email to ${student.email}...`);
        const result = await sendEmail(student, 'shortlist');
        
        if (result.success) {
          console.log(`✅ Shortlist email sent to ${student.email}`);
          
          // Update email sent flag
          await supabase
            .from('placement_registrations')
            .update({ shortlist_email_sent: true })
            .eq('id', student.id);
          
          successCount++;
        } else {
          console.log(`❌ Failed to send to ${student.email}: ${result.error}`);
          errors.push(`${student.email}: ${result.error}`);
          failedCount++;
        }

        // Rate limiting - 2 second delay between emails
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Error sending to ${student.email}:`, error);
        errors.push(`${student.email}: ${error.message}`);
        failedCount++;
      }
    }

    res.json({
      message: 'Shortlist email campaign completed',
      success: successCount,
      failed: failedCount,
      errors: errors
    });

  } catch (error) {
    console.error('❌ Shortlist email error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/admin/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/admin/upload-excel',
      'POST /api/admin/send-registration-emails', 
      'POST /api/admin/send-shortlist-emails'
    ]
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log('🚀 Complete Admin Email System running on port', PORT);
  console.log('📋 Available endpoints:');
  console.log('  POST /api/admin/upload-excel');
  console.log('  POST /api/admin/send-registration-emails');
  console.log('  POST /api/admin/send-shortlist-emails');
  console.log('  GET  /api/admin/health');
});
