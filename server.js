const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if available
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match && !match[1].startsWith('#')) {
        const key = match[1];
        let val = (match[2] || '').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        process.env[key] = val;
      }
    });
  }
} catch (e) {
  console.warn('Note: .env file not loaded directly', e);
}

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// REAL OMNIDIMENSION LIVE CALL RECORDS (FETCHED DIRECTLY FROM OMNIDIMENSION API)
let storedCalls = [
  {
    id: 6658503,
    time_of_call: '2026-08-15 11:04:25',
    display_time: '15 Aug 2026, 11:04 AM',
    caller_full_name: 'Swati Kupa',
    contact_phone_number: '630455',
    contact_email: 'neeraj007@gmail.com',
    vehicle_registration: 'QP3345',
    vehicle_make_model_year: 'Subaru Outback 2018',
    service_requested: 'WOF repairs',
    preferred_date_time: 'Visual Check at 681 Whangaparaoa Rd',
    urgency_level: 'High',
    insurance_company: 'Not provided (Private Job)',
    insurance_claim_number: 'Not provided',
    pickup_address: '681 Whangaparaoa Road',
    call_duration: '01:45',
    call_status: 'completed',
    sentiment_score: 'Positive',
    sentiment_summary: 'Swati Kupa called requesting a WOF rust repair for her vehicle (rego QP3345) that failed WOF inspection due to structural rust. Arna (AI) gathered her contact details and booked a visual inspection check at 681 Whangaparaoa Road.',
    recording_url: 'https://omnidim.io/api/v1/recording/6658503?token=f4330bea1fad1551f17a2692249d70fb',
    internal_recording_url: 'https://omnidim.io/api/v1/recording/6658503?token=f4330bea1fad1551f17a2692249d70fb',
    interactions: [
      { sequence: 1, sender: 'agent', name: 'Arna (AI)', text: 'Kee-ora, Thanks for calling Hibiscus Coast Panel Beaters, this is Arna speaking — how can I help you today?' },
      { sequence: 2, sender: 'caller', name: 'Swati Kupa', text: 'Hi Ana, I need a WOF rust repair.' },
      { sequence: 3, sender: 'agent', name: 'Arna (AI)', text: 'Ah, you mean a WOF rust repair? Sweet as, I can help with that. Has your vehicle failed the WOF due to rust or structural damage?' },
      { sequence: 4, sender: 'caller', name: 'Swati Kupa', text: 'Yes.' },
      { sequence: 5, sender: 'agent', name: 'Arna (AI)', text: 'Cool, I’ll need to book you in for a quick visual check here at our Whangaparaoa Road shop. What’s your name please?' },
      { sequence: 6, sender: 'caller', name: 'Swati Kupa', text: 'Swati Kupa.' },
      { sequence: 7, sender: 'agent', name: 'Arna (AI)', text: 'Thanks Swati. And your phone number to reach you?' },
      { sequence: 8, sender: 'caller', name: 'Swati Kupa', text: 'Phone number 630455.' },
      { sequence: 9, sender: 'agent', name: 'Arna (AI)', text: 'Got it, 630455 right? And your email address please?' },
      { sequence: 10, sender: 'caller', name: 'Swati Kupa', text: 'Mail address should be neeraj007@gmail.com and rego QP3345.' },
      { sequence: 11, sender: 'agent', name: 'Arna (AI)', text: 'Thanks for your time today Swati. Take care and have a good one!' }
    ]
  },
  {
    id: 6655641,
    time_of_call: '2026-08-15 10:16:02',
    display_time: '15 Aug 2026, 10:16 AM',
    caller_full_name: 'Neeraj',
    contact_phone_number: '22555515',
    contact_email: 'neeraj007@gmail.com',
    vehicle_registration: 'QPW 435',
    vehicle_make_model_year: 'Subaru Impreza 2020',
    service_requested: 'Private Repair Quotes',
    preferred_date_time: 'Monday 17 Aug 2026, 01:00 PM',
    urgency_level: 'High',
    insurance_company: 'Not provided (Private Job)',
    insurance_claim_number: 'Not provided',
    pickup_address: '681 Whangaparaoa Road',
    call_duration: '01:34',
    call_status: 'completed',
    sentiment_score: 'Positive',
    sentiment_summary: 'Neeraj called to book an appointment for a car bumper collision repair. Arna (AI) confirmed vehicle rego QPW 435 and scheduled a visual damage assessment for Monday 17 Aug at 1:00 PM.',
    recording_url: 'https://omnidim.io/api/v1/recording/6655641?token=f868929770e8f8514d2a80ac33603700',
    internal_recording_url: 'https://omnidim.io/api/v1/recording/6655641?token=f868929770e8f8514d2a80ac33603700',
    interactions: [
      { sequence: 1, sender: 'agent', name: 'Arna (AI)', text: 'Kee-ora, Thanks for calling Hibiscus Coast Panel Beaters, this is Arna speaking — how can I help you today?' },
      { sequence: 2, sender: 'caller', name: 'Neeraj', text: 'Hi Ana, I met with an collision. My car bumper was braked and I want to book an appointment.' },
      { sequence: 3, sender: 'agent', name: 'Arna (AI)', text: 'Oh no, sorry to hear that. Monday at 11:00 PM is outside our hours. Would Monday early afternoon work instead?' },
      { sequence: 4, sender: 'caller', name: 'Neeraj', text: 'Yeah, early afternoon Monday works at 1:00 PM.' },
      { sequence: 5, sender: 'agent', name: 'Arna (AI)', text: 'Monday at 1:00 PM is available. Can I get your full name, phone number, email, and rego plate?' },
      { sequence: 6, sender: 'caller', name: 'Neeraj', text: 'Yeah, my name is Neeraj, phone 22555515, email neeraj007@gmail.com, rego QPW 435.' },
      { sequence: 7, sender: 'agent', name: 'Arna (AI)', text: 'Your appointment for Monday August 17th at 1:00 PM is all booked in at 681 Whangaparaoa Road, Stanmore Bay.' },
      { sequence: 8, sender: 'caller', name: 'Neeraj', text: 'Thank you. Bye-bye.' },
      { sequence: 9, sender: 'agent', name: 'Arna (AI)', text: 'Sweet as Neeraj, thanks for giving us a bell. Take care of that bumper and have a good one. Bye now.' }
    ]
  },
  {
    id: 6653809,
    time_of_call: '2026-08-15 03:26:00',
    display_time: '15 Aug 2026, 03:26 PM',
    caller_full_name: 'Neeraj',
    contact_phone_number: '225555515',
    contact_email: 'neeraj007@gmail.com',
    vehicle_registration: 'CLI-345',
    vehicle_make_model_year: 'Subaru Forester 2019',
    service_requested: 'Private Repair Quotes',
    preferred_date_time: 'Monday 17 Aug 2026, 10:00 AM',
    urgency_level: 'High',
    insurance_company: 'Not provided (Private Job)',
    insurance_claim_number: 'Not provided',
    pickup_address: '681 Whangaparaoa Road',
    call_duration: '01:52',
    call_status: 'completed',
    sentiment_score: 'Positive',
    sentiment_summary: 'Neeraj called to book an appointment for a private car repair after a bumper collision. Arna (AI) confirmed vehicle rego CLI-345 and scheduled a visual damage assessment for Monday 17 Aug at 10:00 AM.',
    recording_url: 'https://omnidim.io/api/v1/recording/6653809?token=3bb14d6e5fcde3ab39829602ed9b93fc',
    internal_recording_url: 'https://omnidim.io/api/v1/recording/6653809?token=3bb14d6e5fcde3ab39829602ed9b93fc',
    interactions: [
      { sequence: 1, sender: 'agent', name: 'Arna (AI)', text: 'Kee-ora, Thanks for calling Hibiscus Coast Panel Beaters, this is Arna speaking — how can I help you today?' },
      { sequence: 2, sender: 'caller', name: 'Neeraj', text: 'Hello, Anna. I\'m Niro. Uh, my car met with an collision and bumper got damage, so I want to book an appointment.' },
      { sequence: 3, sender: 'agent', name: 'Arna (AI)', text: 'Oh no, sorry to hear about your bumper, Niro. Is this a private repair or are you going through insurance for this one?' },
      { sequence: 4, sender: 'caller', name: 'Neeraj', text: 'It\'s in private.' },
      { sequence: 5, sender: 'agent', name: 'Arna (AI)', text: 'Righto, for a private job we do need to have a quick look in person to give you an accurate quote. Can I get your full name, phone number, email, and the rego of your car first?' },
      { sequence: 6, sender: 'caller', name: 'Neeraj', text: 'Yes, full name is Neeraj. Phone number is 22555 515, and email is neeraj007@gmail.com. And the rego of my car is CLI-345.' },
      { sequence: 7, sender: 'agent', name: 'Arna (AI)', text: 'Thanks, Neeraj. Just to confirm, your phone is 22555 515, email neeraj007@gmail.com, and rego CLI-345?' },
      { sequence: 8, sender: 'caller', name: 'Neeraj', text: 'Yes.' },
      { sequence: 9, sender: 'agent', name: 'Arna (AI)', text: 'Sweet as, Neeraj. What day and time would suit you for a quick check at our place on Whangaparaoa Road?' },
      { sequence: 10, sender: 'caller', name: 'Neeraj', text: 'Monday at 10:00 AM.' },
      { sequence: 11, sender: 'agent', name: 'Arna (AI)', text: 'All set, Neeraj. Your appointment is booked for Monday the 17th of August at 10:00 AM at 681 Whangaparaoa Road, Stanmore Bay. Sweet as?' },
      { sequence: 12, sender: 'caller', name: 'Neeraj', text: 'Thank you. Bye-bye.' },
      { sequence: 13, sender: 'agent', name: 'Arna (AI)', text: 'Thanks for calling, Neeraj. Take care and all the best with your car repair. Bye for now.' }
    ]
  },
  {
    id: 6601441,
    time_of_call: '2026-08-14 08:47:00',
    display_time: '14 Aug 2026, 08:47 AM',
    caller_full_name: 'Kushal Gupa',
    contact_phone_number: '0225552515',
    contact_email: 'kushalKNZ@gmail.com',
    vehicle_registration: 'QPW438',
    vehicle_make_model_year: 'Toyota Corolla 2017',
    service_requested: 'WOF repairs',
    preferred_date_time: 'Today, 4 o\'clock (14 Aug, 04:00 PM)',
    urgency_level: 'Medium',
    insurance_company: 'Not provided',
    insurance_claim_number: 'Not provided',
    pickup_address: 'Not provided',
    call_duration: '02:03',
    call_status: 'completed',
    sentiment_score: 'Positive',
    sentiment_summary: 'Kushal Gupa scheduled a visual check for WOF rust repairs. Booked appointment for today at 4:00 PM.',
    recording_url: 'https://omnidim.io/api/v1/recording/6601441?token=d4d2d0b504cc6ecc3bb288ab98785379',
    internal_recording_url: 'https://omnidim.io/api/v1/recording/6601441?token=d4d2d0b504cc6ecc3bb288ab98785379',
    interactions: [
      { sequence: 1, sender: 'agent', name: 'Arna (AI)', text: 'Kee-ora, Thanks for calling Hibiscus Coast Panel Beaters, this is Arna speaking — how can I help you today?' },
      { sequence: 2, sender: 'caller', name: 'Kushal Gupa', text: 'Hi there. I\'m looking to get my WOF repairs done.' },
      { sequence: 3, sender: 'agent', name: 'Arna (AI)', text: 'Got it, rust issues on the WOF. I’ll book you in for a quick visual check today at 4:00 PM.' }
    ]
  },
  {
    id: 6444643,
    time_of_call: '2026-08-08 10:44:34',
    display_time: '08 Aug 2026, 10:44 AM',
    caller_full_name: 'Kushal Kuppa',
    contact_phone_number: '0225552515',
    contact_email: 'kushal.k@gmail.com',
    vehicle_registration: 'QPW-435',
    vehicle_make_model_year: 'Nissan X-Trail 2021',
    service_requested: 'Private Repair Quotes',
    preferred_date_time: 'Visual Damage Check at 681 Whangaparaoa Rd',
    urgency_level: 'High',
    insurance_company: 'Not provided (Private Job)',
    insurance_claim_number: 'Not provided',
    pickup_address: '681 Whangaparaoa Road',
    call_duration: '02:23',
    call_status: 'completed',
    sentiment_score: 'Positive',
    sentiment_summary: 'Kushal called following a rear-end collision on the road that damaged his bumper and inner trims. Arna (AI) arranged a visual damage assessment at 681 Whangaparaoa Road for an accurate repair quote.',
    recording_url: 'https://omnidim.io/api/v1/recording/6444643?token=288de9bb5b7f49cb056c4e50ccf24ae3',
    internal_recording_url: 'https://omnidim.io/api/v1/recording/6444643?token=288de9bb5b7f49cb056c4e50ccf24ae3',
    interactions: [
      { sequence: 1, sender: 'agent', name: 'Arna (AI)', text: 'Thanks for calling Hibiscus Coast Panel Beaters, this is Arna — how can I help you today?' },
      { sequence: 2, sender: 'caller', name: 'Kushal Kuppa', text: 'Hi, this is Kushal speaking. I was on the road today and met a collision with another car; he bumped me from the back, and then my bumper got damaged and inner trims got damaged. I would like to get an appointment for a quote.' },
      { sequence: 3, sender: 'agent', name: 'Arna (AI)', text: 'Oh no, that sounds stressful, Kushal. We\'ll need to check your vehicle in person for a quote. Can you drive it to our shop at 681 Whangaparaoa Road?' },
      { sequence: 4, sender: 'caller', name: 'Kushal Kuppa', text: 'Yeah, that works. Full name is Kushal Kuppa, phone 022 555 2515, rego QPW-435.' }
    ]
  },
  {
    id: 6038566,
    time_of_call: '2026-08-08 10:42:09',
    display_time: '08 Aug 2026, 10:42 AM',
    caller_full_name: 'Kushal Kuppa',
    contact_phone_number: '0225552515',
    contact_email: 'kushal.k@gmail.com',
    vehicle_registration: 'QPW-435',
    vehicle_make_model_year: 'Panel Damage Assessment',
    service_requested: 'Private Repair Quotes',
    preferred_date_time: 'Visual Assessment Inquiry',
    urgency_level: 'Medium',
    insurance_company: 'Not provided',
    insurance_claim_number: 'Not provided',
    pickup_address: 'Not provided',
    call_duration: '01:10',
    call_status: 'completed',
    sentiment_score: 'Positive',
    sentiment_summary: 'Kushal initiated a panel damage quote inquiry with Arna (AI) for vehicle QPW-435.',
    recording_url: 'https://omnidim.io/api/v1/recording/6038566?token=288de9bb5b7f49cb056c4e50ccf24ae3',
    internal_recording_url: 'https://omnidim.io/api/v1/recording/6038566?token=288de9bb5b7f49cb056c4e50ccf24ae3',
    interactions: [
      { sequence: 1, sender: 'agent', name: 'Arna (AI)', text: 'Thanks for calling Hibiscus Coast Panel Beaters, how can I assist you today?' }
    ]
  }
];

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // Production Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Handle CORS Preflight for Webhooks
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    res.end();
    return;
  }

  // Healthcheck Endpoint
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ status: 'ok', environment: process.env.NODE_ENV || 'production', timestamp: new Date().toISOString() }));
    return;
  }

  // Handle API Endpoint: Get All OmniDimension Call Logs
  if (req.method === 'GET' && req.url === '/api/calls') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ calls: storedCalls, count: storedCalls.length }));
    return;
  }

  // Handle OmniDimension Webhook Ingestion (Supports /api/webhook, /api/webhook/call-ended, /api/webhook/call_ended, /webhook)
  if (req.method === 'POST' && (req.url.startsWith('/api/webhook') || req.url.startsWith('/webhook'))) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        console.log('[OmniDimension Webhook Received]:', JSON.stringify(payload).slice(0, 300));

        const report = payload.call_report || payload.report || payload.data || {};
        const ext = report.extracted_variables || payload.extracted_variables || {};

        const callerName = ext.caller_full_name || payload.caller_name || payload.customer_name || 'Inbound Caller';
        const phone = ext.contact_phone_number || payload.phone_number || payload.caller_phone || 'N/A';
        const rego = ext.vehicle_registration || payload.rego || 'N/A';
        const service = ext.service_requested || payload.service_requested || 'General Inquiry';
        const preferredSlot = ext.preferred_date_time || payload.preferred_date_time || 'N/A';

        const newCall = {
          id: payload.call_id || payload.id || Date.now(),
          time_of_call: payload.call_date || payload.created_at || new Date().toISOString(),
          display_time: new Date().toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', hour12: true }),
          caller_full_name: callerName,
          contact_phone_number: phone,
          contact_email: ext.contact_email || payload.email || 'Not provided',
          vehicle_registration: rego,
          vehicle_make_model_year: ext.vehicle_make_model_year || 'Not provided',
          service_requested: service,
          preferred_date_time: preferredSlot,
          urgency_level: ext.urgency_level || 'Normal',
          insurance_company: ext.insurance_company || 'Not provided',
          insurance_claim_number: ext.insurance_claim_number || 'Not provided',
          pickup_address: ext.pickup_address || 'Not provided',
          call_duration: payload.call_duration ? `${payload.call_duration}s` : '01:30',
          call_status: payload.call_status || 'completed',
          sentiment_score: report.sentiment || payload.sentiment || 'Positive',
          sentiment_summary: report.summary || payload.summary || 'Call processed by OmniDimension AI Receptionist.',
          recording_url: payload.recording_url || report.recording_url || '',
          internal_recording_url: payload.recording_url || report.recording_url || '',
          interactions: Array.isArray(report.interactions) ? report.interactions.map((turn, i) => ({
            sequence: turn.sequence || i + 1,
            sender: turn.user_query ? 'caller' : 'agent',
            name: turn.user_query ? callerName : 'Arna (AI)',
            text: turn.user_query || turn.bot_response || turn.text
          })) : []
        };

        // Avoid duplicate insertion
        if (!storedCalls.some(c => String(c.id) === String(newCall.id))) {
          storedCalls.unshift(newCall);
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, message: 'OmniDimension Webhook received and stored.', call_id: newCall.id }));
      } catch (err) {
        console.error('[Webhook Error]:', err);
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Static File Serving
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';

  const filePath = path.join(PUBLIC_DIR, reqPath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Hibiscus Coast Panel Beaters CRM is live at http://localhost:${PORT}`);
});
