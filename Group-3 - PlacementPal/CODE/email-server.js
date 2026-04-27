import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import express from 'express';

const app = express();
app.use(express.json());


app.post('/api/send-emails', async (req, res) => {
  try {
    console.log('🚀 Gmail SMTP request received:', req.body);
    
    const { type } = req.body;
    
    // Fetch students from database
    let query = supabase.from('placement_registrations').select('*');
    
    if (type === 'registration') {
      query = query.eq('status', 'Registered').eq('registration_email_sent', false);
    } else if (type === 'shortlist') {
      query = query.eq('status', 'Shortlisted').eq('shortlist_email_sent', false);
    }
    
    const { data: students, error: fetchError } = await query;
    
    if (fetchError) {
      console.error('❌ Database fetch error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch students', details: fetchError.message });
    }
    
    if (!students || students.length === 0) {
      console.log('📭 No students to email');
      return res.json({ message: 'No students to email', sent: 0, failed: 0 });
    }
    
    console.log(`👥 Found ${students.length} students to email`);
    
    let sentCount = 0;
    let failedCount = 0;
    const errors = [];
    
    // Send emails using real Gmail SMTP
    for (const student of students) {
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
        console.log(`📧 Sending email to ${student.email}...`);
        
        // Send REAL email using nodemailer
        await transporter.sendMail({
          from: 'muazshaikh7861@gmail.com',
          to: student.email,
          subject: emailContent.subject,
          html: emailContent.html
        });
        
        console.log('✅ REAL Gmail email sent successfully to:', student.email);
        
        // Update email sent flag in database
        const updateField = type === 'registration' ? 'registration_email_sent' : 'shortlist_email_sent';
        const { error: updateError } = await supabase
          .from('placement_registrations')
          .update({ [updateField]: true })
          .eq('id', student.id);
        
        if (updateError) {
          console.error('❌ Database update error for', student.email, ':', updateError);
        }
        
        sentCount++;
        
        // Add delay between emails
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error('❌ Gmail SMTP send error for', student.email, ':', error);
        failedCount++;
        errors.push(`Failed to send email to ${student.email}: ${error.message}`);
      }
    }
    
    res.json({
      message: `🎉 REAL Gmail SMTP email sending completed!`,
      sent: sentCount,
      failed: failedCount,
      errors: errors,
      note: 'REAL emails sent via Gmail SMTP to student addresses'
    });
    
  } catch (error) {
    console.error('❌ Gmail SMTP error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('🚀 Gmail SMTP server running on port 3001');
});
