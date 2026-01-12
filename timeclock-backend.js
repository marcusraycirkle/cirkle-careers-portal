/**
 * TimeClock Backend API - Cloudflare Worker
 * Manages staff database, payslips, disciplinary actions, and more
 * 
 * Deploy with: wrangler deploy timeclock-backend.js --name timeclock-backend
 */

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'X-Content-Type-Options': 'nosniff'
};

function addCorsHeaders(response) {
  const newResponse = new Response(response.body, response);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  return newResponse;
}

// Discord API configuration
const DISCORD_API = 'https://discord.com/api/v10';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return addCorsHeaders(new Response(null, { headers: corsHeaders }));
    }

    // Health check
    if (path === '/health' || path === '/') {
      return addCorsHeaders(new Response(JSON.stringify({
        status: 'healthy',
        service: 'TimeClock Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    try {
      // Route requests
      if (path.startsWith('/api/employers/staff/list')) {
        return await handleGetAllStaff(request, env);
      }
      if (path.startsWith('/api/employers/staff/')) {
        return await handleGetStaffMember(request, env);
      }
      if (path.startsWith('/api/employers/payslips/list')) {
        return await handleGetPayslips(request, env);
      }
      if (path.startsWith('/api/employers/payslips/add')) {
        return await handleAddPayslip(request, env);
      }
      if (path.startsWith('/api/employers/disciplinaries/list')) {
        return await handleGetDisciplinaries(request, env);
      }
      if (path.startsWith('/api/employers/disciplinaries/issue')) {
        return await handleIssueDisciplinary(request, env);
      }
      if (path.startsWith('/api/employers/reports/list')) {
        return await handleGetReports(request, env);
      }
      if (path.startsWith('/api/employers/reports/submit')) {
        return await handleSubmitReport(request, env);
      }
      if (path.startsWith('/api/employers/requests/list')) {
        return await handleGetRequests(request, env);
      }
      if (path.startsWith('/api/employers/requests/approve')) {
        return await handleApproveRequest(request, env);
      }
      if (path.startsWith('/api/employers/requests/reject')) {
        return await handleRejectRequest(request, env);
      }
      if (path.startsWith('/api/employers/absences/list')) {
        return await handleGetAbsences(request, env);
      }
      if (path.startsWith('/api/employers/absences/approve')) {
        return await handleApproveAbsence(request, env);
      }
      if (path.startsWith('/api/employers/absences/reject')) {
        return await handleRejectAbsence(request, env);
      }
      if (path.startsWith('/api/employers/users/suspend')) {
        return await handleSuspendUser(request, env);
      }
      if (path.startsWith('/api/employers/users/unsuspend')) {
        return await handleUnsuspendUser(request, env);
      }
      if (path.startsWith('/api/employers/users/dismiss')) {
        return await handleDismissUser(request, env);
      }
      if (path.startsWith('/api/employers/users/dismissed-list')) {
        return await handleGetDismissedUsers(request, env);
      }
      if (path.startsWith('/api/employers/dashboard/stats')) {
        return await handleGetDashboardStats(request, env);
      }

      return addCorsHeaders(new Response(JSON.stringify({
        error: 'Endpoint not found',
        path: path
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }));

    } catch (error) {
      return addCorsHeaders(new Response(JSON.stringify({
        error: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
  }
};

// ============================
// STAFF DATABASE
// ============================

// Google Sheets configuration
const SHEETS_ID = '1_RE6ahFPZ-k5QbxH96JlzvqwRQ34DbZ7ExMuaYJ2-pY';
const SHEETS = {
  EMPLOYEES: 'cirklehrUsers',
  PAYSLIPS: 'cirklehrPayslips',
  STRIKES: 'cirklehrStrikes',
  REPORTS: 'cirklehrReports',
  ABSENCES: 'cirklehrAbsences'
};

// Parse CSV data from Google Sheets
function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }
  
  return rows;
}

async function fetchGoogleSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEETS_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${sheetName}`);
  }
  
  const text = await response.text();
  return parseCSV(text);
}

async function handleGetAllStaff(request, env) {
  try {
    // Fetch employee data from Google Sheets
    const employees = await fetchGoogleSheet(SHEETS.EMPLOYEES);
    
    // Transform to staff format
    // Columns: A=Name, B=Email, C=Department, D=User ID, E=Timezone, F=Country, G=Hire Date, H=Status, K=Base Level
    const staff = employees.map((row, index) => {
      const columns = Object.values(row);
      return {
        id: columns[3] || `emp-${index}`, // D: User ID (Discord)
        name: columns[0] || 'Unknown', // A: Name
        email: columns[1] || '', // B: Email
        department: columns[2] || 'Unassigned', // C: Department
        userId: columns[3] || '', // D: User ID
        timezone: columns[4] || '', // E: Timezone
        country: columns[5] || '', // F: Country
        hireDate: columns[6] || '', // G: Hire Date
        status: columns[7] || 'Active', // H: Status (Active/Suspended)
        baseLevel: columns[10] || '', // K: Base Level
        avatar: null,
        username: columns[0] || 'Unknown'
      };
    }).filter(emp => emp.name && emp.name !== 'Unknown' && emp.name !== '');

    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      count: staff.length,
      staff: staff,
      source: 'Google Sheets'
    }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'Failed to fetch staff from Google Sheets',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}

async function handleGetStaffMember(request, env) {
  const { userId, includeHistory } = await request.json();
  const url = new URL(request.url);
  const userIdFromPath = url.pathname.split('/').pop();
  const targetUserId = userId || userIdFromPath;

  if (!env.DISCORD_BOT_TOKEN) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'DISCORD_BOT_TOKEN not configured'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  // Fetch user from Discord
  const response = await fetch(`${DISCORD_API}/users/${targetUserId}`, {
    headers: {
      'Authorization': `Bot ${env.DISCORD_BOT_TOKEN}`
    }
  });

  if (!response.ok) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'User not found',
      userId: targetUserId
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  const user = await response.json();

  // Get from KV if includeHistory
  let history = [];
  if (includeHistory && env.TIMECLOCK_KV) {
    const historyData = await env.TIMECLOCK_KV.get(`user:${targetUserId}:history`);
    if (historyData) {
      history = JSON.parse(historyData);
    }
  }

  return addCorsHeaders(new Response(JSON.stringify({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      globalName: user.global_name,
      discriminator: user.discriminator,
      avatar: user.avatar,
      history: history
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  }));
}

// ============================
// PAYSLIPS
// ============================

async function handleGetPayslips(request, env) {
  try {
    const { userId } = await request.json();
    
    // Fetch payslips from Google Sheets
    // Columns: A=User ID, B=Blank, C=Payslip Link, D=Comment, E=Person who sent
    const payslips = await fetchGoogleSheet(SHEETS.PAYSLIPS);
    
    const formattedPayslips = payslips.map((row, index) => {
      const columns = Object.values(row);
      return {
        id: `payslip-${index}`,
        userId: columns[0] || '',
        link: columns[2] || '',
        comment: columns[3] || '',
        sentBy: columns[4] || '',
        createdAt: new Date().toISOString()
      };
    }).filter(p => p.userId);

    // Filter by userId if provided
    const filtered = userId 
      ? formattedPayslips.filter(p => p.userId === userId)
      : formattedPayslips;

    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      count: filtered.length,
      payslips: filtered
    }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'Failed to fetch payslips',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}

async function handleAddPayslip(request, env) {
  const { userId, period, amount, currency } = await request.json();
  
  if (!env.TIMECLOCK_KV) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'KV storage not configured'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  const payslip = {
    id: crypto.randomUUID(),
    userId,
    period,
    amount,
    currency: currency || 'GBP',
    createdAt: new Date().toISOString()
  };

  // Store payslip
  const key = `payslips:${userId}`;
  const existingData = await env.TIMECLOCK_KV.get(key);
  const payslips = existingData ? JSON.parse(existingData) : [];
  payslips.push(payslip);
  await env.TIMECLOCK_KV.put(key, JSON.stringify(payslips));

  return addCorsHeaders(new Response(JSON.stringify({
    success: true,
    payslip: payslip
  }), {
    headers: { 'Content-Type': 'application/json' }
  }));
}

// ============================
// DISCIPLINARIES
// ============================

async function handleGetDisciplinaries(request, env) {
  try {
    const { userId, type } = await request.json();
    
    // Fetch disciplinaries from Google Sheets
    // Columns: A=User ID, B=Blank, C=Discipline Type, D=Description, E=Employer who sent
    const disciplinaries = await fetchGoogleSheet(SHEETS.STRIKES);
    
    const formatted = disciplinaries.map((row, index) => {
      const columns = Object.values(row);
      return {
        id: `strike-${index}`,
        userId: columns[0] || '',
        type: columns[2] || '',
        description: columns[3] || '',
        issuedBy: columns[4] || '',
        issuedAt: new Date().toISOString()
      };
    }).filter(d => d.userId);

    // Filter by userId and type if provided
    let filtered = userId 
      ? formatted.filter(d => d.userId === userId)
      : formatted;
    
    if (type) {
      filtered = filtered.filter(d => d.type === type);
    }

    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      count: filtered.length,
      disciplinaries: filtered
    }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'Failed to fetch disciplinaries',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}

async function handleIssueDisciplinary(request, env) {
  const { userId, type, reason, comment, severity, sendNotification } = await request.json();
  
  if (!env.TIMECLOCK_KV) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'KV storage not configured'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  const disciplinary = {
    id: crypto.randomUUID(),
    userId,
    type,
    reason,
    comment,
    severity,
    issuedAt: new Date().toISOString()
  };

  const key = `disciplinaries:${userId}`;
  const existingData = await env.TIMECLOCK_KV.get(key);
  const disciplinaries = existingData ? JSON.parse(existingData) : [];
  disciplinaries.push(disciplinary);
  await env.TIMECLOCK_KV.put(key, JSON.stringify(disciplinaries));

  return addCorsHeaders(new Response(JSON.stringify({
    success: true,
    disciplinary: disciplinary
  }), {
    headers: { 'Content-Type': 'application/json' }
  }));
}

// ============================
// REPORTS
// ============================

async function handleGetReports(request, env) {
  try {
    const { userId, type } = await request.json();
    
    // Fetch reports from Google Sheets
    // Columns: A=User ID, B=Blank, C=Report Type, D=Comment, E=Selector, F=Employer who sent
    const reports = await fetchGoogleSheet(SHEETS.REPORTS);
    
    const formatted = reports.map((row, index) => {
      const columns = Object.values(row);
      return {
        id: `report-${index}`,
        userId: columns[0] || '',
        type: columns[2] || '',
        comment: columns[3] || '',
        selector: columns[4] || '', // Commendation, Negative Behaviour, Disruptive, Monthly Report
        submittedBy: columns[5] || '',
        submittedAt: new Date().toISOString()
      };
    }).filter(r => r.userId);

    // Filter by userId and type if provided
    let filtered = userId 
      ? formatted.filter(r => r.userId === userId)
      : formatted;
    
    if (type) {
      filtered = filtered.filter(r => r.type === type || r.selector === type);
    }

    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      count: filtered.length,
      reports: filtered
    }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'Failed to fetch reports',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}

async function handleSubmitReport(request, env) {
  const { userId, type, submittedBy, comment, sendNotification } = await request.json();
  
  if (!env.TIMECLOCK_KV) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'KV storage not configured'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  const report = {
    id: crypto.randomUUID(),
    userId,
    type,
    submittedBy,
    comment,
    submittedAt: new Date().toISOString()
  };

  const key = 'reports:all';
  const existingData = await env.TIMECLOCK_KV.get(key);
  const reports = existingData ? JSON.parse(existingData) : [];
  reports.push(report);
  await env.TIMECLOCK_KV.put(key, JSON.stringify(reports));

  return addCorsHeaders(new Response(JSON.stringify({
    success: true,
    report: report
  }), {
    headers: { 'Content-Type': 'application/json' }
  }));
}

// ============================
// REQUESTS
// ============================

async function handleGetRequests(request, env) {
  const { userId, status } = await request.json();
  
  if (!env.TIMECLOCK_KV) {
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      requests: []
    }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  const key = 'requests:all';
  const data = await env.TIMECLOCK_KV.get(key);
  let requests = data ? JSON.parse(data) : [];

  if (userId) {
    requests = requests.filter(r => r.userId === userId);
  }
  if (status) {
    requests = requests.filter(r => r.status === status);
  }

  return addCorsHeaders(new Response(JSON.stringify({
    success: true,
    count: requests.length,
    requests: requests
  }), {
    headers: { 'Content-Type': 'application/json' }
  }));
}

async function handleApproveRequest(request, env) {
  const { requestId, userId, approverName, sendNotification } = await request.json();
  
  if (!env.TIMECLOCK_KV) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'KV storage not configured'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  const key = 'requests:all';
  const data = await env.TIMECLOCK_KV.get(key);
  const requests = data ? JSON.parse(data) : [];
  
  const requestIndex = requests.findIndex(r => r.id === requestId);
  if (requestIndex !== -1) {
    requests[requestIndex].status = 'approved';
    requests[requestIndex].approvedBy = approverName;
    requests[requestIndex].approvedAt = new Date().toISOString();
    await env.TIMECLOCK_KV.put(key, JSON.stringify(requests));
  }

  return addCorsHeaders(new Response(JSON.stringify({
    success: true,
    message: 'Request approved'
  }), {
    headers: { 'Content-Type': 'application/json' }
  }));
}

async function handleRejectRequest(request, env) {
  const { requestId, userId, rejectorName, reason, sendNotification } = await request.json();
  
  if (!env.TIMECLOCK_KV) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'KV storage not configured'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  const key = 'requests:all';
  const data = await env.TIMECLOCK_KV.get(key);
  const requests = data ? JSON.parse(data) : [];
  
  const requestIndex = requests.findIndex(r => r.id === requestId);
  if (requestIndex !== -1) {
    requests[requestIndex].status = 'rejected';
    requests[requestIndex].rejectedBy = rejectorName;
    requests[requestIndex].rejectedAt = new Date().toISOString();
    requests[requestIndex].rejectionReason = reason;
    await env.TIMECLOCK_KV.put(key, JSON.stringify(requests));
  }

  return addCorsHeaders(new Response(JSON.stringify({
    success: true,
    message: 'Request rejected'
  }), {
    headers: { 'Content-Type': 'application/json' }
  }));
}

// ============================
// ABSENCES
// ============================

async function handleGetAbsences(request, env) {
  try {
    const { userId, status } = await request.json();
    
    // Fetch absences from Google Sheets
    // Columns: A=Name, B=Start Date, C=End Date, D=Reason, E=Total Days, F=Comment, G=Approved/Denied, H=User ID
    const absences = await fetchGoogleSheet(SHEETS.ABSENCES);
    
    const formatted = absences.map((row, index) => {
      const columns = Object.values(row);
      return {
        id: `absence-${index}`,
        name: columns[0] || '',
        startDate: columns[1] || '',
        endDate: columns[2] || '',
        reason: columns[3] || '',
        totalDays: columns[4] || '',
        comment: columns[5] || '',
        status: columns[6] || 'Pending', // Approved/Denied
        userId: columns[7] || ''
      };
    }).filter(a => a.userId);

    // Filter by userId and status if provided
    let filtered = userId 
      ? formatted.filter(a => a.userId === userId)
      : formatted;
    
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }

    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      count: filtered.length,
      absences: filtered
    }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'Failed to fetch absences',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}

async function handleApproveAbsence(request, env) {
  const { absenceId, userId, sendNotification } = await request.json();
  
  if (!env.TIMECLOCK_KV) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'KV storage not configured'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  const key = 'absences:all';
  const data = await env.TIMECLOCK_KV.get(key);
  const absences = data ? JSON.parse(data) : [];
  
  const absenceIndex = absences.findIndex(a => a.id === absenceId);
  if (absenceIndex !== -1) {
    absences[absenceIndex].status = 'approved';
    absences[absenceIndex].approvedAt = new Date().toISOString();
    await env.TIMECLOCK_KV.put(key, JSON.stringify(absences));
  }

  return addCorsHeaders(new Response(JSON.stringify({
    success: true,
    message: 'Absence approved'
  }), {
    headers: { 'Content-Type': 'application/json' }
  }));
}

async function handleRejectAbsence(request, env) {
  const { absenceId, userId, reason, sendNotification } = await request.json();
  
  if (!env.TIMECLOCK_KV) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'KV storage not configured'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  const key = 'absences:all';
  const data = await env.TIMECLOCK_KV.get(key);
  const absences = data ? JSON.parse(data) : [];
  
  const absenceIndex = absences.findIndex(a => a.id === absenceId);
  if (absenceIndex !== -1) {
    absences[absenceIndex].status = 'rejected';
    absences[absenceIndex].rejectedAt = new Date().toISOString();
    absences[absenceIndex].rejectionReason = reason;
    await env.TIMECLOCK_KV.put(key, JSON.stringify(absences));
  }

  return addCorsHeaders(new Response(JSON.stringify({
    success: true,
    message: 'Absence rejected'
  }), {
    headers: { 'Content-Type': 'application/json' }
  }));
}

// ============================
// USER MANAGEMENT
// ============================

async function handleSuspendUser(request, env) {
  const { userId, reason, rolesRemove, sendNotification } = await request.json();
  
  if (!env.TIMECLOCK_KV) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'KV storage not configured'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  const suspension = {
    id: crypto.randomUUID(),
    userId,
    reason,
    rolesRemoved: rolesRemove,
    suspendedAt: new Date().toISOString()
  };

  await env.TIMECLOCK_KV.put(`suspension:${userId}`, JSON.stringify(suspension));

  return addCorsHeaders(new Response(JSON.stringify({
    success: true,
    message: 'User suspended',
    suspension: suspension
  }), {
    headers: { 'Content-Type': 'application/json' }
  }));
}

async function handleUnsuspendUser(request, env) {
  const { userId, rolesRestore, sendNotification } = await request.json();
  
  if (!env.TIMECLOCK_KV) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'KV storage not configured'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  await env.TIMECLOCK_KV.delete(`suspension:${userId}`);

  return addCorsHeaders(new Response(JSON.stringify({
    success: true,
    message: 'User unsuspended'
  }), {
    headers: { 'Content-Type': 'application/json' }
  }));
}

async function handleDismissUser(request, env) {
  const { userId, reason, allDataWipe, removeAllRoles, sendNotification } = await request.json();
  
  if (!env.TIMECLOCK_KV) {
    return addCorsHeaders(new Response(JSON.stringify({
      error: 'KV storage not configured'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  const dismissal = {
    id: crypto.randomUUID(),
    userId,
    reason,
    dismissedAt: new Date().toISOString()
  };

  const key = 'dismissals:all';
  const data = await env.TIMECLOCK_KV.get(key);
  const dismissals = data ? JSON.parse(data) : [];
  dismissals.push(dismissal);
  await env.TIMECLOCK_KV.put(key, JSON.stringify(dismissals));

  return addCorsHeaders(new Response(JSON.stringify({
    success: true,
    message: 'User dismissed',
    dismissal: dismissal
  }), {
    headers: { 'Content-Type': 'application/json' }
  }));
}

async function handleGetDismissedUsers(request, env) {
  const { includeDetails } = await request.json();
  
  if (!env.TIMECLOCK_KV) {
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      dismissals: []
    }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  const key = 'dismissals:all';
  const data = await env.TIMECLOCK_KV.get(key);
  const dismissals = data ? JSON.parse(data) : [];

  return addCorsHeaders(new Response(JSON.stringify({
    success: true,
    count: dismissals.length,
    dismissals: dismissals
  }), {
    headers: { 'Content-Type': 'application/json' }
  }));
}

// ============================
// DASHBOARD STATS
// ============================

async function handleGetDashboardStats(request, env) {
  const { guildId } = await request.json();
  
  if (!env.TIMECLOCK_KV || !env.DISCORD_BOT_TOKEN) {
    return addCorsHeaders(new Response(JSON.stringify({
      success: true,
      stats: {
        totalStaff: 0,
        activeRequests: 0,
        pendingAbsences: 0,
        recentDisciplinaries: 0
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  // Get staff count from Discord
  const membersResponse = await fetch(`${DISCORD_API}/guilds/${guildId}/members?limit=1`, {
    headers: {
      'Authorization': `Bot ${env.DISCORD_BOT_TOKEN}`
    }
  });

  let totalStaff = 0;
  if (membersResponse.ok) {
    const members = await membersResponse.json();
    totalStaff = members.length;
  }

  // Get counts from KV
  const requestsData = await env.TIMECLOCK_KV.get('requests:all');
  const requests = requestsData ? JSON.parse(requestsData) : [];
  const activeRequests = requests.filter(r => r.status === 'pending').length;

  const absencesData = await env.TIMECLOCK_KV.get('absences:all');
  const absences = absencesData ? JSON.parse(absencesData) : [];
  const pendingAbsences = absences.filter(a => a.status === 'pending').length;

  return addCorsHeaders(new Response(JSON.stringify({
    success: true,
    stats: {
      totalStaff,
      activeRequests,
      pendingAbsences,
      recentDisciplinaries: 0
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  }));
}
