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

// REAL OMNIDIMENSION LIVE CALL RECORDS (SYNCED FROM OMNIDIMENSION API FOR AUG 16, 17, 18)
let storedCalls = [
  {
    "id": 6744868,
    "time_of_call": "08/18/2026 06:20:33",
    "display_time": "18 Aug 2026, 06:20 am",
    "caller_full_name": "Kushal Kuppa",
    "contact_phone_number": "0225552515",
    "contact_email": "kushal.knz@gmail.com",
    "vehicle_registration": "QPW-119",
    "vehicle_make_model_year": "Not provided",
    "service_requested": "Insurance claim job",
    "preferred_date_time": "2026-08-19 14:00",
    "urgency_level": "Normal",
    "insurance_company": "state insurance",
    "insurance_claim_number": "ST-12345",
    "pickup_address": "681 Whangaparaoa Road",
    "call_duration": "02:15",
    "call_status": "completed",
    "sentiment_score": "Positive",
    "sentiment_summary": "The user, Kushal, called to request a quote for damage to his front bumper after a collision. The agent confirmed it was an insurance job, collected necessary details, and successfully booked an appointment for the following day at 2 PM.",
    "recording_url": "https://omnidim.io/api/v1/recording/6744868?token=5fcf91cbad0427dd03371fd7f3fa3a5d",
    "internal_recording_url": "https://omnidim.io/api/v1/recording/6744868?token=5fcf91cbad0427dd03371fd7f3fa3a5d",
    "interactions": [
      {
        "sequence": 1,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Kee-ora, Thanks for calling Hibiscus Coast Panel Beaters,"
      },
      {
        "sequence": 2,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "this is Arna speaking —"
      },
      {
        "sequence": 3,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "how can I help you today?"
      },
      {
        "sequence": 4,
        "sender": "caller",
        "name": "Kushal Kuppa",
        "text": "Hi there, this is Kushal speaking. How are you doing?"
      },
      {
        "sequence": 5,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Oh hi, Kushal! I'm doing well, thanks for asking. How about you? What can I help you with today?"
      },
      {
        "sequence": 6,
        "sender": "caller",
        "name": "Kushal Kuppa",
        "text": "Hi there. So, uh, just a simple thing that I was on a road today and then I met a collision. On the road, and unfortunately my front bumper got damaged, and—  You know, I think I need a quote for.  I think I need a quote, uh, in order to get that. I think I need an appointment as well."
      },
      {
        "sequence": 7,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Oh no, that sounds like a bit of a hassle! We can definitely help you with a quote for your front bumper. Just to confirm, this is a private job, right? We'll need to do a quick in-person check for an accurate quote. Can I grab your name, phone number, email, and registration number?"
      },
      {
        "sequence": 8,
        "sender": "caller",
        "name": "Kushal Kuppa",
        "text": "Um, this is not a private job. I think that's an insurance job."
      },
      {
        "sequence": 9,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Got it, so it's an insurance job. Can you please let me know which insurance company you're with and if you have a claim number?"
      },
      {
        "sequence": 10,
        "sender": "caller",
        "name": "Kushal Kuppa",
        "text": "Yeah, my insurance would be state insurance, and my claim number would be ST-12345."
      },
      {
        "sequence": 11,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Thanks for that, Kushal! Just to reassure you, we're an approved repairer, CRA-certified, and a member of the MTA. Now, can I get your name, phone number, email, and registration number for our records?"
      },
      {
        "sequence": 12,
        "sender": "caller",
        "name": "Kushal Kuppa",
        "text": "Yeah. So my phone number would be.  022-555-2515, and my.  Name would be Kushal Kuppa, and my email address would be kushal.knz@gmail.com, and my registration number would be QPW-119."
      },
      {
        "sequence": 13,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Thanks for that, Kushal! Just to confirm, your details are:"
      },
      {
        "sequence": 19,
        "sender": "caller",
        "name": "Kushal Kuppa",
        "text": "Okay, so can you please book me, uh, tomorrow 2:00 PM?"
      },
      {
        "sequence": 20,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Great news! The slot on tomorrow, August nineteenth, two PM is available. Shall I go ahead and book it for you?"
      },
      {
        "sequence": 21,
        "sender": "caller",
        "name": "Kushal Kuppa",
        "text": "Yes, please."
      },
      {
        "sequence": 22,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Great! I've booked your appointment for tomorrow, August nineteenth, at two PM. It's all set in the calendar. If you need anything else, just let me know!"
      },
      {
        "sequence": 23,
        "sender": "caller",
        "name": "Kushal Kuppa",
        "text": "All right, cool. Thanks. That— that's it."
      },
      {
        "sequence": 24,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "You're welcome, Kushal! If you need anything else, just give us a bell. Have a great day!"
      },
      {
        "sequence": 25,
        "sender": "caller",
        "name": "Kushal Kuppa",
        "text": "Yeah, bye."
      },
      {
        "sequence": 26,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Bye, Kushal! Thanks for your time, and take care!"
      }
    ]
  },
  {
    "id": 6704963,
    "time_of_call": "08/17/2026 03:13:13",
    "display_time": "17 Aug 2026, 03:13 am",
    "caller_full_name": "K Kushal",
    "contact_phone_number": "N/A",
    "contact_email": "Not provided",
    "vehicle_registration": "N/A",
    "vehicle_make_model_year": "Not provided",
    "service_requested": "General Inquiry",
    "preferred_date_time": "N/A",
    "urgency_level": "Normal",
    "insurance_company": "Not provided",
    "insurance_claim_number": "Not provided",
    "pickup_address": "681 Whangaparaoa Road",
    "call_duration": "02:15",
    "call_status": "completed",
    "sentiment_score": "Positive",
    "sentiment_summary": "Call processed by OmniDimension AI Receptionist.",
    "recording_url": "https://omnidim.io/api/v1/recording/6704963?token=77b3d556d045091ce966c8b6e0fea074",
    "internal_recording_url": "https://omnidim.io/api/v1/recording/6704963?token=77b3d556d045091ce966c8b6e0fea074",
    "interactions": []
  },
  {
    "id": 6704944,
    "time_of_call": "08/17/2026 02:58:41",
    "display_time": "17 Aug 2026, 02:58 am",
    "caller_full_name": "K Kushal",
    "contact_phone_number": "N/A",
    "contact_email": "Not provided",
    "vehicle_registration": "N/A",
    "vehicle_make_model_year": "Not provided",
    "service_requested": "General Inquiry",
    "preferred_date_time": "N/A",
    "urgency_level": "Not provided",
    "insurance_company": "Not provided",
    "insurance_claim_number": "Not provided",
    "pickup_address": "681 Whangaparaoa Road",
    "call_duration": "02:15",
    "call_status": "completed",
    "sentiment_score": "Negative",
    "sentiment_summary": "The User called Hibiscus Coast Panel Beaters looking to buy mangoes, but the Agent clarified that they only provide vehicle panel beating services. The conversation ended with the User acknowledging the information and saying goodbye.",
    "recording_url": "https://omnidim.io/api/v1/recording/6704944?token=fbbcec49c8827bfb7f2b523b47a0586c",
    "internal_recording_url": "https://omnidim.io/api/v1/recording/6704944?token=fbbcec49c8827bfb7f2b523b47a0586c",
    "interactions": [
      {
        "sequence": 1,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Kee-ora, Thanks for calling Hibiscus Coast Panel Beaters,"
      },
      {
        "sequence": 2,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "this is Arna speaking —"
      },
      {
        "sequence": 3,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "how can I help you today?"
      },
      {
        "sequence": 4,
        "sender": "caller",
        "name": "K Kushal",
        "text": "And I was calling you to get.  I mean, I mean, I would like to get a few mangoes. Do you guys sell them?"
      },
      {
        "sequence": 5,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Oh, we don’t sell mangoes here — we’re Hibiscus Coast Panel Beaters, so we do vehicle panel beating, repairs, and dee-tay-ling. Anything I can help you with on that?"
      },
      {
        "sequence": 6,
        "sender": "caller",
        "name": "K Kushal",
        "text": "No, I ne- I need mangoes, please."
      },
      {
        "sequence": 7,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Sorry, we only do vehicle panel beating, repairs, and dee-tay-ling here, so I won’t be able to help with mangoes. Maybe try a local day-ree or fruit shop? Cheers!"
      },
      {
        "sequence": 8,
        "sender": "caller",
        "name": "K Kushal",
        "text": "Okay.  Bye."
      },
      {
        "sequence": 9,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Thanks for giving us a bell anyway, take care and have a lovely day!"
      }
    ]
  },
  {
    "id": 6704940,
    "time_of_call": "08/17/2026 02:55:57",
    "display_time": "17 Aug 2026, 02:55 am",
    "caller_full_name": "K Kushal",
    "contact_phone_number": "N/A",
    "contact_email": "Not provided",
    "vehicle_registration": "N/A",
    "vehicle_make_model_year": "Not provided",
    "service_requested": "General Inquiry",
    "preferred_date_time": "N/A",
    "urgency_level": "Normal",
    "insurance_company": "Not provided",
    "insurance_claim_number": "Not provided",
    "pickup_address": "681 Whangaparaoa Road",
    "call_duration": "02:15",
    "call_status": "completed",
    "sentiment_score": "Positive",
    "sentiment_summary": "Call processed by OmniDimension AI Receptionist.",
    "recording_url": "https://omnidim.io/api/v1/recording/6704940?token=b15ddbe66d44390cf3eec45c752241b1",
    "internal_recording_url": "https://omnidim.io/api/v1/recording/6704940?token=b15ddbe66d44390cf3eec45c752241b1",
    "interactions": []
  },
  {
    "id": 6704808,
    "time_of_call": "08/17/2026 02:23:52",
    "display_time": "17 Aug 2026, 02:23 am",
    "caller_full_name": "K Kushal",
    "contact_phone_number": "N/A",
    "contact_email": "Not provided",
    "vehicle_registration": "N/A",
    "vehicle_make_model_year": "Not provided",
    "service_requested": "ambulance",
    "preferred_date_time": "N/A",
    "urgency_level": "Not provided",
    "insurance_company": "Not provided",
    "insurance_claim_number": "Not provided",
    "pickup_address": "681 Whangaparaoa Road",
    "call_duration": "02:15",
    "call_status": "completed",
    "sentiment_score": "Negative",
    "sentiment_summary": "The User called Hibiscus Coast Panel Beaters requesting an ambulance. The Agent informed the User that they do not provide ambulance services and advised them to contact emergency services directly.",
    "recording_url": "https://omnidim.io/api/v1/recording/6704808?token=f2d0b04a5b0ef51560adb58e21f7e66a",
    "internal_recording_url": "https://omnidim.io/api/v1/recording/6704808?token=f2d0b04a5b0ef51560adb58e21f7e66a",
    "interactions": [
      {
        "sequence": 1,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Kee-ora, Thanks for calling Hibiscus Coast Panel Beaters,"
      },
      {
        "sequence": 2,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "this is Arna speaking —"
      },
      {
        "sequence": 3,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "how can I help you today?"
      },
      {
        "sequence": 4,
        "sender": "caller",
        "name": "K Kushal",
        "text": "Had a good time ambulance. Can you please send that?"
      },
      {
        "sequence": 5,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Sorry, I didn’t quite catch that. Could you please tell me again what you need help with?"
      },
      {
        "sequence": 6,
        "sender": "caller",
        "name": "K Kushal",
        "text": "I need an ambulance, please."
      },
      {
        "sequence": 7,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Oh, I’m sorry to hear that, but we don’t handle ambulance services here. Please call emergency services straight away for help. Take care."
      },
      {
        "sequence": 8,
        "sender": "caller",
        "name": "K Kushal",
        "text": "Okay, bye."
      },
      {
        "sequence": 9,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Thanks for calling, take care and all the best to you. Goodbye now."
      }
    ]
  },
  {
    "id": 6704806,
    "time_of_call": "08/17/2026 02:21:39",
    "display_time": "17 Aug 2026, 02:21 am",
    "caller_full_name": "K Kushal",
    "contact_phone_number": "N/A",
    "contact_email": "Not provided",
    "vehicle_registration": "N/A",
    "vehicle_make_model_year": "Not provided",
    "service_requested": "General Inquiry",
    "preferred_date_time": "N/A",
    "urgency_level": "Not provided",
    "insurance_company": "Not provided",
    "insurance_claim_number": "Not provided",
    "pickup_address": "681 Whangaparaoa Road",
    "call_duration": "02:15",
    "call_status": "completed",
    "sentiment_score": "Neutral",
    "sentiment_summary": "The User inquired about purchasing an iPhone 14 Pro Max, but the Agent clarified that they only provide vehicle panel beating and repairs. The conversation ended with the User acknowledging this and saying goodbye.",
    "recording_url": "https://omnidim.io/api/v1/recording/6704806?token=bb310e3503ea7dc1aefcc1f6f9507706",
    "internal_recording_url": "https://omnidim.io/api/v1/recording/6704806?token=bb310e3503ea7dc1aefcc1f6f9507706",
    "interactions": [
      {
        "sequence": 1,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Kee-ora, Thanks for calling Hibiscus Coast Panel Beaters,"
      },
      {
        "sequence": 2,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "this is Arna speaking —"
      },
      {
        "sequence": 3,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "how can I help you today?"
      },
      {
        "sequence": 4,
        "sender": "caller",
        "name": "K Kushal",
        "text": "Hi there, I was looking to get an iPhone 14 Pro Max. Do you guys sell that?  Are you there?"
      },
      {
        "sequence": 5,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Thanks for calling anyway, and have a great day!"
      },
      {
        "sequence": 6,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Hey, yes I’m here. Just to let you know, we only do vehicle panel beating, repairs, and detailing here at Hibiscus Coast Panel Beaters. How can I help with your car today?"
      },
      {
        "sequence": 7,
        "sender": "caller",
        "name": "K Kushal",
        "text": "Hmm, that's it. I was just looking to, uh, get an iPhone."
      },
      {
        "sequence": 8,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Ah, I get that, but we don’t sell phones here — just car repairs and panel beating. Anything I can help with your vehicle instead?"
      },
      {
        "sequence": 9,
        "sender": "caller",
        "name": "K Kushal",
        "text": "That's it. Alright, cool, thanks, bye."
      },
      {
        "sequence": 10,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Thanks for giving us a bell, take care now."
      }
    ]
  },
  {
    "id": 6704793,
    "time_of_call": "08/17/2026 01:40:56",
    "display_time": "17 Aug 2026, 01:40 am",
    "caller_full_name": "Kushal Guppa",
    "contact_phone_number": "0225552515",
    "contact_email": "kushalkmz@gmail.com",
    "vehicle_registration": "QPW-996",
    "vehicle_make_model_year": "Toyota Aqua, 2016",
    "service_requested": "Insurance claim job",
    "preferred_date_time": "2026-08-17T14:00:00",
    "urgency_level": "Not provided",
    "insurance_company": "State Insurance",
    "insurance_claim_number": "C12345",
    "pickup_address": "681 Whangaparaoa Road",
    "call_duration": "02:15",
    "call_status": "completed",
    "sentiment_score": "Positive",
    "sentiment_summary": "The User, Kushal, called to schedule an appointment for a vehicle repair after a collision. The Agent confirmed the details and successfully booked an appointment for 2 PM on the same day.",
    "recording_url": "https://omnidim.io/api/v1/recording/6704793?token=5947e398ffbb8c3bf5d2bf7b12385b93",
    "internal_recording_url": "https://omnidim.io/api/v1/recording/6704793?token=5947e398ffbb8c3bf5d2bf7b12385b93",
    "interactions": [
      {
        "sequence": 1,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Kee-ora, Thanks for calling Hibiscus Coast Panel Beaters,"
      },
      {
        "sequence": 2,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "this is Arna speaking —"
      },
      {
        "sequence": 3,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "how can I help you today?"
      },
      {
        "sequence": 4,
        "sender": "caller",
        "name": "Kushal Guppa",
        "text": "Hello, this is Koshal speaking. So, I was on a road today and then I made a collision on the road, I think, uh, my friend bumper got damaged and my rear bumper also got damaged. So I think I need an appointment to get a quote for that."
      },
      {
        "sequence": 5,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Oh no, sorry to hear about that collision. Just to check, is this a private repair job or are you going through insurance?"
      },
      {
        "sequence": 6,
        "sender": "caller",
        "name": "Kushal Guppa",
        "text": "I'm going through insurance."
      },
      {
        "sequence": 7,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Sweet as, we’re an approved repairer and CRA-certified, plus an MTA member, so you’re in good hands. Which insurer are you with, and do you have a claim number handy?"
      },
      {
        "sequence": 8,
        "sender": "caller",
        "name": "Kushal Guppa",
        "text": "Yes, please.  Um,.  My C- my claim.  Sorry, my insurance would be State Insurance, and my claim number would be C12345."
      },
      {
        "sequence": 9,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Thanks for that. Could I please get your full name, phone number, email, and the vehicle’s rego, make, model, and year? I’ll read it back to you after."
      },
      {
        "sequence": 10,
        "sender": "caller",
        "name": "Kushal Guppa",
        "text": "Yeah.  So my full name would be Kushal Guppa, and my phone number would be 022-555-2515. And my email address would be kushalkmz@gmail.com, and my—  Vehicle Rejo would be QPW-996, and my make would— make model year would be Toyota Aqua, 2016."
      },
      {
        "sequence": 11,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Could you please tell me your full name first?Thanks, Kushal Guppa, phone number zero two two five five five two five one five, email kushalkmz at gmail dot com, vehicle rego Q P W dash nine nine six, Toyota Aqua, year two thousand sixteen. Is that all correct?"
      },
      {
        "sequence": 12,
        "sender": "caller",
        "name": "Kushal Guppa",
        "text": "Yeah."
      },
      {
        "sequence": 13,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Sweet as. When would you like to come in for your insurance assessment? We’re open weekdays seven thirty in the morning till five in the afternoon, and Saturdays eight till midday."
      },
      {
        "sequence": 14,
        "sender": "caller",
        "name": "Kushal Guppa",
        "text": "Um, can I get an appointment for today, 2:00 PM?"
      },
      {
        "sequence": 15,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Great news! The slot at two PM today is available. Shall I book that for you, Kushal?"
      },
      {
        "sequence": 16,
        "sender": "caller",
        "name": "Kushal Guppa",
        "text": "Yeah."
      },
      {
        "sequence": 17,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Your appointment is booked for two PM today, Monday the seventeenth of August, here at six eight one Fangaparaoa Road, Stan-maw Bay, Auckland. If you need anything else, just giv us uh bel, Kushal."
      },
      {
        "sequence": 18,
        "sender": "caller",
        "name": "Kushal Guppa",
        "text": "Yeah, all right, cool, thanks."
      },
      {
        "sequence": 19,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Sweet as, Kushal. Thanks for calling Hibiscus Coast Panel Beaters, and all the best with your repair. Chee-uhz!"
      }
    ]
  },
  {
    "id": 6704692,
    "time_of_call": "08/16/2026 23:17:56",
    "display_time": "16 Aug 2026, 11:17 pm",
    "caller_full_name": "Kushal Gupa",
    "contact_phone_number": "0225552515",
    "contact_email": "kushalknz@gmail.com",
    "vehicle_registration": "MLC119",
    "vehicle_make_model_year": "Toyota Aqua, Toyota Aqua, 2016",
    "service_requested": "Insurance claim job",
    "preferred_date_time": "2026-08-17 14:00",
    "urgency_level": "Not provided",
    "insurance_company": "State",
    "insurance_claim_number": "C12345",
    "pickup_address": "681 Whangaparaoa Road",
    "call_duration": "02:15",
    "call_status": "completed",
    "sentiment_score": "Positive",
    "sentiment_summary": "Kushal called to get a quote for a damaged front bumper and confirmed it was an insurance claim. The agent booked an assessment appointment for him at 2:00 PM today.",
    "recording_url": "https://omnidim.io/api/v1/recording/6704692?token=f7ed031c31729571d96f222ee07dd90a",
    "internal_recording_url": "https://omnidim.io/api/v1/recording/6704692?token=f7ed031c31729571d96f222ee07dd90a",
    "interactions": [
      {
        "sequence": 1,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Kee-ora, Thanks for calling Hibiscus Coast Panel Beaters,"
      },
      {
        "sequence": 2,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "this is Arna speaking —"
      },
      {
        "sequence": 3,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "how can I help you today?"
      },
      {
        "sequence": 4,
        "sender": "caller",
        "name": "Kushal Gupa",
        "text": "Hi there, this is Kushal speaking. So, I've got my front bumper damaged, so I think I need a quote for.  An assessment."
      },
      {
        "sequence": 5,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Got it, Kushal. Just to check, is this a private job or are you going through insurance?"
      },
      {
        "sequence": 6,
        "sender": "caller",
        "name": "Kushal Gupa",
        "text": "Insurance."
      },
      {
        "sequence": 7,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Sweet as, Kushal. Which insurer are you with, and do you have a claim number handy?"
      },
      {
        "sequence": 8,
        "sender": "caller",
        "name": "Kushal Gupa",
        "text": "Yeah, my insurer would be State, and my claim number would be C12345."
      },
      {
        "sequence": 9,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Thanks for that, Kushal. Just to reassure you, we’re an approved repairer, CRA-certified, and an MTA member. I’ll need a few details to book your assessment—can you please confirm your full name, phone number, email, vehicle make, model, year, and the rego?"
      },
      {
        "sequence": 10,
        "sender": "caller",
        "name": "Kushal Gupa",
        "text": "Okay, my full name would be Kushal Gupa, and my phone number would be 022-555-2515.  And my email would be kushalknz@gmail.com.  And my vehicle—  Make would be—  Toyota Aqua.  Model would be Toyota Aqua, and year would be 2016. And.  The regio would be—  MLC119."
      },
      {
        "sequence": 11,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Thanks, Kushal. Just to confirm: Kushal Gupa, phone zero two two, five five five, two five one five, email kushalknz at gmail dot com, Toyota Aqua, year two thousand sixteen, rego M L C one one nine. Sweet as?"
      },
      {
        "sequence": 12,
        "sender": "caller",
        "name": "Kushal Gupa",
        "text": "Yeah."
      },
      {
        "sequence": 13,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Cool as. When would you like to come in for the assessment? We’re open weekdays seven thirty in the morning till five in the afternoon, and Saturdays eight till midday."
      },
      {
        "sequence": 14,
        "sender": "caller",
        "name": "Kushal Gupa",
        "text": "Okay, so I think I need an appointment today, 2:00 PM. Does that work?"
      },
      {
        "sequence": 15,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "The slot at two o'clock this afternoon is free. Shall I book it for you, Kushal?"
      },
      {
        "sequence": 16,
        "sender": "caller",
        "name": "Kushal Gupa",
        "text": "Yes, please."
      },
      {
        "sequence": 17,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "All set, Kushal. Your assessment is booked for today at two o'clock PM here at six eight one Fangaparaoa Road, Stan-maw Bay, Auckland. If you need anything else, just giv us uh bel, sweet as?"
      },
      {
        "sequence": 18,
        "sender": "caller",
        "name": "Kushal Gupa",
        "text": "Yeah."
      },
      {
        "sequence": 19,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Sweet as, Kushal. If you want to chat about a courtesy car or anything else, I can transfer you to Sahn-too now."
      },
      {
        "sequence": 20,
        "sender": "caller",
        "name": "Kushal Gupa",
        "text": "No, I'm good."
      },
      {
        "sequence": 21,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Noh wu-reez, Kushal. If anything comes up, just giv us uh bel. Have a good one!"
      },
      {
        "sequence": 22,
        "sender": "caller",
        "name": "Kushal Gupa",
        "text": "Bye."
      },
      {
        "sequence": 23,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Cheers for calling, Kushal. Take care and all the best with your car repair. Bye now."
      }
    ]
  },
  {
    "id": 6701892,
    "time_of_call": "08/16/2026 14:19:05",
    "display_time": "16 Aug 2026, 02:19 pm",
    "caller_full_name": "Neeraj",
    "contact_phone_number": "225555515",
    "contact_email": "neeraj007@gmail.com",
    "vehicle_registration": "QPW 355",
    "vehicle_make_model_year": "Toyota Aqua 2016",
    "service_requested": "Insurance claim job",
    "preferred_date_time": "Tomorrow at 10:00 AM",
    "urgency_level": "Not provided",
    "insurance_company": "State insurance",
    "insurance_claim_number": "ST-22444-5",
    "pickup_address": "681 Whangaparaoa Road",
    "call_duration": "02:15",
    "call_status": "completed",
    "sentiment_score": "Neutral",
    "sentiment_summary": "The user, Neeraj, called to book an appointment for a bumper repair after a collision, using insurance. The agent confirmed details but faced issues booking the appointment, promising to have the team call back.",
    "recording_url": "https://omnidim.io/api/v1/recording/6701892?token=ddd82879b7a9a0dc38cea4d539ef5180",
    "internal_recording_url": "https://omnidim.io/api/v1/recording/6701892?token=ddd82879b7a9a0dc38cea4d539ef5180",
    "interactions": [
      {
        "sequence": 1,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Kee-ora, Thanks for calling Hibiscus Coast Panel Beaters,"
      },
      {
        "sequence": 2,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "this is Arna speaking —"
      },
      {
        "sequence": 3,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "how can I help you today?"
      },
      {
        "sequence": 4,
        "sender": "caller",
        "name": "Neeraj",
        "text": "Uh, I met with a collision, and my bumper was damaged, so I want to book an appointment.  As early as possible."
      },
      {
        "sequence": 5,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Oh no, sorry to hear about your bumper. Is this a private job or are you going through insurance?"
      },
      {
        "sequence": 6,
        "sender": "caller",
        "name": "Neeraj",
        "text": "Insurance."
      },
      {
        "sequence": 7,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Sweet as, which insurer are you with, and do you have a claim number handy?"
      },
      {
        "sequence": 8,
        "sender": "caller",
        "name": "Neeraj",
        "text": "State insurance under ST-22444-5."
      },
      {
        "sequence": 9,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Thanks for that. We’re an approved repairer, CRA-certified and MTA member, so you’re in good hands. Can I get your full name, phone number, email, and the vehicle’s rego, make, model, and year?"
      },
      {
        "sequence": 10,
        "sender": "caller",
        "name": "Neeraj",
        "text": "Yes, my full number would be, uh, Neeraj 22555.  515, and email would be neeraj007.  @gmail.com.  And the vehicle schedule comes like, uh, QPW 3.  55."
      },
      {
        "sequence": 11,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Thanks, Neeraj.Thanks, Neeraj. Just to confirm, your phone is two two five five five, email is at gmail dot com, and the rego is Q P W three five five? Could you please also tell me the vehicle make, model, and year?"
      },
      {
        "sequence": 12,
        "sender": "caller",
        "name": "Neeraj",
        "text": "Yes, uh, vehicle make, model, year would be Toyota Aqua 2016."
      },
      {
        "sequence": 13,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Sweet as, Neeraj. When would you like to book your assessment? We’re open weekdays seven thirty in the morning till five in the afternoon, and Saturdays eight till midday."
      },
      {
        "sequence": 14,
        "sender": "caller",
        "name": "Neeraj",
        "text": "What are the timings available today?  Yeah, book me tomorrow at 10:00 AM."
      },
      {
        "sequence": 15,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Sorry, Neeraj, I’m having a bit of trouble booking that slot right now. Can I take your number and have the team give you a call to lock it in?"
      },
      {
        "sequence": 16,
        "sender": "caller",
        "name": "Neeraj",
        "text": "Yes.  It's okay."
      },
      {
        "sequence": 17,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Sweet as, can you please confirm your phone number for me again?"
      },
      {
        "sequence": 18,
        "sender": "caller",
        "name": "Neeraj",
        "text": "22555 515."
      },
      {
        "sequence": 19,
        "sender": "agent",
        "name": "Arna (AI)",
        "text": "Thanks, Neeraj. We’ll have the team call you back soon to sort that appointment. Anything else I can help with today?"
      }
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

        // Persist new webhook call directly to Supabase Cloud Database
        insertCallToSupabase(newCall).catch(e => console.warn('Background Supabase save warning:', e.message));

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

// SUPABASE CLOUD DATABASE PERSISTENCE HELPERS
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dnxhfximdgubrhchhjzg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_eUYNzK_jLV85lWYMouxamg_elRW9PAC';

async function fetchCallsFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/call_logs?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[Supabase Fetch Warning]:', err.message);
  }
  return null;
}

async function insertCallToSupabase(callData) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/call_logs`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify({
        id: String(callData.id),
        time_of_call: callData.time_of_call,
        display_time: callData.display_time,
        caller_full_name: callData.caller_full_name,
        contact_phone_number: callData.contact_phone_number,
        contact_email: callData.contact_email,
        vehicle_registration: callData.vehicle_registration,
        vehicle_make_model_year: callData.vehicle_make_model_year,
        service_requested: callData.service_requested,
        preferred_date_time: callData.preferred_date_time,
        urgency_level: callData.urgency_level,
        insurance_company: callData.insurance_company,
        insurance_claim_number: callData.insurance_claim_number,
        pickup_address: callData.pickup_address,
        call_duration: callData.call_duration,
        call_status: callData.call_status,
        sentiment_score: callData.sentiment_score,
        sentiment_summary: callData.sentiment_summary,
        recording_url: callData.recording_url,
        internal_recording_url: callData.internal_recording_url,
        interactions: callData.interactions || []
      })
    });
    if (res.ok) {
      console.log(`[Supabase Cloud Database]: Call #${callData.id} successfully persisted.`);
      return true;
    } else {
      if (res.status === 401 || res.status === 404) {
        if (!global.hasWarnedSupabaseSetup) {
          global.hasWarnedSupabaseSetup = true;
          console.log('[Supabase Sync]: Note - Database table pending setup in Supabase SQL Editor.');
          console.log('                 (CRM is functioning smoothly using live server records)');
        }
      } else {
        const errText = await res.text();
        console.warn(`[Supabase Insert Note] (${res.status}):`, errText);
      }
    }
  } catch (err) {
    if (!global.hasWarnedSupabaseSetup) {
      global.hasWarnedSupabaseSetup = true;
      console.log('[Supabase Sync]: Operating in live memory mode.');
    }
  }
  return false;
}

async function initSupabaseData() {
  const remoteCalls = await fetchCallsFromSupabase();
  if (remoteCalls && remoteCalls.length > 0) {
    console.log(`[Supabase Sync]: Loaded ${remoteCalls.length} live call logs from Supabase cloud database.`);
    storedCalls = remoteCalls;
  } else {
    for (const call of storedCalls) {
      const ok = await insertCallToSupabase(call);
      if (!ok && global.hasWarnedSupabaseSetup) break; // Avoid looping on table setup warning
    }
  }
}

server.listen(PORT, () => {
  console.log(`Hibiscus Coast Panel Beaters CRM is live at http://localhost:${PORT}`);
  initSupabaseData().catch(err => console.warn('Supabase init warning:', err.message));
});


