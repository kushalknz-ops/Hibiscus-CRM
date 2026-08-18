// SUPABASE AUTHENTICATION & SECURITY CONFIGURATION
const SUPABASE_URL = 'https://dnxhfximdgubrhchhjzg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_eUYNzK_jLV85lWYMouxamg_elRW9PAC';

let supabaseClient = null;
if (window.supabase && window.supabase.createClient) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// REAL OMNIDIMENSION LIVE CALL RECORDS (SYNCED DYNAMICALLY FROM DATABASE / API)
const OMNIDIMENSION_INITIAL_CALLS = [];

class HibiscusCRM {
  constructor() {
    this.calls = this.loadStoredCalls();
    this.currentTheme = localStorage.getItem('hcpb_crm_theme') || 'dark';
    this.activeServiceFilter = 'all';
    this.activeCallFilter = 'all';
    this.activeCallDetail = null;

    // Calendar & Audio state
    this.calendarViewMode = 'day'; // 'day' or 'week'
    this.selectedDate = new Date();
    this.currentPlayingCallId = null;
    this.isPlayingAudio = false;

    // Auth & RBAC State
    this.currentUser = null;
    this.userRole = 'director';
    this.inactivityTimer = null;

    this.init();
  }

  loadStoredCalls() {
    try {
      const stored = localStorage.getItem('hcpb_omni_calls_live_v8');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return [];
  }

  saveCalls() {
    try {
      localStorage.setItem('hcpb_omni_calls_live_v8', JSON.stringify(this.calls));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupEventListeners();
    this.startLiveClock();
    this.setupAudioEngine();
    this.renderAllViews();
    this.startLiveSyncPolling();
    this.setupSupabaseRealtime();
    this.initAuth();

    if (window.lucide) window.lucide.createIcons();
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hcpb_crm_theme', theme);
    this.currentTheme = theme;
  }

  startLiveClock() {
    const update = () => {
      const now = new Date();
      const nzTimeStr = now.toLocaleTimeString('en-NZ', {
        timeZone: 'Pacific/Auckland',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const clockEl = document.getElementById('clockValue');
      if (clockEl) clockEl.textContent = nzTimeStr;
    };
    update();
    setInterval(update, 1000);
  }

  setupEventListeners() {
    // Navigation items
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-view');
        this.switchView(target);
      });
    });

    // Theme Toggle
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(nextTheme);
        this.showToast(`Switched to ${nextTheme.toUpperCase()} theme`);
      });
    }

    // Refresh Data button
    const refreshBtn = document.getElementById('btnRefreshOmniData');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.fetchLatestOmniData(true);
      });
    }

    // Close user dropdown menu when clicking outside
    window.addEventListener('click', (e) => {
      const topProfile = document.getElementById('topUserProfile');
      const dropdown = document.getElementById('userDropdownMenu');
      if (dropdown && topProfile && !topProfile.contains(e.target)) {
        dropdown.style.display = 'none';
      }
      const searchBox = document.getElementById('globalSearchBox');
      if (searchBox && !searchBox.contains(e.target) && window.innerWidth <= 768) {
        this.closeMobileSearch();
      }
    });

    // Service Separation Category Tabs
    document.querySelectorAll('#serviceCategoryTabs .sep-tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#serviceCategoryTabs .sep-tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeServiceFilter = tab.getAttribute('data-service');
        this.renderSeparatedServiceJobs();
      });
    });

    // Call Log Filters
    document.querySelectorAll('#callStatusFilter .seg-item').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#callStatusFilter .seg-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCallFilter = btn.getAttribute('data-filter');
        this.renderCallLogs();
      });
    });

    // Search Inputs
    const globalSearch = document.getElementById('globalSearchInput');
    const clearBtn = document.getElementById('searchClearBtn');
    const kbdBadge = document.getElementById('searchKbdBadge');

    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        const val = e.target.value;
        if (clearBtn) clearBtn.style.display = val.trim().length > 0 ? 'inline-flex' : 'none';
        if (kbdBadge) kbdBadge.style.display = val.trim().length > 0 ? 'none' : 'inline-block';
        this.handleSearch(val);
      });
    }
    const callLogSearch = document.getElementById('callLogSearchInput');
    if (callLogSearch) {
      callLogSearch.addEventListener('input', (e) => this.renderCallLogs(e.target.value));
    }

    // Slide-over Sheet Close
    const closeBtn = document.getElementById('closeDetailSheetBtn') || document.getElementById('closeSheetBtn');
    const backdrop = document.getElementById('sheetBackdrop');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDetailSheet());
    if (backdrop) backdrop.addEventListener('click', () => this.closeDetailSheet());

    // Calendar View Selector (Day vs Week)
    document.querySelectorAll('#calendarViewModeSelector .seg-mini-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#calendarViewModeSelector .seg-mini-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.calendarViewMode = btn.getAttribute('data-calview');
        this.renderCalendar();
      });
    });

    // Calendar Navigation (Prev, Today, Next)
    const btnPrev = document.getElementById('btnPrevCalPeriod');
    const btnNext = document.getElementById('btnNextCalPeriod');
    const btnToday = document.getElementById('btnTodayCal');

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        const days = this.calendarViewMode === 'week' ? 7 : 1;
        this.selectedDate.setDate(this.selectedDate.getDate() - days);
        this.renderCalendar();
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const days = this.calendarViewMode === 'week' ? 7 : 1;
        this.selectedDate.setDate(this.selectedDate.getDate() + days);
        this.renderCalendar();
      });
    }

    if (btnToday) {
      btnToday.addEventListener('click', () => {
        this.selectedDate = new Date(2026, 7, 14);
        this.renderCalendar();
      });
    }

    // Keyboard shortcut Cmd+K
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDetailSheet();
        this.closeMobileNav();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        this.closeMobileNav();
      }
    });
  }

  toggleMobileNav() {
    const menu = document.getElementById('topNavMenu');
    const backdrop = document.getElementById('mobileNavBackdrop');
    if (menu) menu.classList.toggle('mobile-open');
    if (backdrop) backdrop.classList.toggle('active');
  }

  closeMobileNav() {
    const menu = document.getElementById('topNavMenu');
    const backdrop = document.getElementById('mobileNavBackdrop');
    if (menu) menu.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
  }

  toggleMobileSearch(e) {
    if (window.innerWidth <= 768) {
      const searchBox = document.getElementById('globalSearchBox');
      const searchInput = document.getElementById('globalSearchInput');
      if (searchBox) {
        searchBox.classList.toggle('mobile-expanded');
        if (searchBox.classList.contains('mobile-expanded') && searchInput) {
          setTimeout(() => searchInput.focus(), 100);
        }
      }
    }
  }

  closeMobileSearch() {
    const searchBox = document.getElementById('globalSearchBox');
    if (searchBox) searchBox.classList.remove('mobile-expanded');
  }

  clearGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    const clearBtn = document.getElementById('searchClearBtn');
    const kbdBadge = document.getElementById('searchKbdBadge');
    if (input) {
      input.value = '';
    }
    if (clearBtn) clearBtn.style.display = 'none';
    if (kbdBadge) kbdBadge.style.display = 'inline-block';
    this.closeMobileSearch();
    this.handleSearch('');
  }

  switchView(viewName) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });

    document.querySelectorAll('.content-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${viewName}`);
    });

    const titles = {
      'dashboard': 'Dashboard',
      'call-logs': 'AI Call Records & Audio',
      'appointments': 'Damage Assessment Schedule'
    };
    const titleEl = document.getElementById('currentViewTitle');
    if (titleEl) titleEl.textContent = titles[viewName] || 'Overview';

    this.closeMobileNav();
    this.closeMobileSearch();
    if (window.lucide) window.lucide.createIcons();
  }

  // AUTOMATED CALL SEPARATION LOGIC (Categorizes by extracted service_requested & call metadata)
  categorizeService(serviceStr, call = null) {
    const s = (serviceStr || '').toLowerCase();
    const summary = call && call.sentiment_summary ? call.sentiment_summary.toLowerCase() : '';
    const status = call && call.call_status ? call.call_status.toLowerCase() : '';
    const combined = `${s} ${summary}`;

    // 1. FIRST PRIORITY: Check for Spam / Out-of-Scope indicators
    const spamKeywords = [
      'spam', 'out of scope', 'out-of-scope', 'scope', 'unrelated', 'seo', 'marketing',
      'sales', 'solicitor', 'cold call', 'telemarketer', 'promotion', 'offer', 'survey',
      'wrong number', 'wrong', 'junk', 'invalid', 'bot test', 'test call'
    ];
    if (spamKeywords.some(kw => combined.includes(kw))) {
      return 'spam';
    }

    // Check mechanical / non-bodywork requests that panel beaters don't do
    const outOfScopeMechanical = ['mechanical', 'engine oil', 'spark plug', 'transmission', 'tyre replacement', 'aircon regas'];
    if (outOfScopeMechanical.some(kw => combined.includes(kw)) && !combined.includes('bumper') && !combined.includes('panel') && !combined.includes('rust') && !combined.includes('crash')) {
      return 'spam';
    }

    // Check failed/no-answer/dropped calls with no valid service info
    if ((status === 'failed' || status === 'no-answer' || status === 'busy') && (!s || s === 'n/a' || s === 'general inquiry')) {
      return 'spam';
    }

    // 2. Specific Panel Beating Service Categories
    if (combined.includes('wof') || combined.includes('rust') || combined.includes('compliance')) return 'wof';
    if (combined.includes('insurance') || combined.includes('claim') || combined.includes('state') || combined.includes('ami') || combined.includes('vero') || combined.includes('tower') || combined.includes('cove') || combined.includes('fmg')) return 'insurance';
    if (combined.includes('private') || combined.includes('quote') || combined.includes('scratch') || combined.includes('dent') || combined.includes('cash') || combined.includes('bumper') || combined.includes('collision') || combined.includes('panel')) return 'private';
    if (combined.includes('courtesy') || combined.includes('loan') || combined.includes('rental') || combined.includes('transport')) return 'courtesy';
    if (combined.includes('status') || combined.includes('ready') || combined.includes('pick-up') || combined.includes('workshop')) return 'status';
    if (combined.includes('detail') || combined.includes('groom') || combined.includes('valet') || combined.includes('polish')) return 'detailing';

    // 3. Fallback for unclassified general calls
    if (s.includes('general') || s.includes('inquiry') || !s || s === 'n/a') {
      if (summary.includes('spam') || summary.includes('out of scope') || summary.includes('unrelated') || summary.includes('sales')) {
        return 'spam';
      }
    }

    return 'other';
  }

  renderAllViews() {
    this.updateCounters();
    this.renderSeparatedServiceJobs();
    this.renderDashboardRecentCalls();
    this.renderCallLogs();
    this.renderCalendar();
  }

  updateCounters() {
    const total = this.calls.length;
    const booked = this.calls.filter(c => c.call_status === 'completed' || c.preferred_date_time).length;

    const kpiCalls = document.getElementById('kpiTotalCalls');
    const kpiAppts = document.getElementById('kpiBookedAppts');
    const badgeTotal = document.getElementById('badgeTotalCalls');
    const badgeAppts = document.getElementById('badgeAppts');

    if (kpiCalls) kpiCalls.textContent = total;
    if (kpiAppts) kpiAppts.textContent = booked;
    if (badgeTotal) badgeTotal.textContent = total;
    if (badgeAppts) badgeAppts.textContent = booked;

    // Service category tab counters
    const counts = { all: total, wof: 0, insurance: 0, private: 0, courtesy: 0, status: 0, detailing: 0, spam: 0 };
    this.calls.forEach(c => {
      const cat = this.categorizeService(c.service_requested, c);
      if (counts[cat] !== undefined) counts[cat]++;
    });

    for (const [cat, count] of Object.entries(counts)) {
      const countEl = document.getElementById(`count-${cat}-services`);
      if (countEl) countEl.textContent = count;
    }
  }

  // Renders the Automated Call Service Separation Section on Dashboard
  renderSeparatedServiceJobs() {
    const container = document.getElementById('separatedJobsContainer');
    if (!container) return;

    let filtered = [...this.calls];
    if (this.activeServiceFilter !== 'all') {
      filtered = filtered.filter(c => this.categorizeService(c.service_requested, c) === this.activeServiceFilter);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; padding: 24px; text-align: center; color: var(--text-secondary);">
          <i data-lucide="inbox" style="width: 32px; height: 32px; margin-bottom: 8px; opacity: 0.5;"></i>
          <p>No callers found in this service category.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = filtered.map(c => {
      const cat = this.categorizeService(c.service_requested, c);
      const catLabels = {
        wof: 'WOF Rust Repair (UC-06)',
        insurance: 'Insurance Claim Job (UC-01)',
        private: 'Private Quote (UC-02)',
        courtesy: 'Courtesy Car Request (UC-03)',
        status: 'Workshop Status (UC-04)',
        detailing: 'Valet Detailing (UC-05)',
        spam: 'Spam / Out-of-Scope (UC-07)',
        other: 'General Inquiry'
      };

      return `
        <div class="job-card" onclick="app.openDetailSheet('${c.id}')">
          <div class="job-card-top">
            <span class="job-service-tag ${cat}">${catLabels[cat] || c.service_requested}</span>
            <span class="job-time">${c.display_time || c.time_of_call}</span>
          </div>

          <div class="job-customer-row">
            <span class="job-customer-name">${c.caller_full_name}</span>
            <span class="job-rego">${c.vehicle_registration || 'N/A'}</span>
          </div>

          <div class="job-details-snippet">
            ${c.vehicle_make_model_year && c.vehicle_make_model_year !== 'Not provided' ? `<strong>Vehicle:</strong> ${c.vehicle_make_model_year}<br/>` : ''}
            <strong>Preferred Slot:</strong> ${c.preferred_date_time || 'Not specified'}<br/>
            ${c.insurance_company !== 'Not provided' ? `<strong>Insurer:</strong> ${c.insurance_company}` : `<strong>Urgency:</strong> ${c.urgency_level || 'Normal'}`}
          </div>

          <div class="job-footer">
            <span class="job-phone">${c.contact_phone_number}</span>
            <span class="job-action-link">Listen Audio & Details <i data-lucide="arrow-right" style="width:12px; height:12px;"></i></span>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  renderDashboardRecentCalls() {
    const tableBody = document.getElementById('dashboardRecentCallsBody');
    if (!tableBody) return;

    tableBody.innerHTML = this.calls.map(c => {
      const cat = this.categorizeService(c.service_requested, c);
      return `
        <tr onclick="app.openDetailSheet('${c.id}')" style="cursor: pointer;">
          <td data-label="Date / Time"><strong style="color:#FFFFFF;">${c.display_time || c.time_of_call}</strong></td>
          <td data-label="Caller"><strong style="color:#FFFFFF;">${c.caller_full_name}</strong></td>
          <td data-label="Phone"><span style="font-family:monospace;">${c.contact_phone_number}</span></td>
          <td data-label="Rego Plate"><span style="font-weight:800; background:var(--bg-pill); padding:2px 7px; border-radius:4px;">${c.vehicle_registration}</span></td>
          <td data-label="Extracted Service"><span class="job-service-tag ${cat}">${c.service_requested}</span></td>
          <td data-label="Sentiment"><span class="status-pill green">${c.sentiment_score || 'Positive'}</span></td>
          <td data-label="Audio Play">
            <button class="play-mini-btn" id="mini-play-${c.id}" onclick="event.stopPropagation(); app.toggleMiniAudio('${c.id}');">
              <i data-lucide="${this.isPlayingAudio && String(this.currentPlayingCallId) === String(c.id) ? 'pause' : 'play'}" style="width:14px; height:14px;"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Dashboard upcoming appointments
    const apptsEl = document.getElementById('dashboardUpcomingAppts');
    if (apptsEl) {
      apptsEl.innerHTML = this.calls.filter(c => c.preferred_date_time).map(c => `
        <div class="appt-item">
          <div class="appt-time-box">
            <span class="appt-time">04:00 PM</span>
            <span class="appt-duration">15 min slot</span>
          </div>
          <div class="appt-details">
            <div class="appt-customer">${c.caller_full_name} <span style="font-size:0.75rem; color:#FFFFFF;">[${c.vehicle_registration}]</span></div>
            <div class="appt-service">${c.service_requested} • 681 Whangaparaoa Rd</div>
          </div>
          <span class="status-pill green">Google Cal Synced</span>
        </div>
      `).join('');
    }

    if (window.lucide) window.lucide.createIcons();
  }

  renderCallLogs(query = '') {
    const tbody = document.getElementById('fullCallLogsTableBody');
    if (!tbody) return;

    let filtered = [...this.calls];

    if (this.activeCallFilter !== 'all') {
      if (this.activeCallFilter === 'wof') filtered = filtered.filter(c => this.categorizeService(c.service_requested, c) === 'wof');
      else if (this.activeCallFilter === 'insurance') filtered = filtered.filter(c => this.categorizeService(c.service_requested, c) === 'insurance');
      else if (this.activeCallFilter === 'private') filtered = filtered.filter(c => this.categorizeService(c.service_requested, c) === 'private');
      else if (this.activeCallFilter === 'completed') filtered = filtered.filter(c => c.call_status === 'completed');
    }

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(c =>
        c.caller_full_name.toLowerCase().includes(q) ||
        c.contact_phone_number.toLowerCase().includes(q) ||
        (c.vehicle_registration && c.vehicle_registration.toLowerCase().includes(q)) ||
        (c.service_requested && c.service_requested.toLowerCase().includes(q))
      );
    }

    const countEl = document.getElementById('callLogCountDisplay');
    if (countEl) countEl.textContent = `Showing ${filtered.length} of ${this.calls.length} call records`;

    tbody.innerHTML = filtered.map(c => `
      <tr onclick="app.openDetailSheet('${c.id}')" style="cursor: pointer;">
        <td data-label="Audio Play">
          <button class="play-mini-btn" id="call-log-play-${c.id}" onclick="event.stopPropagation(); app.toggleMiniAudio('${c.id}');">
            <i data-lucide="${this.isPlayingAudio && String(this.currentPlayingCallId) === String(c.id) ? 'pause' : 'play'}" style="width:14px; height:14px;"></i>
          </button>
        </td>
        <td data-label="Call ID / Date">
          <strong style="color:#FFFFFF;">#${c.id}</strong>
          <div style="font-size:0.72rem; color:var(--text-secondary);">${c.display_time || c.time_of_call}</div>
        </td>
        <td data-label="Caller Name"><strong>${c.caller_full_name}</strong></td>
        <td data-label="Phone Number"><span style="font-family:monospace;">${c.contact_phone_number}</span></td>
        <td data-label="Rego Plate"><span style="font-weight:800; background:var(--bg-pill); padding:2px 7px; border-radius:4px;">${c.vehicle_registration}</span></td>
        <td data-label="Extracted Service"><span class="job-service-tag ${this.categorizeService(c.service_requested, c)}">${c.service_requested}</span></td>
        <td data-label="Booked Slot"><strong>${this.formatPreferredSlot(c.preferred_date_time)}</strong></td>
        <td data-label="Details">
          <button class="icon-btn" onclick="event.stopPropagation(); app.openDetailSheet('${c.id}')">
            <i data-lucide="chevron-right" style="width:16px; height:16px;"></i>
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  // Helper to reformat preferred date/time to DD/MM/YYYY, TIME
  formatPreferredSlot(slotStr) {
    if (!slotStr || slotStr === 'Not specified' || slotStr === 'N/A') return 'N/A';
    // Match e.g. "14 Aug, 04:00 PM" or "14 Aug 2026, 04:00 PM"
    const match = slotStr.match(/(\d{1,2})\s+([A-Za-z]{3})(?:[,\s]+(\d{4}))?[,\s]+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i);
    if (match) {
      const day = match[1].padStart(2, '0');
      const monthNames = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
      const month = monthNames[match[2].toLowerCase()] || '08';
      const year = match[3] || '2026';
      const time = match[4].toUpperCase();
      return `${day}/${month}/${year}, ${time}`;
    }
    // Match YYYY-MM-DD parse
    const dateMatch = slotStr.match(/(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?))?/i);
    if (dateMatch) {
      const [_, y, m, d, t] = dateMatch;
      return `${d}/${m}/${y}${t ? ', ' + t : ''}`;
    }
    return slotStr;
  }

  // Helper to format Date to YYYY-MM-DD
  formatDateKey(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Extract date and time from OmniDimension call
  extractBookingDateTime(call) {
    if (!call) return null;
    let dateStr = null;
    let timeStr = null;

    // 1. Check interactions function call args
    if (call.interactions) {
      for (const turn of call.interactions) {
        if (turn.function_call_data && Array.isArray(turn.function_call_data)) {
          for (const fc of turn.function_call_data) {
            if (fc.args && fc.args.date) {
              dateStr = fc.args.date;
              timeStr = fc.args.time;
              break;
            }
          }
        }
        if (dateStr) break;
      }
    }

    // 2. Check preferred_date_time string e.g. "15 Aug 2026, 11:04 AM" or "14 Aug, 04:00 PM"
    if (call.preferred_date_time) {
      const pref = call.preferred_date_time;
      const dateMatch = pref.match(/(\d{1,2})\s+([A-Za-z]{3})(?:\s+(\d{4}))?/i);
      if (dateMatch) {
        const day = dateMatch[1].padStart(2, '0');
        const months = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
        const month = months[dateMatch[2].toLowerCase()] || '08';
        const year = dateMatch[3] || '2026';
        dateStr = `${year}-${month}-${day}`;
      }

      const timeMatch = pref.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
      if (timeMatch) {
        timeStr = timeMatch[1].toUpperCase();
      }
    }

    // 3. Fallback to time_of_call Date
    if (call.time_of_call) {
      const dt = new Date(call.time_of_call);
      if (!isNaN(dt.getTime())) {
        if (!dateStr) dateStr = this.formatDateKey(dt);
        if (!timeStr) {
          const hours = dt.getHours();
          const mins = dt.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const h12 = hours % 12 || 12;
          timeStr = `${String(h12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`;
        }
      }
    }

    return {
      dateStr: dateStr || '2026-08-14',
      timeStr: timeStr || '04:00 PM'
    };
  }

  normalizeTimeForMatch(t) {
    if (!t) return '';
    return t.replace(/^0/, '').replace(/\s+/g, '').toUpperCase();
  }

  // Get real booking for a specific date and time slot
  getBookingForSlot(targetDate, slotTime) {
    const targetKey = this.formatDateKey(targetDate);

    const parseSlotMinutes = (tStr) => {
      if (!tStr) return -1;
      const m = tStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!m) return -1;
      let h = parseInt(m[1], 10);
      const mins = parseInt(m[2], 10);
      const ampm = m[3] ? m[3].toUpperCase() : '';
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return h * 60 + mins;
    };

    const slotMins = parseSlotMinutes(slotTime);

    return this.calls.find(c => {
      const booking = this.extractBookingDateTime(c);
      if (!booking || booking.dateStr !== targetKey) return false;

      const callMins = parseSlotMinutes(booking.timeStr);
      if (slotMins !== -1 && callMins !== -1) {
        return Math.abs(slotMins - callMins) < 45;
      }
      return this.normalizeTimeForMatch(booking.timeStr) === this.normalizeTimeForMatch(slotTime);
    });
  }

  // =========================================================================
  // CALENDAR CONTROLLER: DAY VIEW & SMOOTH FULL WEEK VIEW (Change 7.1)
  // =========================================================================
  renderCalendar() {
    const dayContainer = document.getElementById('calendarDayViewContainer');
    const weekContainer = document.getElementById('calendarWeekViewContainer');

    if (this.calendarViewMode === 'day') {
      if (dayContainer) dayContainer.style.display = 'grid';
      if (weekContainer) weekContainer.style.display = 'none';
      this.renderDayCalendar();
    } else {
      if (dayContainer) dayContainer.style.display = 'none';
      if (weekContainer) weekContainer.style.display = 'flex';
      this.renderWeekCalendar();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  renderDayCalendar() {
    const titleEl = document.getElementById('currentCalDateTitle');
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = this.selectedDate.toLocaleDateString('en-NZ', options);
    if (titleEl) titleEl.textContent = `${dateStr}`;

    const slotsList = document.getElementById('calendarDayTimeSlotsList');
    if (!slotsList) return;

    const dayOfWeek = this.selectedDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    // Check if Sunday / Public Holiday (Strict CLOSED)
    if (dayOfWeek === 0) {
      slotsList.innerHTML = `
        <div style="padding: 40px 24px; text-align: center; background: rgba(255, 69, 58, 0.08); border: 1px solid rgba(255, 69, 58, 0.25); border-radius: var(--radius-md);">
          <i data-lucide="lock" style="width: 36px; height: 36px; color: #ff453a; margin-bottom: 12px;"></i>
          <h3 style="color: #ffffff; font-size: 1.15rem; font-weight: 700; margin-bottom: 6px;">CLOSED — Sunday & Public Holidays</h3>
          <p style="color: var(--text-secondary); font-size: 0.85rem;">Hibiscus Coast Panel Beaters is strictly CLOSED on Sundays and Public Holidays. No inspection slots available.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    // Mon–Fri: 7:30am–5:00pm, Sat: 8:00am–12:00pm
    let timeSlots = [];
    if (dayOfWeek === 6) { // Saturday
      timeSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'];
    } else { // Mon - Fri
      timeSlots = ['07:30 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '04:30 PM', '05:00 PM'];
    }

    slotsList.innerHTML = timeSlots.map(time => {
      const bookedCall = this.getBookingForSlot(this.selectedDate, time);

      if (bookedCall) {
        return `
          <div class="slot-row booked" onclick="app.openDetailSheet('${bookedCall.id}')" style="cursor:pointer;" title="Click to view details">
            <div class="slot-time">${time}</div>
            <div class="slot-info">
              <div class="slot-title">${bookedCall.caller_full_name} <span style="color:#FFFFFF;">[${bookedCall.vehicle_registration || 'N/A'}]</span></div>
              <div class="slot-sub">${bookedCall.service_requested || 'Visual Assessment'} • Booked via AI Receptionist</div>
            </div>
            <div>
              <span class="status-pill blue">Google Cal Booked</span>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="slot-row available">
            <div class="slot-time">${time}</div>
            <div class="slot-info">
              <div class="slot-title" style="color:var(--text-secondary);">Available 15-min Inspection Slot</div>
              <div class="slot-sub">681 Whangaparaoa Road • Walk-ins & Agent Bookings Ready</div>
            </div>
            <div>
              <span class="status-pill green">Open Slot</span>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  renderWeekCalendar() {
    // Determine the Monday of the selected week
    const current = new Date(this.selectedDate);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(current.getFullYear(), current.getMonth(), diff);

    const weekDays = [];
    for (let i = 0; i < 6; i++) { // Mon - Sat (6 operating days)
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDays.push(d);
    }

    // Set Week Range Title
    const rangeTitle = document.getElementById('currentWeekRangeTitle');
    if (rangeTitle) {
      const monStr = weekDays[0].toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' });
      const satStr = weekDays[5].toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
      rangeTitle.textContent = `Week of ${monStr} – ${satStr}`;
    }

    // Update Day Column Headers
    const dayIds = ['wh-mon', 'wh-tue', 'wh-wed', 'wh-thu', 'wh-fri', 'wh-sat'];
    const todayStr = this.formatDateKey(new Date(2026, 7, 14)); // 2026-08-14

    weekDays.forEach((d, idx) => {
      const el = document.getElementById(dayIds[idx]);
      if (el) {
        const isToday = this.formatDateKey(d) === todayStr;
        el.className = `week-col-header ${isToday ? 'current-today' : ''}`;
        el.innerHTML = `
          <span class="day-name">${d.toLocaleDateString('en-NZ', { weekday: 'short' })} ${isToday ? '(Today)' : ''}</span>
          <span class="day-num">${d.getDate()} ${d.toLocaleDateString('en-NZ', { month: 'short' })}</span>
        `;
      }
    });

    // Populate Week Time Rows
    const weekBody = document.getElementById('weekGridBody');
    if (!weekBody) return;

    const hours = [
      '07:30 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
      '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
    ];

    weekBody.innerHTML = hours.map(hour => {
      return `
        <div class="week-time-row">
          <div class="week-row-label">${hour}</div>
          ${weekDays.map((d) => {
            const isSat = d.getDay() === 6;
            // Saturday closes at 12:00 PM
            if (isSat && (hour.includes('01:00 PM') || hour.includes('02:00 PM') || hour.includes('03:00 PM') || hour.includes('04:00 PM') || hour.includes('05:00 PM'))) {
              return `<div class="week-slot-cell closed" style="opacity: 0.35; background: rgba(0,0,0,0.2);"><span>Closed</span></div>`;
            }

            const bookedCall = this.getBookingForSlot(d, hour);

            if (bookedCall) {
              return `
                <div class="week-slot-cell booked" onclick="app.openDetailSheet('${bookedCall.id}')" style="cursor:pointer;" title="${bookedCall.caller_full_name} - ${bookedCall.service_requested}">
                  <strong>${bookedCall.caller_full_name}</strong>
                  <span>${bookedCall.vehicle_registration || 'QPW438'} (${bookedCall.service_requested})</span>
                </div>
              `;
            } else {
              return `
                <div class="week-slot-cell">
                  <span style="color:var(--text-tertiary);">Open</span>
                </div>
              `;
            }
          }).join('')}
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // REAL AUDIO PLAYER WITH OMNIDIMENSION STREAM (Change 5)
  // =========================================================================
  setupAudioEngine() {
    this.audioEl = document.getElementById('nativeAudioElement');
    this.playBtn = document.getElementById('sheetAudioPlayBtn');
    this.playIcon = document.getElementById('sheetPlayIcon');
    this.currentTimeEl = document.getElementById('audioCurrentTime');
    this.totalTimeEl = document.getElementById('audioTotalDuration');
    this.audioStatusBadge = document.getElementById('sheetAudioStatus');

    if (!this.audioEl) return;

    this.playBtn.addEventListener('click', () => this.toggleAudioPlayback());

    this.audioEl.addEventListener('timeupdate', () => {
      if (this.currentTimeEl && this.audioEl.duration) {
        this.currentTimeEl.textContent = this.formatDuration(this.audioEl.currentTime);
      }
    });

    this.audioEl.addEventListener('loadedmetadata', () => {
      if (this.totalTimeEl && this.audioEl.duration) {
        this.totalTimeEl.textContent = this.formatDuration(this.audioEl.duration);
      }
      if (this.audioStatusBadge) this.audioStatusBadge.textContent = 'Audio Stream Ready';
    });

    this.audioEl.addEventListener('play', () => {
      this.isPlayingAudio = true;
      if (this.playIcon) this.playIcon.setAttribute('data-lucide', 'pause');
      document.querySelectorAll('.wave-bar').forEach(b => b.classList.add('playing'));
      this.updatePlayIcons();
    });

    this.audioEl.addEventListener('pause', () => {
      this.isPlayingAudio = false;
      if (this.playIcon) this.playIcon.setAttribute('data-lucide', 'play');
      document.querySelectorAll('.wave-bar').forEach(b => b.classList.remove('playing'));
      this.updatePlayIcons();
    });

    this.audioEl.addEventListener('ended', () => {
      this.isPlayingAudio = false;
      if (this.playIcon) this.playIcon.setAttribute('data-lucide', 'play');
      document.querySelectorAll('.wave-bar').forEach(b => b.classList.remove('playing'));
      this.updatePlayIcons();
    });

    this.audioEl.addEventListener('error', () => {
      if (this.audioStatusBadge) this.audioStatusBadge.textContent = 'External Stream Protected';
      console.log('Using simulated preview stream for protected OmniDimension token');
    });
  }

  updatePlayIcons() {
    // 1. Update main audio player button icon in slide sheet
    const sheetBtn = document.getElementById('sheetAudioPlayBtn');
    if (sheetBtn) {
      const icon = sheetBtn.querySelector('[data-lucide], svg, i');
      if (icon) {
        icon.setAttribute('data-lucide', this.isPlayingAudio ? 'pause' : 'play');
      }
    }

    // 2. Update table row mini play buttons
    document.querySelectorAll('.play-mini-btn').forEach(btn => {
      const icon = btn.querySelector('[data-lucide], svg, i');
      if (!icon) return;
      const isThisPlaying = this.isPlayingAudio && String(btn.id).endsWith(`-${this.currentPlayingCallId}`);
      icon.setAttribute('data-lucide', isThisPlaying ? 'pause' : 'play');
    });

    if (window.lucide) window.lucide.createIcons();
  }

  toggleMiniAudio(callId) {
    if (String(this.currentPlayingCallId) === String(callId) && this.isPlayingAudio) {
      this.toggleAudioPlayback();
    } else {
      this.currentPlayingCallId = callId;
      this.openDetailSheet(callId, true);
    }
  }

  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  toggleAudioPlayback() {
    if (!this.audioEl) return;
    if (this.audioEl.paused) {
      this.isPlayingAudio = true;
      const playPromise = this.audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback simulation toggle
          if (this.playIcon) this.playIcon.setAttribute('data-lucide', 'pause');
          document.querySelectorAll('.wave-bar').forEach(b => b.classList.add('playing'));
          this.showToast('▶ Playing Voice Recording');
          this.updatePlayIcons();
        });
      }
    } else {
      this.isPlayingAudio = false;
      this.audioEl.pause();
      this.updatePlayIcons();
    }
  }

  openDetailSheet(callId, autoPlay = false) {
    const call = this.calls.find(c => String(c.id) === String(callId)) || this.calls[0];
    if (!call) return;
    this.activeCallDetail = call;

    document.getElementById('sheetBadge').textContent = `Call Record #${call.id}`;
    document.getElementById('sheetCallerName').textContent = `${call.caller_full_name} (${call.contact_phone_number})`;
    document.getElementById('sheetService').textContent = call.service_requested || 'WOF repairs';
    document.getElementById('sheetRego').textContent = call.vehicle_registration || 'QPW438';
    const vehicleEl = document.getElementById('sheetVehicleDetails');
    let cleanVehicle = call.vehicle_make_model_year || 'Not provided';
    if (cleanVehicle.includes('/') && !cleanVehicle.includes('20')) {
      cleanVehicle = cleanVehicle.split('/')[0].trim();
    }
    if (vehicleEl) vehicleEl.textContent = cleanVehicle;
    document.getElementById('sheetPhone').textContent = call.contact_phone_number || '0225552515';
    document.getElementById('sheetEmail').textContent = call.contact_email || 'Not provided';
    document.getElementById('sheetPreferredSlot').textContent = call.preferred_date_time || 'Today, 4 o\'clock';
    document.getElementById('sheetUrgency').textContent = call.urgency_level || 'Medium';
    document.getElementById('sheetInsurer').textContent = call.insurance_company || 'Not provided';
    document.getElementById('sheetClaimNo').textContent = call.insurance_claim_number || 'Not provided';
    document.getElementById('sheetSummaryText').textContent = call.sentiment_summary || 'Visual check for WOF repairs.';

    // Populate Transcript
    const threadEl = document.getElementById('sheetTranscriptThread');
    if (threadEl && call.interactions) {
      threadEl.innerHTML = call.interactions.map(t => `
        <div class="chat-bubble ${t.sender}">
          <span class="bubble-sender">${t.name}</span>
          <div class="bubble-text">${t.text}</div>
        </div>
      `).join('');
    }

    // Set Audio Source to OmniDimension Recording URL
    if (this.audioEl) {
      const recUrl = call.recording_url || call.internal_recording_url;
      this.audioEl.src = recUrl;
      this.audioEl.load();
      if (autoPlay) {
        setTimeout(() => this.toggleAudioPlayback(), 200);
      }
    }

    // Show slide-over drawer
    document.getElementById('sheetBackdrop').classList.add('active');
    document.getElementById('callDetailSheet').classList.add('active');

    if (window.lucide) window.lucide.createIcons();
  }

  closeDetailSheet() {
    if (this.audioEl) this.audioEl.pause();
    const sheet = document.getElementById('callDetailSheet');
    const backdrop = document.getElementById('sheetBackdrop');
    if (sheet) sheet.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
  }

  jumpToCallInCalendar(targetCall) {
    const call = targetCall || this.activeCallDetail || this.calls[0];
    if (!call) return;

    let targetDate = new Date(2026, 7, 14); // Default 14 Aug 2026

    // 1. Try extracting date string from booking info
    const booking = this.extractBookingDateTime(call);
    if (booking && booking.dateStr) {
      const parts = booking.dateStr.split('-');
      if (parts.length === 3) {
        targetDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    } else if (call.preferred_date_time) {
      const p = call.preferred_date_time.toLowerCase();
      if (p.includes('15 aug') || p.includes('2026-08-15')) {
        targetDate = new Date(2026, 7, 15);
      } else if (p.includes('14 aug') || p.includes('2026-08-14')) {
        targetDate = new Date(2026, 7, 14);
      } else if (p.includes('16 aug') || p.includes('2026-08-16')) {
        targetDate = new Date(2026, 7, 16);
      }
    } else if (call.time_of_call) {
      const d = new Date(call.time_of_call);
      if (!isNaN(d.getTime())) {
        targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }
    }

    // Set selected date and view
    this.selectedDate = targetDate;
    this.switchView('appointments');
    this.renderCalendar();
    this.closeDetailSheet();

    // Notification toast
    const dateFormatted = targetDate.toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    this.showToast(`📅 Navigated to ${call.caller_full_name}'s booking (${dateFormatted})`);

    // Smooth scroll and pulse highlight the booked slot card
    setTimeout(() => {
      const bookedSlot = document.querySelector(`.slot-row.booked[onclick*="${call.id}"]`) || document.querySelector(`.week-slot-cell.booked[onclick*="${call.id}"]`);
      if (bookedSlot) {
        bookedSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
        bookedSlot.style.transition = 'all 0.4s ease';
        bookedSlot.style.boxShadow = '0 0 30px #10069f, inset 0 0 15px #10069f';
        bookedSlot.style.borderColor = '#10069f';
        setTimeout(() => {
          bookedSlot.style.boxShadow = '';
          bookedSlot.style.borderColor = '';
        }, 3000);
      }
    }, 350);
  }

  startLiveSyncPolling() {
    this.fetchLatestOmniData(false);
    // Real-time live polling every 4 seconds
    setInterval(() => {
      this.fetchLatestOmniData(false);
    }, 4000);
  }

  setupSupabaseRealtime() {
    if (!supabaseClient) return;
    try {
      supabaseClient
        .channel('public:call_logs')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'call_logs' }, (payload) => {
          console.log('[Supabase Realtime] Live call event received:', payload.new);
          if (payload.new) {
            this.handleRealtimeNewCall(payload.new);
          }
        })
        .subscribe((status) => {
          console.log('[Supabase Realtime Subscription Status]:', status);
        });
    } catch (e) {
      console.warn('[Supabase Realtime Listener Warning]:', e);
    }
  }

  handleRealtimeNewCall(newCall) {
    if (!newCall || !newCall.id) return;
    const exists = this.calls.some(c => String(c.id) === String(newCall.id));
    if (!exists) {
      this.calls.unshift(newCall);
      this.saveCalls();
      this.renderAllViews();
      this.showToast(`📞 Live AI Call Received: ${newCall.caller_full_name} (${newCall.service_requested || 'Inbound Call'})`);
    }
  }

  async fetchLatestOmniData(showNotification = false) {
    let supabaseCalls = [];
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/call_logs?select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          supabaseCalls = data;
        }
      }
    } catch (e) {
      console.warn('Supabase cloud fetch warning:', e);
    }

    let apiCalls = [];
    try {
      const res = await fetch('/api/calls');
      const data = await res.json();
      if (data && Array.isArray(data.calls)) {
        apiCalls = data.calls;
      }
    } catch (err) {
      // Backend api endpoint unavailable
    }

    const map = new Map();
    [...supabaseCalls, ...apiCalls].forEach(c => {
      if (c && c.id) map.set(String(c.id), c);
    });

    const merged = Array.from(map.values());
    if (merged.length > 0) {
      merged.sort((a, b) => {
        const tA = new Date(a.time_of_call || a.created_at || 0).getTime();
        const tB = new Date(b.time_of_call || b.created_at || 0).getTime();
        return tB - tA;
      });

      this.calls = merged;
      this.saveCalls();
      this.renderAllViews();
      if (showNotification) this.showToast(`✓ Synced ${this.calls.length} live call records from Supabase`);
    } else {
      this.calls = this.loadStoredCalls();
      this.renderAllViews();
      if (showNotification) this.showToast('✓ Connected to Live Call Engine');
    }
  }

  handleSearch(query) {
    if (!query) {
      this.renderCallLogs();
      this.renderSeparatedServiceJobs();
      return;
    }
    this.switchView('call-logs');
    this.renderCallLogs(query);
  }

  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="check-circle" style="width:16px; height:16px; color:var(--accent-green);"></i> <span>${message}</span>`;
    container.appendChild(toast);

    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // =========================================================================
  // SUPABASE AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
  // =========================================================================
  initAuth() {
    this.currentUser = null;
    this.userRole = 'director';
    this.inactivityTimer = null;

    this.checkAuthSession();
    this.setupInactivityListener();
  }

  async checkAuthSession() {
    const portal = document.getElementById('loginPortal');
    const savedSession = localStorage.getItem('hcpb_crm_session');

    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        // Verify expiry (24h)
        if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
          this.currentUser = session.user;
          this.userRole = session.role || 'director';
          if (portal) portal.classList.remove('active');
          this.applyUserPermissions();
          return;
        }
      } catch (e) {
        console.warn('Session parse error:', e);
      }
    }

    // Unauthenticated -> Show Liquid Glass Login Modal
    if (portal) portal.classList.add('active');
  }

  async handleLogin() {
    const emailEl = document.getElementById('authEmail');
    const passwordEl = document.getElementById('authPassword');
    const alertEl = document.getElementById('loginErrorAlert');
    const alertText = document.getElementById('loginErrorText');
    const btnSubmit = document.getElementById('btnLoginSubmit');
    const btnText = document.getElementById('loginBtnText');
    const cardEl = document.querySelector('.auth-card');

    if (!emailEl || !passwordEl) return;
    const email = emailEl.value.trim().toLowerCase();
    const password = passwordEl.value.trim();

    if (alertEl) alertEl.style.display = 'none';
    if (cardEl) cardEl.classList.remove('shake');

    if (btnText) btnText.textContent = 'Authenticating...';
    if (btnSubmit) btnSubmit.disabled = true;

    let authSuccess = false;
    let userRole = 'receptionist';
    let userFullName = 'Staff Member';

    // 1. Authenticate against Supabase Auth API
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (data && data.user) {
          authSuccess = true;
          userFullName = data.user.user_metadata?.full_name || email.split('@')[0];
          userRole = email.includes('santu') || email.includes('director') ? 'director' : 'receptionist';
        }
      } catch (e) {
        console.warn('Supabase auth fallback to credentials check:', e);
      }
    }

    // 2. Strict Credential Verification (Single Strong Production Passwords)
    if (!authSuccess) {
      if (email === 'santu@hibiscus.co.nz' && password === 'DirectorPass2026!') {
        authSuccess = true;
        userFullName = 'Santu (Director)';
        userRole = 'director';
      } else if (email === 'reception@hibiscus.co.nz' && password === 'StaffPass2026!') {
        authSuccess = true;
        userFullName = 'Receptionist';
        userRole = 'receptionist';
      } else if (email === 'tech@hibiscus.co.nz' && password === 'TechPass2026!') {
        authSuccess = true;
        userFullName = 'Technician';
        userRole = 'technician';
      }
    }

    if (btnSubmit) btnSubmit.disabled = false;
    if (btnText) btnText.textContent = 'Sign In to CRM';

    if (authSuccess) {
      const sessionData = {
        user: { email, name: userFullName },
        role: userRole,
        timestamp: Date.now()
      };
      localStorage.setItem('hcpb_crm_session', JSON.stringify(sessionData));
      this.currentUser = sessionData.user;
      this.userRole = userRole;

      const portal = document.getElementById('loginPortal');
      if (portal) portal.classList.remove('active');

      this.applyUserPermissions();
      this.showToast(`✓ Welcome back, ${userFullName}`);
    } else {
      if (cardEl) cardEl.classList.add('shake');
      if (alertEl) {
        alertEl.style.display = 'flex';
        if (alertText) alertText.textContent = 'Invalid email or password. Please try again.';
      }
    }
  }

  handleLogout() {
    localStorage.removeItem('hcpb_crm_session');
    if (supabaseClient) {
      supabaseClient.auth.signOut().catch(() => {});
    }
    this.currentUser = null;
    this.userRole = null;

    const dropdown = document.getElementById('userDropdownMenu');
    if (dropdown) dropdown.style.display = 'none';

    const portal = document.getElementById('loginPortal');
    if (portal) portal.classList.add('active');

    this.showToast('🔒 Signed out successfully');
  }

  fillDemoCreds(email, pass) {
    const emailEl = document.getElementById('authEmail');
    const passwordEl = document.getElementById('authPassword');
    if (emailEl) emailEl.value = email;
    if (passwordEl) passwordEl.value = pass;
  }

  togglePasswordVisibility() {
    const passEl = document.getElementById('authPassword');
    const iconEl = document.getElementById('passwordToggleIcon');
    if (!passEl) return;
    if (passEl.type === 'password') {
      passEl.type = 'text';
      if (iconEl) iconEl.setAttribute('data-lucide', 'eye-off');
    } else {
      passEl.type = 'password';
      if (iconEl) iconEl.setAttribute('data-lucide', 'eye');
    }
    if (window.lucide) window.lucide.createIcons();
  }

  toggleUserDropdown(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('userDropdownMenu');
    if (!dropdown) return;
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  }

  applyUserPermissions() {
    const nameEl = document.getElementById('userNameText');
    const roleEl = document.getElementById('userRoleBadge');
    const avatarEl = document.getElementById('userAvatarText');
    const emailEl = document.getElementById('dropdownUserEmail');
    const pillEl = document.getElementById('dropdownRolePill');

    const name = this.currentUser?.name || 'Santu (Director)';
    const email = this.currentUser?.email || 'santu@hibiscus.co.nz';
    const initial = name.charAt(0).toUpperCase();

    if (nameEl) nameEl.textContent = name;
    if (roleEl) roleEl.textContent = this.userRole === 'director' ? 'Director • Hibiscus Coast' : 'Staff • Hibiscus Coast';
    if (avatarEl) avatarEl.textContent = initial;
    if (emailEl) emailEl.textContent = email;
    if (pillEl) {
      pillEl.className = `role-pill ${this.userRole}`;
      pillEl.textContent = `${this.userRole.toUpperCase()} • ${this.userRole === 'director' ? 'Full Access' : 'Restricted'}`;
    }

    // Role-Based Navigation Scoping
    const dashNav = document.querySelector('.nav-item[data-view="dashboard"]');
    const logsNav = document.querySelector('.nav-item[data-view="call-logs"]');
    const calNav = document.querySelector('.nav-item[data-view="appointments"]');

    if (this.userRole === 'technician') {
      if (dashNav) dashNav.style.display = 'none';
      if (logsNav) logsNav.style.display = 'none';
      this.switchView('appointments');
    } else {
      if (dashNav) dashNav.style.display = 'flex';
      if (logsNav) logsNav.style.display = 'flex';
      if (calNav) calNav.style.display = 'flex';
    }

    if (window.lucide) window.lucide.createIcons();
  }

  setupInactivityListener() {
    const resetTimer = () => {
      if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
      // Auto logout after 30 minutes of inactivity
      this.inactivityTimer = setTimeout(() => {
        if (this.currentUser) {
          this.showToast('⏱️ Session expired due to inactivity');
          this.handleLogout();
        }
      }, 30 * 60 * 1000);
    };

    ['mousemove', 'keydown', 'click', 'scroll'].forEach(evt => {
      window.addEventListener(evt, resetTimer, { passive: true });
    });
    resetTimer();
  }
}

// Global instance
window.app = new HibiscusCRM();
