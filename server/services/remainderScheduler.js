const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const emailService = require('./emailService');

class ReminderScheduler {
  constructor() {
    // Run every hour to check for appointments in 24 hours
    cron.schedule('0 * * * *', this.checkAndSendReminders.bind(this));
  }

  async checkAndSendReminders() {
    try {
      console.log('Checking for appointments to send reminders...');
      
      // Get current date and time
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Find appointments scheduled for tomorrow
      const appointments = await Appointment.find({
        date: {
          $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
          $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
        },
        status: 'scheduled'
      });

      console.log(`Found ${appointments.length} appointments for tomorrow`);

      // Send reminders
      for (const appointment of appointments) {
        await emailService.sendAppointmentReminder(
          appointment,
          {
            name: appointment.patientName,
            email: appointment.patientEmail
          }
        );
      }
    } catch (error) {
      console.error('Error sending reminders:', error);
    }
  }
}

module.exports = new ReminderScheduler();