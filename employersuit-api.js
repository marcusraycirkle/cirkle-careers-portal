// Employer Suite API Handler
// Manages all API calls to timeclock backend and careers backend

const TIMECLOCK_API = 'https://timeclock-backend.marcusray.workers.dev/api';
const CAREERS_API = 'https://cirkle-careers-api.marcusray.workers.dev';
const GUILD_ID = '1310656642672627752'; // Your Discord server ID

class EmployerSuiteAPI {
  constructor() {
    this.currentUser = null;
    this.authToken = localStorage.getItem('es_auth_token');
  }

  // ============================
  // AUTHENTICATION
  // ============================
  
  async authenticateWithDiscord() {
    // This will be called after Discord OAuth callback
    const token = new URLSearchParams(window.location.search).get('token');
    const user = new URLSearchParams(window.location.search).get('user');
    
    if (token && user) {
      this.authToken = token;
      this.currentUser = JSON.parse(decodeURIComponent(user));
      localStorage.setItem('es_auth_token', token);
      localStorage.setItem('es_user', JSON.stringify(this.currentUser));
      return { success: true, user: this.currentUser };
    }
    
    // Check if user is already logged in
    const storedUser = localStorage.getItem('es_user');
    if (storedUser && this.authToken) {
      this.currentUser = JSON.parse(storedUser);
      return { success: true, user: this.currentUser };
    }
    
    return { success: false };
  }

  logout() {
    localStorage.removeItem('es_auth_token');
    localStorage.removeItem('es_user');
    this.currentUser = null;
    this.authToken = null;
  }

  // ============================
  // STAFF DATABASE
  // ============================
  
  async getAllStaff(includeDetails = true) {
    const response = await fetch(`${TIMECLOCK_API}/employers/staff/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        guildId: GUILD_ID,
        includeDetails
      })
    });
    return await response.json();
  }

  async getStaffMember(userId, includeHistory = true) {
    const response = await fetch(`${TIMECLOCK_API}/employers/staff/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        userId,
        includeHistory
      })
    });
    return await response.json();
  }

  // ============================
  // PAYSLIPS
  // ============================
  
  async getPayslips(userId = null) {
    const response = await fetch(`${TIMECLOCK_API}/employers/payslips/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({ userId })
    });
    return await response.json();
  }

  async addPayslip(userId, period, amount, currency = 'GBP') {
    const response = await fetch(`${TIMECLOCK_API}/employers/payslips/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({ userId, period, amount, currency })
    });
    return await response.json();
  }

  // ============================
  // DISCIPLINARIES
  // ============================
  
  async getDisciplinaries(userId = null, type = null) {
    const response = await fetch(`${TIMECLOCK_API}/employers/disciplinaries/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({ userId, type })
    });
    return await response.json();
  }

  async issueDisciplinary(userId, type, reason, comment, severity, sendNotification = true) {
    const response = await fetch(`${TIMECLOCK_API}/employers/disciplinaries/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({ userId, type, reason, comment, severity, sendNotification })
    });
    return await response.json();
  }

  // ============================
  // REPORTS
  // ============================
  
  async getReports(userId = null, type = null) {
    const response = await fetch(`${TIMECLOCK_API}/employers/reports/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({ userId, type })
    });
    return await response.json();
  }

  async submitReport(userId, type, comment, sendNotification = true) {
    const response = await fetch(`${TIMECLOCK_API}/employers/reports/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        userId,
        type,
        submittedBy: this.currentUser.name,
        comment,
        sendNotification
      })
    });
    return await response.json();
  }

  // ============================
  // REQUESTS
  // ============================
  
  async getRequests(userId = null, status = null) {
    const response = await fetch(`${TIMECLOCK_API}/employers/requests/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({ userId, status })
    });
    return await response.json();
  }

  async approveRequest(requestId, userId, sendNotification = true) {
    const response = await fetch(`${TIMECLOCK_API}/employers/requests/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        requestId,
        userId,
        approverName: this.currentUser.name,
        sendNotification
      })
    });
    return await response.json();
  }

  async rejectRequest(requestId, userId, reason, sendNotification = true) {
    const response = await fetch(`${TIMECLOCK_API}/employers/requests/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        requestId,
        userId,
        rejectorName: this.currentUser.name,
        reason,
        sendNotification
      })
    });
    return await response.json();
  }

  // ============================
  // ABSENCES
  // ============================
  
  async getAbsences(userId = null, status = null) {
    const response = await fetch(`${TIMECLOCK_API}/employers/absences/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({ userId, status })
    });
    return await response.json();
  }

  async approveAbsence(absenceId, userId, sendNotification = true) {
    const response = await fetch(`${TIMECLOCK_API}/employers/absences/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({ absenceId, userId, sendNotification })
    });
    return await response.json();
  }

  async rejectAbsence(absenceId, userId, reason, sendNotification = true) {
    const response = await fetch(`${TIMECLOCK_API}/employers/absences/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({ absenceId, userId, reason, sendNotification })
    });
    return await response.json();
  }

  // ============================
  // USER MANAGEMENT
  // ============================
  
  async suspendUser(userId, reason, rolesRemove, sendNotification = true) {
    const response = await fetch(`${TIMECLOCK_API}/employers/users/suspend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({ userId, reason, rolesRemove, sendNotification })
    });
    return await response.json();
  }

  async unsuspendUser(userId, rolesRestore, sendNotification = true) {
    const response = await fetch(`${TIMECLOCK_API}/employers/users/unsuspend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({ userId, rolesRestore, sendNotification })
    });
    return await response.json();
  }

  async dismissUser(userId, reason, sendNotification = true) {
    const response = await fetch(`${TIMECLOCK_API}/employers/users/dismiss`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        userId,
        reason,
        allDataWipe: true,
        removeAllRoles: true,
        sendNotification
      })
    });
    return await response.json();
  }

  async getDismissedUsers(includeDetails = true) {
    const response = await fetch(`${TIMECLOCK_API}/employers/users/dismissed-list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({ includeDetails })
    });
    return await response.json();
  }

  // ============================
  // DASHBOARD STATS
  // ============================
  
  async getDashboardStats() {
    const response = await fetch(`${TIMECLOCK_API}/employers/dashboard/stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({ guildId: GUILD_ID })
    });
    return await response.json();
  }

  // ============================
  // FILE STORAGE (Local Backend)
  // ============================
  
  async uploadFile(file, folder = 'root') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('userId', this.currentUser.id);

    const response = await fetch(`${CAREERS_API}/api/employersuit/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      },
      body: formData
    });
    return await response.json();
  }

  async getFiles(folder = 'root') {
    const response = await fetch(`${CAREERS_API}/api/employersuit/files/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        userId: this.currentUser.id,
        folder
      })
    });
    return await response.json();
  }

  async deleteFile(fileId) {
    const response = await fetch(`${CAREERS_API}/api/employersuit/files/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        userId: this.currentUser.id,
        fileId
      })
    });
    return await response.json();
  }

  async shareFile(fileId, targetUserIds) {
    const response = await fetch(`${CAREERS_API}/api/employersuit/files/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        userId: this.currentUser.id,
        fileId,
        targetUserIds
      })
    });
    return await response.json();
  }

  async getStorageInfo() {
    const response = await fetch(`${CAREERS_API}/api/employersuit/files/storage-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        userId: this.currentUser.id
      })
    });
    return await response.json();
  }

  // ============================
  // NOTEPAD
  // ============================
  
  async getNotes() {
    const response = await fetch(`${CAREERS_API}/api/employersuit/notes/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        userId: this.currentUser.id
      })
    });
    return await response.json();
  }

  async saveNote(noteId, title, content) {
    const response = await fetch(`${CAREERS_API}/api/employersuit/notes/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        userId: this.currentUser.id,
        noteId,
        title,
        content,
        lastModified: new Date().toISOString()
      })
    });
    return await response.json();
  }

  async deleteNote(noteId) {
    const response = await fetch(`${CAREERS_API}/api/employersuit/notes/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        userId: this.currentUser.id,
        noteId
      })
    });
    return await response.json();
  }

  // ============================
  // CALENDAR/SCHEDULE
  // ============================
  
  async getEvents(startDate, endDate, type = 'all') {
    const response = await fetch(`${CAREERS_API}/api/employersuit/calendar/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        userId: this.currentUser.id,
        startDate,
        endDate,
        type // 'personal', 'shared', or 'all'
      })
    });
    return await response.json();
  }

  async createEvent(eventData) {
    const response = await fetch(`${CAREERS_API}/api/employersuit/calendar/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        ...eventData,
        createdBy: this.currentUser.id,
        createdAt: new Date().toISOString()
      })
    });
    return await response.json();
  }

  async updateEvent(eventId, eventData) {
    const response = await fetch(`${CAREERS_API}/api/employersuit/calendar/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        eventId,
        ...eventData,
        updatedBy: this.currentUser.id,
        updatedAt: new Date().toISOString()
      })
    });
    return await response.json();
  }

  async deleteEvent(eventId) {
    const response = await fetch(`${CAREERS_API}/api/employersuit/calendar/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        userId: this.currentUser.id,
        eventId
      })
    });
    return await response.json();
  }

  // ============================
  // DOCUMENT TEMPLATES
  // ============================
  
  async getTemplates() {
    const response = await fetch(`${CAREERS_API}/api/employersuit/templates/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      }
    });
    return await response.json();
  }

  async generateDocument(documentData) {
    const response = await fetch(`${CAREERS_API}/api/employersuit/documents/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(documentData)
    });
    return await response.json();
  }
}

// Create global instance
const employerAPI = new EmployerSuiteAPI();
