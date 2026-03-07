const nodemailer = require('nodemailer');
const { generateAppointmentPDF } = require('./pdfservice');

// ── Transporter ────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true' || true,
  auth: {
    user: process.env.SMTP_USER,
    pass: (process.env.SMTP_PASS || '').replace(/\s/g, ''),
  },
});

const FROM = `"SmileCare Dental 🦷" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ── Patient confirmation email ─────────────────────────────────────────────
async function sendAppointmentConfirmation(appointment, doctor = null) {
  const doctorName = doctor?.name || appointment.doctorName || 'Our Doctor';
  const fee        = doctor?.consultationFee || doctor?.fee || 500;

  // Build patient object for PDF
  const patient = {
    name:  appointment.patientName  || 'Patient',
    email: appointment.patientEmail || '',
    phone: appointment.patientPhone || '',
  };

  // Generate PDF
  let pdfBuffer = null;
  try {
    pdfBuffer = await generateAppointmentPDF(appointment, { ...doctor, name: doctorName, consultationFee: fee }, patient);
  } catch (err) {
    console.error('PDF generation error (patient):', err.message);
  }

  const mailOptions = {
    from:    FROM,
    to:      appointment.patientEmail,
    subject: `✅ Appointment Confirmed — ${formatDate(appointment.date)} at ${appointment.time}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#F7F6F2;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(11,31,58,0.10);">

    <!-- Header -->
    <div style="background:#0B1F3A;padding:36px 40px 28px;">
      <table width="100%"><tr>
        <td>
          <div style="display:inline-block;background:#C9A84C;border-radius:50%;width:44px;height:44px;text-align:center;line-height:44px;font-size:22px;vertical-align:middle;">🦷</div>
          <span style="font-size:22px;font-weight:700;color:white;margin-left:12px;vertical-align:middle;">SmileCare Dental</span><br/>
          <span style="font-size:11px;color:#C9A84C;letter-spacing:0.15em;margin-left:58px;">DENTAL CLINIC</span>
        </td>
        <td align="right">
          <div style="background:#059669;color:white;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;display:inline-block;">✓ CONFIRMED</div>
        </td>
      </tr></table>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;">
      <h2 style="color:#0B1F3A;font-size:22px;margin:0 0 8px;">Your appointment is confirmed!</h2>
      <p style="color:#6B7280;font-size:15px;margin:0 0 28px;">Hi <strong style="color:#0B1F3A;">${patient.name}</strong>, here are your appointment details.</p>

      <!-- Appointment details table -->
      <table width="100%" cellspacing="0" cellpadding="0" style="border-radius:12px;overflow:hidden;margin-bottom:24px;">
        <tr style="background:#F7F6F2;">
          <td style="padding:12px 16px;font-size:11px;color:#9CA3AF;font-weight:700;letter-spacing:0.08em;width:140px;">DATE</td>
          <td style="padding:12px 16px;font-size:14px;color:#0B1F3A;font-weight:600;">${formatDate(appointment.date)}</td>
        </tr>
        <tr style="background:white;border-top:1px solid #F0EEE8;">
          <td style="padding:12px 16px;font-size:11px;color:#9CA3AF;font-weight:700;letter-spacing:0.08em;">TIME</td>
          <td style="padding:12px 16px;font-size:14px;color:#0B1F3A;font-weight:600;">${appointment.time || 'N/A'}</td>
        </tr>
        <tr style="background:#F7F6F2;border-top:1px solid #F0EEE8;">
          <td style="padding:12px 16px;font-size:11px;color:#9CA3AF;font-weight:700;letter-spacing:0.08em;">SERVICE</td>
          <td style="padding:12px 16px;font-size:14px;color:#0B1F3A;font-weight:600;">${appointment.service || 'General Consultation'}</td>
        </tr>
        <tr style="background:white;border-top:1px solid #F0EEE8;">
          <td style="padding:12px 16px;font-size:11px;color:#9CA3AF;font-weight:700;letter-spacing:0.08em;">DOCTOR</td>
          <td style="padding:12px 16px;font-size:14px;color:#0B1F3A;font-weight:600;">${doctorName}${doctor?.specialization ? ` — ${doctor.specialization}` : ''}</td>
        </tr>
        ${appointment.notes ? `
        <tr style="background:#F7F6F2;border-top:1px solid #F0EEE8;">
          <td style="padding:12px 16px;font-size:11px;color:#9CA3AF;font-weight:700;letter-spacing:0.08em;">NOTES</td>
          <td style="padding:12px 16px;font-size:14px;color:#0B1F3A;">${appointment.notes}</td>
        </tr>` : ''}
      </table>

      <!-- Fee box -->
      <div style="background:#0B1F3A;border-radius:12px;padding:20px 24px;margin-bottom:24px;display:flex;align-items:center;">
        <div>
          <p style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:700;letter-spacing:0.1em;margin:0 0 4px;">CONSULTATION FEE</p>
          <p style="color:#C9A84C;font-size:28px;font-weight:700;margin:0;">₹${fee.toLocaleString('en-IN')}</p>
        </div>
        <div style="margin-left:auto;text-align:right;">
          <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;">Payable at clinic</p>
          <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:4px 0 0;">on the day of visit</p>
        </div>
      </div>

      <!-- Important notes -->
      <div style="background:#FFFBEB;border:1px solid #C9A84C50;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
        <p style="color:#0B1F3A;font-weight:700;font-size:13px;margin:0 0 10px;">📋 Before you arrive</p>
        <ul style="color:#6B7280;font-size:13px;margin:0;padding-left:16px;line-height:1.9;">
          <li>Please arrive 10 minutes early.</li>
          <li>Bring any previous dental records or X-rays.</li>
          <li>Inform the doctor of ongoing medications or allergies.</li>
          <li>Cancellations must be made at least 2 hours in advance.</li>
        </ul>
      </div>

      <p style="color:#6B7280;font-size:13px;margin:0;">
        📎 Your appointment order with full details and fee breakdown is attached as a PDF.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#0B1F3A;padding:20px 40px;text-align:center;">
      <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;">SmileCare Dental · 123 Dental Ave · hello@smilecaredental.com · +1 (555) 123-4567</p>
      <p style="color:rgba(255,255,255,0.25);font-size:10px;margin:6px 0 0;">Generated by Sarah AI — Your Virtual Dental Receptionist</p>
    </div>
  </div>
</body>
</html>`,
    attachments: pdfBuffer ? [{
      filename: `SmileCare_Appointment_${refId(appointment)}.pdf`,
      content:  pdfBuffer,
      contentType: 'application/pdf',
    }] : [],
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Patient confirmation sent to ${appointment.patientEmail} — ${info.messageId}`);
  return info;
}

// ── Doctor notification email ──────────────────────────────────────────────
async function sendDoctorAppointmentNotification(appointment, doctor, patient) {
  if (!doctor?.email) {
    console.warn('⚠️  Doctor email not found, skipping doctor notification.');
    return null;
  }

  const fee = doctor?.consultationFee || doctor?.fee || 500;

  // Generate PDF
  let pdfBuffer = null;
  try {
    pdfBuffer = await generateAppointmentPDF(appointment, { ...doctor, consultationFee: fee }, patient);
  } catch (err) {
    console.error('PDF generation error (doctor):', err.message);
  }

  const mailOptions = {
    from:    FROM,
    to:      doctor.email,
    subject: `📅 New Appointment: ${patient?.name || appointment.patientName} — ${formatDate(appointment.date)} at ${appointment.time}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#F0FDF4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(5,150,105,0.10);">

    <!-- Header -->
    <div style="background:#065F46;padding:32px 40px 24px;">
      <table width="100%"><tr>
        <td>
          <span style="font-size:20px;font-weight:700;color:white;">SmileCare Dental</span><br/>
          <span style="font-size:11px;color:rgba(255,255,255,0.55);letter-spacing:0.12em;">DOCTOR PORTAL — NEW BOOKING</span>
        </td>
        <td align="right">
          <div style="background:#10B981;color:white;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;">📅 NEW APPOINTMENT</div>
        </td>
      </tr></table>
    </div>

    <div style="padding:32px 40px;">
      <h2 style="color:#065F46;font-size:20px;margin:0 0 6px;">New appointment booked, ${doctor.name}!</h2>
      <p style="color:#6B7280;font-size:14px;margin:0 0 24px;">Sarah has confirmed a new patient appointment. Here are the full details:</p>

      <!-- Patient info -->
      <div style="background:#F0FDF4;border:1px solid #A7F3D0;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
        <p style="color:#065F46;font-weight:700;font-size:13px;margin:0 0 12px;">👤 Patient Details</p>
        <table width="100%" cellspacing="0">
          ${[
            ['Name',  patient?.name  || appointment.patientName  || 'N/A'],
            ['Email', patient?.email || appointment.patientEmail || 'N/A'],
            ['Phone', patient?.phone || appointment.patientPhone || 'N/A'],
          ].map(([l, v]) => `
          <tr>
            <td style="color:#9CA3AF;font-size:11px;font-weight:700;letter-spacing:0.08em;padding:5px 0;width:80px;">${l.toUpperCase()}</td>
            <td style="color:#065F46;font-size:13px;font-weight:600;padding:5px 0;">${v}</td>
          </tr>`).join('')}
        </table>
      </div>

      <!-- Appointment info -->
      <table width="100%" cellspacing="0" cellpadding="0" style="border-radius:12px;overflow:hidden;margin-bottom:20px;">
        ${[
          ['DATE',    formatDate(appointment.date)],
          ['TIME',    appointment.time    || 'N/A'],
          ['SERVICE', appointment.service || 'General Consultation'],
          ['NOTES',   appointment.notes   || '—'],
        ].map(([l, v], i) => `
        <tr style="background:${i % 2 === 0 ? '#F9FAF9' : 'white'};${i > 0 ? 'border-top:1px solid #F0EEE8;' : ''}">
          <td style="padding:11px 16px;font-size:11px;color:#9CA3AF;font-weight:700;letter-spacing:0.08em;width:130px;">${l}</td>
          <td style="padding:11px 16px;font-size:13px;color:#065F46;font-weight:600;">${v}</td>
        </tr>`).join('')}
      </table>

      <!-- Fee earned -->
      <div style="background:#065F46;border-radius:12px;padding:18px 24px;margin-bottom:24px;">
        <p style="color:rgba(255,255,255,0.55);font-size:11px;font-weight:700;letter-spacing:0.1em;margin:0 0 4px;">YOUR CONSULTATION FEE</p>
        <p style="color:#6EE7B7;font-size:26px;font-weight:700;margin:0;">₹${fee.toLocaleString('en-IN')}</p>
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:4px 0 0;">Collectible at clinic on the day of appointment</p>
      </div>

      <p style="color:#6B7280;font-size:13px;margin:0;">
        📎 The full appointment order PDF is attached for your records.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#065F46;padding:18px 40px;text-align:center;">
      <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;">SmileCare Dental · Doctor Portal · Generated by Sarah AI</p>
    </div>
  </div>
</body>
</html>`,
    attachments: pdfBuffer ? [{
      filename: `SmileCare_Appointment_${refId(appointment)}.pdf`,
      content:  pdfBuffer,
      contentType: 'application/pdf',
    }] : [],
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Doctor notification sent to ${doctor.email} — ${info.messageId}`);
  return info;
}

// ── Helper: short ref ID from appointment ──────────────────────────────────
function refId(appointment) {
  return String(appointment._id || Date.now()).slice(-8).toUpperCase();
}

// ── Test connection ────────────────────────────────────────────────────────
async function verifyConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email service connected.');
  } catch (err) {
    console.error('❌ Email service error:', err.message);
  }
}

module.exports = {
  sendAppointmentConfirmation,
  sendDoctorAppointmentNotification,
  verifyConnection,
};