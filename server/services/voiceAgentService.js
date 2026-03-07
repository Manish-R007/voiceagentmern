const Cerebras     = require('@cerebras/cerebras_cloud_sdk');
const Appointment  = require('../models/Appointment');
const Conversation = require('../models/Conversation');
const Doctor       = require('../models/doctor');
const emailService = require('./emailService');

/* ================================================================
   EMAIL HELPERS
================================================================ */

function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((str || '').trim());
}

/**
 * Convert spoken email words into a proper email address.
 * "manish raja a 2 0 5 at gmail dot com" → "manishrajaa205@gmail.com"
 */
function normalizeSpokenEmail(transcript) {
  if (!transcript) return transcript;

  const lower = transcript.toLowerCase().trim();

  // Only process if it looks like a spoken email
  if (!((lower.includes(' at ') || lower.includes('@')) &&
        (lower.includes(' dot ') || lower.includes('.')))) {
    return transcript;
  }

  const SYMBOL_MAP = {
    'at':          '@', 'at the rate': '@', 'at sign': '@',
    'dot':         '.', 'point':       '.', 'period':  '.',
    'underscore':  '_', 'under score': '_',
    'hyphen':      '-', 'dash':        '-', 'minus':   '-',
    'zero': '0', 'oh': '0',
    'one':  '1',
    'two':  '2', 'to': '2', 'too': '2',
    'three':'3',
    'four': '4', 'for': '4',
    'five': '5',
    'six':  '6',
    'seven':'7',
    'eight':'8', 'ate': '8',
    'nine': '9',
  };

  // Strip leading "my email is", "email address is" etc.
  const stripped = lower
    .replace(/^(my\s+)?(email\s+)?(address\s+)?(is\s+)?/i, '')
    .trim();

  const tokens = stripped.split(/[\s,]+/).filter(Boolean);
  let result = '';
  let i = 0;

  while (i < tokens.length) {
    const token   = tokens[i].toLowerCase();
    const twoWord = i + 1 < tokens.length ? `${token} ${tokens[i+1].toLowerCase()}` : null;

    if (twoWord && SYMBOL_MAP[twoWord] !== undefined) {
      result += SYMBOL_MAP[twoWord];
      i += 2;
      continue;
    }
    if (SYMBOL_MAP[token] !== undefined) {
      result += SYMBOL_MAP[token];
      i++;
      continue;
    }
    if (/^\d+$/.test(token)) {
      result += token;
      i++;
      continue;
    }
    result += token;
    i++;
  }

  // Sanity check — must look like a real email
  const atCount = (result.match(/@/g) || []).length;
  const hasDot  = result.includes('.') && result.indexOf('.') > result.indexOf('@');
  if (atCount !== 1 || !hasDot || result.length < 6) return transcript;

  return result;
}

/**
 * Final cleanup — remove spaces around @ and dots.
 * Handles Deepgram smart_format leftovers like "user @gmail.com"
 */
function cleanEmail(raw) {
  if (!raw) return '';
  let email = normalizeSpokenEmail(raw.toLowerCase().trim());
  email = email
    .replace(/\s*@\s*/g, '@')
    .replace(/\s*\.\s*/g, '.')
    .replace(/\s+/g, '');
  return email;
}

/**
 * Read email back in a voice-friendly way.
 * "manishrajaa205@gmail.com" → "manishrajaa205 at gmail dot com"
 */
function spokenEmail(email) {
  return email.replace('@', ' at ').replace(/\./g, ' dot ');
}

/* ================================================================
   VOICE AGENT SERVICE
================================================================ */

class VoiceAgentService {
  constructor() {
    const key = process.env.CEREBRAS_API_KEY;
    if (!key) throw new Error('❌ CEREBRAS_API_KEY missing from .env');
    this.client = new Cerebras({ apiKey: key });

    this.modelNames     = ['gpt-oss-120b'];
    this.modelCooldowns = {};

    this.tools = [
      {
        type: 'function',
        function: {
          name: 'get_doctors',
          description: 'Get list of all available doctors with their specialization, experience, and details.',
          parameters: {
            type: 'object',
            properties: {
              specialization: { type: 'string', description: 'Optional filter by specialization' }
            },
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'check_availability',
          description: 'Check available appointment slots for a specific date.',
          parameters: {
            type: 'object',
            properties: {
              date:     { type: 'string', description: 'Date (YYYY-MM-DD)' },
              doctorId: { type: 'string', description: 'Optional doctor ID' }
            },
            required: ['date']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'book_appointment',
          description: 'Book an appointment. Only call this AFTER the patient has verbally confirmed their email is correct.',
          parameters: {
            type: 'object',
            properties: {
              patientName:  { type: 'string' },
              patientPhone: { type: 'string' },
              patientEmail: { type: 'string' },
              date:         { type: 'string', description: 'YYYY-MM-DD' },
              time:         { type: 'string', description: 'HH:MM 24h' },
              service: {
                type: 'string',
                enum: ['General Checkup','Teeth Cleaning','Root Canal','Dental Crowns','Teeth Whitening','Emergency']
              },
              doctorId:   { type: 'string' },
              doctorName: { type: 'string' },
              notes:      { type: 'string' }
            },
            required: ['patientName','patientPhone','patientEmail','date','time','service']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'cancel_appointment',
          description: 'Cancel an existing appointment.',
          parameters: {
            type: 'object',
            properties: {
              appointmentId: { type: 'string' },
              reason:        { type: 'string' }
            },
            required: ['appointmentId']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_clinic_info',
          description: 'Get clinic information like address, phone, hours.',
          parameters: {
            type: 'object',
            properties: {
              infoType: { type: 'string', enum: ['address','phone','hours','emergency','all'] }
            },
            required: ['infoType']
          }
        }
      }
    ];

    this.systemPrompt = `You are Sarah, a friendly and professional dental clinic receptionist at SmileCare Dental.

Your role:
1. Greet patients warmly and help them feel comfortable
2. Help schedule, reschedule, or cancel appointments
3. Tell patients about available doctors — always use the get_doctors tool
4. Collect patient info (name, phone, email) before booking
5. Be empathetic and concise — keep responses under 40 words when possible

CRITICAL EMAIL RULE — follow this every single time without exception:
- After the patient gives their email, ALWAYS read it back letter by letter before booking.
- Say: "Just to confirm, your email is [read email as: user at domain dot com]. Is that correct?"
- Only call book_appointment AFTER the patient says yes/correct/confirmed.
- If the email looks invalid (missing @, no dot after @, or garbled), do NOT attempt to book.
  Instead say: "I didn't quite catch that — could you please spell out your email address?"
- Ask the patient to say it slowly: "[letter][letter][number] at [domain] dot [tld]"

Booking flow:
1. Ask for name → phone → email
2. Read email back and wait for confirmation
3. Ask for preferred date/time and service
4. Call check_availability → confirm slot → call book_appointment
5. Read back full booking summary

Clinic: SmileCare Dental | Mon-Fri 9am-6pm | Sat 10am-4pm
Emergency: +1 (555) 911-0123`;
  }

  /* ── Cooldown helpers ───────────────────────────── */
  isOnCooldown(model) {
    const until = this.modelCooldowns[model];
    if (!until) return false;
    if (Date.now() < until) return true;
    delete this.modelCooldowns[model];
    return false;
  }
  setCooldown(model, seconds) {
    this.modelCooldowns[model] = Date.now() + seconds * 1000;
    console.warn(`⏳ ${model} cooldown: ${seconds}s`);
  }

  /* =========================================================
     CALL CEREBRAS WITH FALLBACK
  ========================================================= */
  async callWithFallback(messages) {
    const available = this.modelNames.filter(m => !this.isOnCooldown(m));
    if (!available.length) {
      const soonest = this.modelNames.reduce((a, b) =>
        (this.modelCooldowns[a] || 0) < (this.modelCooldowns[b] || 0) ? a : b);
      const wait = Math.max(0, this.modelCooldowns[soonest] - Date.now());
      await new Promise(r => setTimeout(r, wait + 500));
      delete this.modelCooldowns[soonest];
      available.push(soonest);
    }

    let lastError;
    for (const model of available) {
      try {
        console.log(`🤖 Calling Cerebras: ${model}`);
        const msgList = [...messages];

        let response = await this.client.chat.completions.create({
          model,
          messages:    msgList,
          tools:       this.tools,
          tool_choice: 'auto',
          max_tokens:  parseInt(process.env.AI_ASSISTANT_MAX_TOKENS) || 512,
          temperature: parseFloat(process.env.AI_ASSISTANT_TEMPERATURE) || 0.7,
        });

        let assistantMsg = response.choices[0].message;

        while (assistantMsg.tool_calls?.length) {
          console.log(`🔧 Tools: ${assistantMsg.tool_calls.map(t => t.function.name).join(', ')}`);
          msgList.push(assistantMsg);

          for (const tc of assistantMsg.tool_calls) {
            let args;
            try { args = JSON.parse(tc.function.arguments); } catch { args = {}; }
            console.log(`  ↳ ${tc.function.name}`, args);

            const result = await this.executeTool(tc.function.name, args);
            msgList.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
          }

          response = await this.client.chat.completions.create({
            model, messages: msgList, tools: this.tools, tool_choice: 'auto',
            max_tokens: 512, temperature: 0.7,
          });
          assistantMsg = response.choices[0].message;
        }

        const text = assistantMsg.content?.trim();
        if (!text) throw new Error('Empty response');
        console.log(`✅ ${model} responded`);
        return text;

      } catch (err) {
        const status = err?.status ?? err?.statusCode;
        lastError = err;
        if ([429, 503, 500, 502].includes(status)) {
          this.setCooldown(model, status === 429 ? 60 : 30);
          continue;
        }
        throw err;
      }
    }
    throw lastError ?? new Error('All models unavailable');
  }

  /* =========================================================
     PROCESS USER INPUT
  ========================================================= */
  async processUserInput(userText, conversationId = null) {
    try {
      const cleaned = userText?.trim() ?? '';
      if (cleaned.length < 3) return { text: null, conversationId, suppressed: true };

      let conversation;
      if (conversationId) conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        conversation = new Conversation({ sessionId: `session_${Date.now()}`, messages: [] });
      }

      conversation.messages.push({ role: 'user', content: cleaned, timestamp: new Date() });

      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...conversation.messages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => ({ role: m.role, content: m.content }))
      ];

      const replyText = await this.callWithFallback(messages);

      conversation.messages.push({ role: 'assistant', content: replyText, timestamp: new Date() });
      await conversation.save();
      console.log(`🤖 Sarah: "${replyText}"`);

      return { text: replyText, conversationId: conversation._id };
    } catch (err) {
      console.error('❌ Voice Agent Error:', err);
      return {
        text: "I apologize, but I'm having trouble right now. Could you please try again?",
        conversationId, error: true
      };
    }
  }

  /* =========================================================
     TOOL EXECUTOR
  ========================================================= */
  async executeTool(name, args) {
    try {
      switch (name) {
        case 'get_doctors':        return await this.getDoctors(args.specialization);
        case 'check_availability': return await this.checkAvailability(args.date, args.doctorId);
        case 'book_appointment':   return await this.bookAppointment(args);
        case 'cancel_appointment': return await this.cancelAppointment(args.appointmentId, args.reason);
        case 'get_clinic_info':    return this.getClinicInfo(args.infoType);
        default:                   return { error: 'Unknown tool' };
      }
    } catch (err) {
      console.error(`Tool error (${name}):`, err);
      return { success: false, error: 'Tool failed' };
    }
  }

  /* ─── get_doctors ────────────────────────────────────── */
  async getDoctors(specialization = null) {
    const query = { isActive: true };
    if (specialization) query.specialization = new RegExp(specialization, 'i');
    const doctors = await Doctor.find(query).select('-password -__v').sort({ rating: -1 });
    if (!doctors.length) return { success: true, doctors: [], message: 'No doctors found.' };
    const list = doctors.map(d => ({
      id:             d._id,
      name:           d.name,
      specialization: d.specialization,
      experience:     `${d.experience} years`,
      qualification:  d.qualification,
      address:        d.address,
      phone:          d.phone,
      services:       d.services,
      rating:         d.rating,
      languages:      d.languages,
    }));
    return {
      success: true,
      count:   list.length,
      doctors: list,
      summary: list.map(d =>
        `Dr. ${d.name} — ${d.specialization}, ${d.experience} experience, ${d.qualification}`
      ).join('; ')
    };
  }

  /* ─── check_availability ─────────────────────────────── */
  async checkAvailability(date, doctorId = null) {
    const slots   = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00'];
    const query   = { date: new Date(date), status: 'scheduled' };
    if (doctorId) query.doctorId = doctorId;
    const booked  = await Appointment.find(query);
    const taken   = booked.map(a => a.time);
    const available = slots.filter(s => !taken.includes(s));
    return {
      success: true, date, doctorId: doctorId || 'any',
      availableSlots: available,
      message: available.length
        ? `Available: ${available.join(', ')}`
        : 'No slots on this date. Try another?'
    };
  }

  /* ─── book_appointment ───────────────────────────────── */
  async bookAppointment(data) {
    // ── Sanitise & validate email before saving ──────────────
    const rawEmail    = data.patientEmail || '';
    const cleanedEmail = cleanEmail(rawEmail);

    if (!isValidEmail(cleanedEmail)) {
      console.warn(`⚠️  Invalid email rejected: "${rawEmail}" → "${cleanedEmail}"`);
      return {
        success: false,
        message: `The email address "${rawEmail}" doesn't look valid. Please ask the patient to confirm their email again.`
      };
    }

    if (cleanedEmail !== rawEmail) {
      console.log(`📧 Email auto-corrected: "${rawEmail}" → "${cleanedEmail}"`);
    }

    // ── Check slot not already taken ─────────────────────────
    const existing = await Appointment.findOne({
      date: new Date(data.date), time: data.time, status: 'scheduled',
      ...(data.doctorId ? { doctorId: data.doctorId } : {})
    });
    if (existing) return { success: false, message: 'Slot unavailable. Choose another time.' };

    // ── Resolve doctor ────────────────────────────────────────
    let doctor = null;
    if (data.doctorId)   doctor = await Doctor.findById(data.doctorId);
    else if (data.doctorName) doctor = await Doctor.findOne({ name: new RegExp(data.doctorName, 'i') });

    const appt = new Appointment({
      patientName:  data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: cleanedEmail,          // always use the cleaned version
      date:         new Date(data.date),
      time:         data.time,
      service:      data.service,
      notes:        data.notes || '',
      status:       'scheduled',
      doctorId:     doctor?._id || null,
      dentist:      doctor ? `Dr. ${doctor.name}` : (data.doctorName || 'Dr. Smith'),
    });
    await appt.save();
    console.log('✅ Appointment saved:', appt._id);

    // ── Email patient ─────────────────────────────────────────
    try {
      await emailService.sendAppointmentConfirmation(appt, {
        name:  data.patientName,
        email: cleanedEmail
      });
      console.log('✅ Patient confirmation email sent to', cleanedEmail);
    } catch (e) { console.warn('⚠️ Patient email failed:', e.message); }

    // ── Email doctor ──────────────────────────────────────────
    if (doctor?.email) {
      try {
        await emailService.sendDoctorAppointmentNotification(appt, doctor, {
          name:  data.patientName,
          email: cleanedEmail,
          phone: data.patientPhone,
        });
        console.log('✅ Doctor notification sent to', doctor.email);
      } catch (e) { console.warn('⚠️ Doctor email failed:', e.message); }
    }

    return {
      success:       true,
      appointmentId: appt._id,
      message:       `${data.service} booked for ${data.date} at ${data.time} with ${appt.dentist}. Confirmation sent to ${cleanedEmail}.`
    };
  }

  /* ─── cancel_appointment ─────────────────────────────── */
  async cancelAppointment(appointmentId, reason = '') {
    const appt = await Appointment.findById(appointmentId);
    if (!appt) return { success: false, message: 'Appointment not found.' };
    appt.status = 'cancelled';
    await appt.save();
    try {
      await emailService.sendCancellationEmail(appt, { name: appt.patientName, email: appt.patientEmail });
    } catch (e) { console.warn('⚠️ Cancel email failed:', e.message); }
    return { success: true, message: 'Appointment cancelled.', appointmentId };
  }

  /* ─── get_clinic_info ────────────────────────────────── */
  getClinicInfo(infoType) {
    const info = {
      address:   process.env.CLINIC_ADDRESS        || '123 Dental Ave, Suite 100, New York, NY 10001',
      phone:     process.env.CLINIC_PHONE           || '+1 (555) 123-4567',
      hours:     'Monday-Friday: 9am-6pm, Saturday: 10am-4pm, Sunday: Closed',
      emergency: process.env.CLINIC_EMERGENCY_PHONE || '+1 (555) 911-0123',
    };
    if (infoType === 'all') return { success: true, ...info };
    return { success: true, [infoType]: info[infoType] };
  }
}

module.exports = new VoiceAgentService();