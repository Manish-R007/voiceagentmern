const PDFDocument = require('pdfkit');

// ── Brand colours ──────────────────────────────────────────────────────────
const NAVY  = '#0B1F3A';
const GOLD  = '#C9A84C';
const WHITE = '#FFFFFF';
const LIGHT = '#F7F6F2';
const GRAY  = '#6B7280';
const GREEN = '#059669';

/**
 * generateAppointmentPDF(appointment, doctor, patient)
 *
 * Returns a Promise that resolves to a Buffer containing the PDF.
 *
 * @param {Object} appointment  - { _id, date, time, service, notes, patientName, patientEmail, patientPhone }
 * @param {Object} doctor       - { name, specialization, qualification, experience, consultationFee, phone, address }
 * @param {Object} patient      - { name, email, phone }
 */
function generateAppointmentPDF(appointment, doctor, patient) {
  return new Promise((resolve, reject) => {
    try {
      const doc    = new PDFDocument({ size: 'A4', margin: 0, info: { Title: 'Appointment Confirmation — SmileCare Dental', Author: 'SmileCare Dental' } });
      const chunks = [];

      doc.on('data',  chunk => chunks.push(chunk));
      doc.on('end',   ()    => resolve(Buffer.concat(chunks)));
      doc.on('error', err   => reject(err));

      const W = doc.page.width;   // 595
      const H = doc.page.height;  // 842

      // ── HEADER BAND ────────────────────────────────────────────────────
      doc.rect(0, 0, W, 110).fill(NAVY);

      // Logo circle
      doc.circle(52, 55, 28).fill(GOLD);
      doc.fontSize(22).fillColor(NAVY).font('Helvetica-Bold').text('🦷', 36, 42, { lineBreak: false });

      // Clinic name
      doc.fontSize(22).fillColor(WHITE).font('Helvetica-Bold').text('SmileCare Dental', 94, 30);
      doc.fontSize(10).fillColor(GOLD).font('Helvetica').text('APPOINTMENT CONFIRMATION', 95, 57);
      doc.fontSize(9).fillColor('rgba(255,255,255,0.55)').text('Powered by Sarah AI', 95, 74);

      // Ref number top-right
      const refId = String(appointment._id).slice(-8).toUpperCase();
      doc.fontSize(9).fillColor('rgba(255,255,255,0.5)').font('Helvetica').text('Ref #', W - 120, 30, { width: 90, align: 'right' });
      doc.fontSize(13).fillColor(GOLD).font('Helvetica-Bold').text(refId, W - 120, 44, { width: 90, align: 'right' });

      // ── STATUS PILL ────────────────────────────────────────────────────
      doc.roundedRect(W / 2 - 70, 82, 140, 28, 14).fill(GREEN);
      doc.fontSize(11).fillColor(WHITE).font('Helvetica-Bold').text('✓  CONFIRMED', W / 2 - 70, 90, { width: 140, align: 'center' });

      // ── SECTION: Appointment Details ───────────────────────────────────
      let y = 138;

      doc.fontSize(11).fillColor(GOLD).font('Helvetica-Bold').text('APPOINTMENT DETAILS', 40, y);
      doc.moveTo(40, y + 16).lineTo(W - 40, y + 16).lineWidth(0.5).strokeColor(GOLD).stroke();
      y += 28;

      const apptDate = appointment.date
        ? new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : appointment.date || 'N/A';

      const detailRows = [
        ['Date',    apptDate],
        ['Time',    appointment.time || 'N/A'],
        ['Service', appointment.service || 'General Consultation'],
        ['Notes',   appointment.notes  || '—'],
      ];

      detailRows.forEach(([label, value]) => {
        doc.rect(40, y, W - 80, 32).fill(y % 64 === 0 ? WHITE : LIGHT);
        doc.fontSize(9).fillColor(GRAY).font('Helvetica').text(label.toUpperCase(), 52, y + 10, { width: 100 });
        doc.fontSize(10).fillColor(NAVY).font('Helvetica-Bold').text(value, 160, y + 10, { width: W - 220 });
        y += 32;
      });

      y += 20;

      // ── SECTION: Doctor Information ────────────────────────────────────
      doc.fontSize(11).fillColor(GOLD).font('Helvetica-Bold').text('DOCTOR INFORMATION', 40, y);
      doc.moveTo(40, y + 16).lineTo(W - 40, y + 16).lineWidth(0.5).strokeColor(GOLD).stroke();
      y += 28;

      // Doctor avatar circle
      doc.circle(72, y + 36, 30).fill(NAVY);
      const docInitial = (doctor.name || 'D').replace(/^Dr\.?\s*/i, '').charAt(0).toUpperCase();
      doc.fontSize(22).fillColor(GOLD).font('Helvetica-Bold').text(docInitial, 58, y + 22, { width: 28, align: 'center' });

      // Doctor details right of avatar
      const dx = 118;
      doc.fontSize(14).fillColor(NAVY).font('Helvetica-Bold').text(doctor.name || 'N/A', dx, y + 8);
      doc.fontSize(10).fillColor(GOLD).font('Helvetica').text(doctor.specialization || '', dx, y + 28);
      doc.fontSize(9).fillColor(GRAY).text(doctor.qualification || '', dx, y + 44);
      doc.fontSize(9).fillColor(GRAY).text(`${doctor.experience || 0} years experience`, dx, y + 58);
      if (doctor.phone) doc.fontSize(9).fillColor(GRAY).text(`📞 ${doctor.phone}`, dx, y + 72);

      y += 96;

      // ── CONSULTATION FEE BOX ───────────────────────────────────────────
      const fee = doctor.consultationFee || doctor.fee || 500;
      doc.roundedRect(40, y, W - 80, 64, 10).fill(NAVY);
      doc.fontSize(10).fillColor('rgba(255,255,255,0.55)').font('Helvetica').text('CONSULTATION FEE', 60, y + 12);
      doc.fontSize(26).fillColor(GOLD).font('Helvetica-Bold').text(`₹${fee.toLocaleString('en-IN')}`, 60, y + 26);
      doc.fontSize(9).fillColor('rgba(255,255,255,0.4)').font('Helvetica').text('Payable at the clinic on the day of appointment', W - 280, y + 35, { width: 200, align: 'right' });

      y += 84;

      // ── SECTION: Patient Information ───────────────────────────────────
      doc.fontSize(11).fillColor(GOLD).font('Helvetica-Bold').text('PATIENT INFORMATION', 40, y);
      doc.moveTo(40, y + 16).lineTo(W - 40, y + 16).lineWidth(0.5).strokeColor(GOLD).stroke();
      y += 28;

      const patientRows = [
        ['Name',  patient.name  || appointment.patientName  || 'N/A'],
        ['Email', patient.email || appointment.patientEmail || 'N/A'],
        ['Phone', patient.phone || appointment.patientPhone || 'N/A'],
      ];

      patientRows.forEach(([label, value]) => {
        doc.rect(40, y, W - 80, 30).fill(y % 60 === 0 ? WHITE : LIGHT);
        doc.fontSize(9).fillColor(GRAY).font('Helvetica').text(label.toUpperCase(), 52, y + 9, { width: 100 });
        doc.fontSize(10).fillColor(NAVY).font('Helvetica-Bold').text(value, 160, y + 9, { width: W - 220 });
        y += 30;
      });

      y += 24;

      // ── IMPORTANT NOTES BOX ────────────────────────────────────────────
      doc.roundedRect(40, y, W - 80, 90, 8)
        .lineWidth(1).strokeColor(GOLD).fillAndStroke(`${GOLD}10`, `${GOLD}50`);

      doc.fontSize(10).fillColor(NAVY).font('Helvetica-Bold').text('📋  Important Notes', 56, y + 12);
      const notes = [
        '• Please arrive 10 minutes before your scheduled appointment.',
        '• Bring any previous dental X-rays or records if available.',
        '• Inform the doctor of any ongoing medications or allergies.',
        '• Cancellations must be made at least 2 hours in advance.',
      ];
      notes.forEach((n, i) => {
        doc.fontSize(8.5).fillColor(GRAY).font('Helvetica').text(n, 56, y + 30 + i * 13, { width: W - 112 });
      });

      y += 106;

      // ── FOOTER ─────────────────────────────────────────────────────────
      doc.rect(0, H - 60, W, 60).fill(NAVY);
      doc.fontSize(9).fillColor('rgba(255,255,255,0.5)').font('Helvetica')
        .text('SmileCare Dental  ·  123 Dental Ave, Suite 100  ·  hello@smilecaredental.com  ·  +1 (555) 123-4567', 0, H - 42, { width: W, align: 'center' });
      doc.fontSize(8).fillColor('rgba(255,255,255,0.3)')
        .text('Generated by Sarah AI · This is a system-generated document', 0, H - 26, { width: W, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateAppointmentPDF };