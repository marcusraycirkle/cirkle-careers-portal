// Employer Suite Tabs Management
// Handles rendering and functionality for all dashboard tabs

class EmployerSuiteTabs {
  constructor() {
    this.currentTab = 'home';
    this.currentUser = null;
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  // ============================
  // HOME DASHBOARD
  // ============================
  
  renderHome() {
    const userName = this.currentUser?.username || this.currentUser?.name || this.currentUser?.global_name || 'User';
    const firstName = userName.split(' ')[0];
    
    return `
      <div class="tab-content">
        <div class="home-welcome">
          <h2>Welcome back, ${firstName}! 👋</h2>
          <p>What would you like to do today?</p>
        </div>

        <div class="dashboard-grid">
          <!-- TAB 1: Docs -->
          <div class="dashboard-card" onclick="employerTabs.navigateToTab('docs')">
            <div class="card-icon">📄</div>
            <h3 class="card-title">Documents</h3>
            <p class="card-description">Create official documents from templates: payslips, contracts, dismissals, and more.</p>
            <span class="card-badge">New</span>
          </div>

          <!-- TAB 2: My Files -->
          <div class="dashboard-card" onclick="employerTabs.navigateToTab('files')">
            <div class="card-icon">📁</div>
            <h3 class="card-title">My Files</h3>
            <p class="card-description">Store and manage your company files. Share with other employers securely.</p>
            <span class="card-badge">10GB</span>
          </div>

          <!-- TAB 3: Notepad -->
          <div class="dashboard-card" onclick="employerTabs.navigateToTab('notepad')">
            <div class="card-icon">📝</div>
            <h3 class="card-title">Notepad</h3>
            <p class="card-description">Create and organize notes with markdown support and rich formatting.</p>
          </div>

          <!-- TAB 4: Calendar -->
          <div class="dashboard-card" onclick="employerTabs.navigateToTab('calendar')">
            <div class="card-icon">📅</div>
            <h3 class="card-title">Schedule</h3>
            <p class="card-description">Manage personal and shared calendars. Schedule meetings and track events.</p>
          </div>

          <!-- TAB 5: Database -->
          <div class="dashboard-card" onclick="employerTabs.navigateToTab('database')">
            <div class="card-icon">💾</div>
            <h3 class="card-title">Staff Database</h3>
            <p class="card-description">Complete staff directory with payslips, reports, and management tools.</p>
            <span class="card-badge">Live</span>
          </div>

          <!-- TAB 6: Analytics (Coming Soon) -->
          <div class="dashboard-card" style="opacity: 0.6; cursor: not-allowed;">
            <div class="card-icon">📊</div>
            <h3 class="card-title">Analytics</h3>
            <p class="card-description">Performance metrics, reports, and insights dashboard.</p>
            <span class="card-badge" style="background: var(--text-secondary);">Soon</span>
          </div>
        </div>
      </div>
    `;
  }

  // ============================
  // TAB 1: DOCUMENTS
  // ============================
  
  renderDocs() {
    return `
      <div class="tab-content">
        <div class="tab-header">
          <h2>📄 Document Templates</h2>
          <div class="tab-actions">
            <button class="btn btn-secondary" onclick="employerTabs.navigateToTab('home')">
              ← Back to Home
            </button>
          </div>
        </div>

        <div id="docs-content">
          <div class="docs-categories">
            ${this.renderDocsCategories()}
          </div>
        </div>
      </div>
    `;
  }

  renderDocsCategories() {
    const categories = [
      {
        name: 'Payslips',
        icon: '💰',
        templates: ['Biweekly Payslip'],
        count: 1,
        description: 'Generate employee payslips'
      },
      {
        name: 'Disciplinary',
        icon: '⚠️',
        templates: ['Suspension Notice', 'Dismissal Letter'],
        count: 2,
        description: 'Formal disciplinary documents'
      },
      {
        name: 'General',
        icon: '📄',
        templates: ['Blank Document'],
        count: 1,
        description: 'Blank template for custom documents'
      }
    ];

    return categories.map(category => `
      <div class="docs-category-card">
        <div class="category-header">
          <span class="category-icon">${category.icon}</span>
          <h3>${category.name}</h3>
          <span class="category-count">${category.count} templates</span>
        </div>
        <div class="category-templates">
          ${category.templates.map(template => `
            <button class="template-btn" onclick="employerTabs.openTemplate('${category.name}', '${template}')">
              ${template}
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  openTemplate(category, templateName) {
    showNotification(`Opening ${templateName} template...`, 'info');
    
    // Get template configuration
    const templateConfig = this.getTemplateConfig(templateName);
    if (!templateConfig) {
      showNotification('Template not found', 'error');
      return;
    }

    // Show document form modal
    showModal(`
      <div class="document-form">
        <h2>📄 ${templateName}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">${templateConfig.description}</p>
        
        <form id="template-form" onsubmit="event.preventDefault(); employerTabs.generateDocument('${templateName}')">
          ${this.renderTemplateFields(templateConfig.fields)}
          
          <div class="form-actions" style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button type="submit" class="btn btn-primary" style="flex: 1;">
              Generate Document
            </button>
            <button type="button" class="btn btn-secondary" onclick="hideModal()">
              Cancel
            </button>
          </div>
        </form>
      </div>
    `, 'large');
  }

  getTemplateConfig(templateName) {
    const templates = {
      'Biweekly Payslip': {
        description: 'Generate a biweekly payslip for an employee',
        googleDocUrl: 'https://docs.google.com/document/d/1xVRHQ5vH4pbMpUeEDBKIbGL9TBup7ChHkRYddZ_E6Ek/edit?usp=sharing',
        fields: [
          { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
          { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
          { name: 'payPeriod', label: 'Pay Period', type: 'text', placeholder: 'e.g., Jan 1-15, 2026', required: true },
          { name: 'grossPay', label: 'Gross Pay (£)', type: 'number', step: '0.01', required: true },
          { name: 'deductions', label: 'Deductions (£)', type: 'number', step: '0.01', required: true },
          { name: 'netPay', label: 'Net Pay (£)', type: 'number', step: '0.01', required: true },
          { name: 'hoursWorked', label: 'Hours Worked', type: 'number', step: '0.5', required: false },
          { name: 'overtimeHours', label: 'Overtime Hours', type: 'number', step: '0.5', required: false }
        ]
      },
      'Suspension Notice': {
        description: 'Create a formal suspension notice',
        googleDocUrl: 'https://docs.google.com/document/d/1ndQSg6q9hhtUolTwHRZiV8AuK1JrPBCAOU8U-j3IYr0/edit?usp=sharing',
        fields: [
          { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
          { name: 'employeePosition', label: 'Position', type: 'text', required: true },
          { name: 'suspensionDate', label: 'Suspension Start Date', type: 'date', required: true },
          { name: 'reason', label: 'Reason for Suspension', type: 'textarea', required: true },
          { name: 'investigationDetails', label: 'Investigation Details', type: 'textarea', required: false },
          { name: 'returnDate', label: 'Expected Return Date', type: 'date', required: false },
          { name: 'managerName', label: 'Manager Name', type: 'text', required: true },
          { name: 'todayDate', label: 'Letter Date', type: 'date', required: true }
        ]
      },
      'Dismissal Letter': {
        description: 'Create a formal dismissal/termination letter',
        googleDocUrl: 'https://docs.google.com/document/d/1ndQSg6q9hhtUolTwHRZiV8AuK1JrPBCAOU8U-j3IYr0/edit?usp=sharing',
        fields: [
          { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
          { name: 'employeePosition', label: 'Position', type: 'text', required: true },
          { name: 'terminationDate', label: 'Termination Date', type: 'date', required: true },
          { name: 'reason', label: 'Reason for Dismissal', type: 'textarea', required: true },
          { name: 'finalPayDate', label: 'Final Pay Date', type: 'date', required: false },
          { name: 'propertyReturn', label: 'Company Property to Return', type: 'textarea', required: false },
          { name: 'managerName', label: 'Manager Name', type: 'text', required: true },
          { name: 'todayDate', label: 'Letter Date', type: 'date', required: true }
        ]
      },
      'Blank Document': {
        description: 'Start with a blank template',
        googleDocUrl: 'https://docs.google.com/document/d/15wm-CrohvK3JgEJjItYFd2DpS5uYSk_Iu2h-p7KWpxw/edit?usp=sharing',
        fields: [
          { name: 'documentTitle', label: 'Document Title', type: 'text', required: true },
          { name: 'content', label: 'Content', type: 'textarea', placeholder: 'Enter your document content...', required: true }
        ]
      }
    };

    return templates[templateName];
  }

  renderTemplateFields(fields) {
    return fields.map(field => {
      const required = field.required ? 'required' : '';
      const placeholder = field.placeholder ? `placeholder="${field.placeholder}"` : '';
      
      if (field.type === 'textarea') {
        return `
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
              ${field.label}${field.required ? ' *' : ''}
            </label>
            <textarea 
              name="${field.name}" 
              ${required}
              ${placeholder}
              rows="4"
              style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-family: inherit; resize: vertical;"
            ></textarea>
          </div>
        `;
      }
      
      return `
        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
            ${field.label}${field.required ? ' *' : ''}
          </label>
          <input 
            type="${field.type}" 
            name="${field.name}" 
            ${required}
            ${placeholder}
            ${field.step ? `step="${field.step}"` : ''}
            style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;"
          />
        </div>
      `;
    }).join('');
  }

  async generateDocument(templateName) {
    const form = document.getElementById('template-form');
    if (!form.checkValidity()) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    // Get form data
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    showNotification('Generating document...', 'info');

    try {
      const templateConfig = this.getTemplateConfig(templateName);
      
      // Create document object
      const document = {
        templateName: templateName,
        googleDocUrl: templateConfig.googleDocUrl,
        data: data,
        createdAt: new Date().toISOString(),
        createdBy: this.currentUser?.username || 'Unknown'
      };

      // Save via Cloudflare Worker API
      const result = await employerAPI.generateDocument(document);
      
      if (!result || !result.success) {
        throw new Error(result?.error || 'Failed to generate document');
      }
      
      hideModal();
      showNotification('Document generated successfully!', 'success');
      
      // Show document preview/download modal
      showModal(`
        <div class="document-result" style="text-align: center;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
          <h2>Document Generated!</h2>
          <p style="color: var(--text-secondary); margin: 1rem 0;">${templateName} has been created successfully.</p>
          
          <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
            <h3 style="margin-bottom: 1rem;">Document Details</h3>
            ${this.renderDocumentSummary(data)}
          </div>

          <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <a href="${templateConfig.googleDocUrl}" target="_blank" class="btn btn-primary" style="flex: 1; text-decoration: none;">
              📄 Open Template
            </a>
            <button class="btn btn-secondary" onclick="hideModal()" style="flex: 1;">
              Done
            </button>
          </div>
          
          <p style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 1rem;">
            💡 Tip: Open the Google Doc template and fill in the fields with the information above.
          </p>
        </div>
      `);
      
    } catch (error) {
      console.error('Document generation error:', error);
      showNotification('Failed to generate document. Please try again.', 'error');
    }
  }

  renderDocumentSummary(data) {
    return Object.entries(data)
      .map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `
          <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">
            <span style="font-weight: 500;">${label}:</span>
            <span>${value}</span>
          </div>
        `;
      })
      .join('');
  }

  // ============================
  // TAB 2: MY FILES
  // ============================
  
  async renderFiles() {
    let storageInfo = { used: 0, total: 10737418240 }; // 10GB limit
    let files = { files: [] };
    
    // Fetch real data from storage server
    try {
      const storageData = await employerAPI.getStorageInfo();
      if (storageData && !storageData.error) {
        storageInfo.used = storageData.used || 0;
        storageInfo.total = storageData.total || 10737418240;
      }
      
      const fileList = await employerAPI.getFiles();
      if (fileList && !fileList.error) {
        files.files = fileList.files || [];
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }

    const usedGB = (storageInfo.used / (1024 * 1024 * 1024)).toFixed(2);
    const totalGB = (storageInfo.total / (1024 * 1024 * 1024)).toFixed(2);
    const percentage = ((storageInfo.used / storageInfo.total) * 100).toFixed(1);

    return `
      <div class="tab-content">
        <div class="tab-header">
          <h2>📁 My Files</h2>
          <div class="tab-actions">
            <button class="btn btn-primary" onclick="employerTabs.uploadFile()">
              ⬆️ Upload Files
            </button>
            <button class="btn btn-secondary" onclick="employerTabs.navigateToTab('home')">
              ← Back
            </button>
          </div>
        </div>

        <!-- Storage Info -->
        <div class="storage-info mb-4" style="background:#f8f9fa; padding:1rem; border-radius:8px;">
          <div class="storage-header" style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <span>Storage Used: ${usedGB} GB / ${totalGB} GB</span>
            <span>${percentage}%</span>
          </div>
          <div class="storage-bar" style="background:#dee2e6; height:8px; border-radius:4px; overflow:hidden;">
            <div class="storage-progress" style="width: ${percentage}%; height:100%; background:#007aff;"></div>
          </div>
        </div>

        <!-- File Browser -->
        <div class="files-container">
          <div id="files-grid" class="files-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:1rem;">
            ${this.renderFilesGrid(files.files || [])}
          </div>
        </div>
      </div>
    `;
  }

  renderFilesGrid(files) {
    if (files.length === 0) {
      return `
        <div class="empty-state" style="text-align:center; padding:3rem; color:#6e6e73;">
          <div class="empty-icon" style="font-size:4rem; margin-bottom:1rem;">📁</div>
          <h3>No files yet</h3>
          <p>Your files will appear here once the storage server is configured.</p>
        </div>
      `;
    }

    return files.map(file => `
      <div class="file-card" onclick="employerTabs.openFile('${file.id}')">
        <div class="file-icon">${this.getFileIcon(file.type)}</div>
        <div class="file-name">${file.name}</div>
        <div class="file-meta">
          <span>${this.formatFileSize(file.size)}</span>
          <span>${new Date(file.uploadedAt).toLocaleDateString()}</span>
        </div>
        <div class="file-actions">
          <button onclick="event.stopPropagation(); employerTabs.shareFile('${file.id}')" title="Share">
            🔗
          </button>
          <button onclick="event.stopPropagation(); employerTabs.downloadFile('${file.id}')" title="Download">
            ⬇️
          </button>
          <button onclick="event.stopPropagation(); employerTabs.deleteFile('${file.id}')" title="Delete" class="danger">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  }

  getFileIcon(type) {
    const icons = {
      'folder': '📁',
      'pdf': '📄',
      'doc': '📝',
      'docx': '📝',
      'xls': '📊',
      'xlsx': '📊',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️',
      'gif': '🖼️',
      'mp4': '🎥',
      'zip': '📦'
    };
    return icons[type] || '📄';
  }

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }

  uploadFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      
      showNotification(`Uploading ${files.length} file(s)...`, 'info');
      
      try {
        let successCount = 0;
        for (const file of files) {
          const result = await employerAPI.uploadFile(file);
          if (result && result.success) {
            successCount++;
          }
        }
        
        showNotification(`${successCount} file(s) uploaded successfully!`, 'success');
        // Reload the files tab to show new uploads
        await this.navigateToTab('files');
      } catch (error) {
        console.error('Upload error:', error);
        showNotification('Upload failed. Please try again.', 'error');
      }
    };
    input.click();
  }

  // ============================
  // TAB 3: NOTEPAD
  // ============================
  
  async renderNotepad() {
    // Fetch actual notes from storage
    let notes = { notes: [] };
    
    try {
      const noteList = await employerAPI.getNotes();
      if (noteList && !noteList.error) {
        notes = noteList;
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }

    return `
      <div class="tab-content">
        <div class="tab-header">
          <h2>📝 Notepad</h2>
          <div class="tab-actions">
            <button class="btn btn-primary" onclick="employerTabs.createNote()">
              ➕ New Note
            </button>
            <button class="btn btn-secondary" onclick="employerTabs.navigateToTab('home')">
              ← Back
            </button>
          </div>
        </div>

        <div class="notepad-container" style="display:grid; grid-template-columns:250px 1fr; gap:1.5rem; min-height:500px;">
          <div class="notes-sidebar" style="background:#f8f9fa; border-radius:8px; padding:1rem;">
            <div class="notes-list">
              ${this.renderNotesList(notes.notes || [])}
            </div>
          </div>

          <div class="note-editor" id="note-editor">
            <div class="empty-state" style="text-align:center; padding:3rem; color:#6e6e73;">
              <div class="empty-icon" style="font-size:4rem; margin-bottom:1rem;">📝</div>
              <h3>No note selected</h3>
              <p>Select a note from the sidebar or create a new one to get started.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderNotesList(notes) {
    // Handle if notes is not an array or is undefined
    if (!Array.isArray(notes) || notes.length === 0) {
      return '<div class="empty-notes" style="padding:2rem; text-align:center; color:#6e6e73;">No notes yet</div>';
    }

    return notes.map(note => `
      <div class="note-item" onclick="employerTabs.openNote('${note.id}')">
        <div class="note-title">${note.title || 'Untitled'}</div>
        <div class="note-preview">${note.content.substring(0, 50)}...</div>
        <div class="note-date">${new Date(note.lastModified).toLocaleString()}</div>
      </div>
    `).join('');
  }

  createNewNote() {
    const noteId = Date.now().toString();
    this.openNoteEditor(noteId, '', '');
  }

  async openNote(noteId) {
    const notes = await employerAPI.getNotes();
    const note = notes.notes.find(n => n.id === noteId);
    if (note) {
      this.openNoteEditor(noteId, note.title, note.content);
    }
  }

  openNoteEditor(noteId, title, content) {
    document.getElementById('note-editor').innerHTML = `
      <div class="note-editor-header">
        <input type="text" id="note-title" class="note-title-input" placeholder="Note Title" value="${title}">
        <div class="editor-actions">
          <button class="btn btn-secondary" onclick="employerTabs.deleteNote('${noteId}')">Delete</button>
          <button class="btn btn-success" onclick="employerTabs.saveNote('${noteId}')">Save</button>
        </div>
      </div>
      
      <div class="editor-toolbar">
        <button onclick="employerTabs.formatText('bold')" title="Bold"><strong>B</strong></button>
        <button onclick="employerTabs.formatText('italic')" title="Italic"><em>I</em></button>
        <button onclick="employerTabs.formatText('underline')" title="Underline"><u>U</u></button>
        <span class="toolbar-divider"></span>
        <button onclick="employerTabs.formatText('h1')" title="Heading 1">H1</button>
        <button onclick="employerTabs.formatText('h2')" title="Heading 2">H2</button>
        <button onclick="employerTabs.formatText('h3')" title="Heading 3">H3</button>
        <span class="toolbar-divider"></span>
        <button onclick="employerTabs.formatText('ul')" title="Bullet List">• List</button>
        <button onclick="employerTabs.formatText('ol')" title="Numbered List">1. List</button>
        <button onclick="employerTabs.formatText('code')" title="Code"><>Code</button>
      </div>
      
      <textarea id="note-content" class="note-content-textarea" placeholder="Start typing...">${content}</textarea>
      
      <div class="note-preview-pane">
        <h4>Preview</h4>
        <div id="note-preview" class="markdown-preview"></div>
      </div>
    `;

    // Auto-update preview
    document.getElementById('note-content').addEventListener('input', (e) => {
      this.updatePreview(e.target.value);
    });

    // Initial preview
    this.updatePreview(content);
  }

  updatePreview(markdown) {
    if (typeof marked !== 'undefined') {
      document.getElementById('note-preview').innerHTML = marked.parse(markdown);
    }
  }

  async saveNote(noteId) {
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;
    
    await employerAPI.saveNote(noteId, title, content);
    showNotification('Note saved!', 'success');
    this.navigateToTab('notepad');
  }

  // ============================
  // TAB 4: CALENDAR/SCHEDULE
  // ============================
  
  async renderCalendar() {
    this.currentMonth = this.currentMonth || new Date().getMonth();
    this.currentYear = this.currentYear || new Date().getFullYear();
    this.showingSharedCalendar = this.showingSharedCalendar || false;
    
    return `
      <div class="tab-content">
        <div class="tab-header">
          <h2>📅 Schedule & Calendar</h2>
          <div class="tab-actions">
            <button class="btn btn-primary" onclick="employerTabs.createEvent()">
              ➕ Add Event
            </button>
            <button class="btn btn-secondary" onclick="employerTabs.toggleCalendarView()">
              ${this.showingSharedCalendar ? '👤 My Calendar' : '👥 Shared Calendar'}
            </button>
            <button class="btn btn-secondary" onclick="employerTabs.navigateToTab('home')">
              ← Back
            </button>
          </div>
        </div>

        <div class="calendar-container" style="display:grid; grid-template-columns:300px 1fr; gap:1.5rem;">
          <div class="calendar-sidebar" style="background:#f8f9fa; border-radius:8px; padding:1.5rem;">
            <h4 style="margin-bottom:1rem;">Event Types</h4>
            <div class="legend-item" style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.75rem;">
              <span class="legend-color" style="width:16px; height:16px; border-radius:4px; background:#34c759;"></span>
              <span>Common</span>
            </div>
            <div class="legend-item" style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.75rem;">
              <span class="legend-color" style="width:16px; height:16px; border-radius:4px; background:#ffcc00;"></span>
              <span>Important</span>
            </div>
            <div class="legend-item" style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.75rem;">
              <span class="legend-color" style="width:16px; height:16px; border-radius:4px; background:#ff9500;"></span>
              <span>High Priority</span>
            </div>
            <div class="legend-item" style="display:flex; align-items:center; gap:0.5rem;">
              <span class="legend-color" style="width:16px; height:16px; border-radius:4px; background:#ff3b30;"></span>
              <span>Urgent</span>
            </div>
            
            <div style="margin-top:2rem; padding-top:1.5rem; border-top:1px solid #dee2e6;">
              <h4 style="margin-bottom:1rem; font-size:0.9rem;">Quick Navigation</h4>
              <button class="btn btn-secondary" style="width:100%; margin-bottom:0.5rem;" onclick="employerTabs.goToToday()">📍 Today</button>
            </div>
          </div>

          <div class="calendar-main" style="background:white; border-radius:8px; padding:1.5rem;">
            <div class="calendar-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
              <button class="btn btn-secondary" onclick="employerTabs.previousMonth()">←</button>
              <h3 id="calendar-month-year" style="margin:0;">${this.getMonthYearString()}</h3>
              <button class="btn btn-secondary" onclick="employerTabs.nextMonth()">→</button>
            </div>
            
            <div id="calendar-grid" style="display:grid; grid-template-columns:repeat(7, 1fr); gap:0.5rem;">
              ${this.renderCalendarGrid()}
            </div>
          </div>
        </div>
        
        <div style="margin-top:1.5rem; background:white; border-radius:8px; padding:1.5rem;">
          <h3 style="margin-bottom:1rem;">Upcoming Events</h3>
          <div id="upcoming-events-list">
            ${this.renderUpcomingEvents()}
          </div>
        </div>
      </div>
    `;
  }
  
  getMonthYearString() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[this.currentMonth]} ${this.currentYear}`;
  }
  
  renderCalendarGrid() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const today = new Date();
    
    let html = '';
    
    // Day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
      html += `<div style="text-align:center; font-weight:600; padding:0.5rem; color:#6e6e73;">${day}</div>`;
    });
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      html += `<div style="min-height:80px; background:#f8f9fa; border-radius:8px;"></div>`;
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getDate() === day && today.getMonth() === this.currentMonth && today.getFullYear() === this.currentYear;
      const bgColor = isToday ? '#007aff' : 'white';
      const textColor = isToday ? 'white' : '#000';
      
      html += `
        <div style="min-height:80px; background:${bgColor}; color:${textColor}; border:1px solid #e5e5ea; border-radius:8px; padding:0.5rem; cursor:pointer; transition:all 0.2s;" 
             onmouseover="this.style.background='#f8f9fa'" 
             onmouseout="this.style.background='${bgColor}'" 
             onclick="employerTabs.selectDate(${day})">
          <div style="font-weight:600;">${day}</div>
        </div>
      `;
    }
    
    return html;
  }
  
  renderUpcomingEvents() {
    return `
      <div style="text-align:center; padding:2rem; color:#6e6e73;">
        <div style="font-size:2rem; margin-bottom:0.5rem;">📅</div>
        <p>No upcoming events</p>
        <p style="font-size:0.9rem; margin-top:0.5rem;">Events will sync with Firebase when backend is connected</p>
      </div>
    `;
  }
  
  toggleCalendarView() {
    this.showingSharedCalendar = !this.showingSharedCalendar;
    this.navigateToTab('calendar');
  }
  
  previousMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.navigateToTab('calendar');
  }
  
  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.navigateToTab('calendar');
  }
  
  goToToday() {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.navigateToTab('calendar');
  }
  
  selectDate(day) {
    showNotification(`Selected ${this.getMonthYearString()} ${day}`, 'info');
  }

  createEvent() {
    showModal(`
      <h2>📅 Create New Event</h2>
      <form id="event-form" class="modal-form">
        <div class="form-group">
          <label>Event Type</label>
          <select id="event-type" class="form-control" style="width:100%; padding:0.75rem; border:2px solid #d1d1d6; border-radius:10px;">
            <option value="meeting">Meeting</option>
            <option value="conference">Conference</option>
            <option value="collaboration">Collaboration Time</option>
            <option value="training">Training</option>
            <option value="review">Review</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label>Title *</label>
          <input type="text" id="event-title" class="form-control" required style="width:100%; padding:0.75rem; border:2px solid #d1d1d6; border-radius:10px;">
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea id="event-description" class="form-control" rows="3" style="width:100%; padding:0.75rem; border:2px solid #d1d1d6; border-radius:10px; font-family:inherit; resize:vertical;"></textarea>
        </div>

        <div class="form-group">
          <label>Date *</label>
          <input type="date" id="event-date" class="form-control" required style="width:100%; padding:0.75rem; border:2px solid #d1d1d6; border-radius:10px;">
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" id="event-all-day"> All Day Event
          </label>
        </div>

        <div class="form-row" id="time-inputs" style="display:flex; gap:1rem;">
          <div class="form-group" style="flex:1;">
            <label>Start Time</label>
            <input type="time" id="event-start" class="form-control" style="width:100%; padding:0.75rem; border:2px solid #d1d1d6; border-radius:10px;">
          </div>
          <div class="form-group" style="flex:1;">
            <label>End Time</label>
            <input type="time" id="event-end" class="form-control" style="width:100%; padding:0.75rem; border:2px solid #d1d1d6; border-radius:10px;">
          </div>
        </div>

        <div class="form-group">
          <label>Importance</label>
          <select id="event-importance" class="form-control" style="width:100%; padding:0.75rem; border:2px solid #d1d1d6; border-radius:10px;">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" id="event-shared"> Share with other employers
          </label>
        </div>

        <div class="form-group" id="share-with-group" style="display: none;">
          <label>Share With</label>
          <div id="employer-list" class="checkbox-list">Loading employers...</div>
        </div>

        <div class="form-actions" style="display:flex; gap:1rem; margin-top:2rem; padding-top:1.5rem; border-top:2px solid #d1d1d6;">
          <button type="button" class="btn btn-secondary" onclick="hideModal()" style="flex:1;">Cancel</button>
          <button type="submit" class="btn btn-primary" style="flex:1;">Create Event</button>
        </div>
      </form>
    `, 'large');

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('event-date').value = today;

    // Handle all-day checkbox
    const allDayCheckbox = document.getElementById('event-all-day');
    const timeInputs = document.getElementById('time-inputs');
    if (allDayCheckbox && timeInputs) {
      allDayCheckbox.addEventListener('change', (e) => {
        timeInputs.style.display = e.target.checked ? 'none' : 'flex';
      });
    }

    // Handle shared checkbox
    const sharedCheckbox = document.getElementById('event-shared');
    const shareWithGroup = document.getElementById('share-with-group');
    if (sharedCheckbox && shareWithGroup) {
      sharedCheckbox.addEventListener('change', (e) => {
        shareWithGroup.style.display = e.target.checked ? 'block' : 'none';
      });
    }

    // Form submission
    const eventForm = document.getElementById('event-form');
    if (eventForm) {
      eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.submitEvent();
      });
    }
  }

  async submitEvent() {
    try {
      const eventData = {
        type: document.getElementById('event-type').value,
        title: document.getElementById('event-title').value,
        description: document.getElementById('event-description').value,
        date: document.getElementById('event-date').value,
        allDay: document.getElementById('event-all-day').checked,
        startTime: document.getElementById('event-start').value,
        endTime: document.getElementById('event-end').value,
        importance: document.getElementById('event-importance').value,
        shared: document.getElementById('event-shared').checked
      };

      showNotification('Creating event...', 'info');

      const result = await employerAPI.createEvent(eventData);
      
      if (result && result.success) {
        showNotification('Event created successfully!', 'success');
        hideModal();
        this.navigateToTab('calendar');
      } else {
        showNotification(result?.error || 'Failed to create event', 'error');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      showNotification('Failed to create event. Please try again.', 'error');
    }
  }

  // ============================
  // TAB 5: STAFF DATABASE
  // ============================
  
  async renderDatabase() {
    let staff = { count: 0, staff: [] };
    let errorMessage = null;
    
    // Call TimeClock backend to get staff
    try {
      staff = await employerAPI.getAllStaff(true);
      if (staff && staff.success) {
        errorMessage = null;
      } else {
        errorMessage = 'Failed to load staff data';
      }
    } catch (error) {
      console.error('Staff database error:', error);
      errorMessage = 'TimeClock Backend Connection Error';
    }

    return `
      <div class="tab-content">
        <div class="tab-header">
          <h2>💾 Staff Database</h2>
          <div class="tab-actions">
            <input type="text" id="staff-search" placeholder="Search staff..." class="search-input" style="padding:0.6rem 1rem; border:1px solid #d1d1d6; border-radius:8px; width:250px;">
            <button class="btn btn-primary" onclick="employerTabs.syncDatabase()">
              🔄 Sync
            </button>
            <button class="btn btn-secondary" onclick="employerTabs.navigateToTab('home')">
              ← Back
            </button>
          </div>
        </div>

        ${errorMessage ? `
          <div class="alert alert-info" style="background:#d1ecf1; border:1px solid #0dcaf0; padding:1rem; border-radius:8px; margin-bottom:1.5rem;">
            <strong>ℹ️ ${errorMessage}</strong>
            <p style="margin:0.5rem 0 0 0;">The staff database will sync with the TimeClock backend when available.</p>
          </div>
        ` : ''}

        <div class="database-stats mb-4" style="margin-bottom:1.5rem;">
          ${this.renderDatabaseStats(staff)}
        </div>

        <div class="staff-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:1.5rem;">
          ${this.renderStaffGrid(staff.staff || [])}
        </div>
      </div>
    `;
  }

  renderDatabaseStats(staff) {
    const total = staff.count || 0;
    const active = staff.staff?.filter(s => s.profile.status === 'Active').length || 0;
    const suspended = staff.staff?.filter(s => s.suspended).length || 0;

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${total}</div>
          <div class="stat-label">Total Staff</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--success)">${active}</div>
          <div class="stat-label">Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: var(--warning)">${suspended}</div>
          <div class="stat-label">Suspended</div>
        </div>
      </div>
    `;
  }

  renderStaffGrid(staff) {
    if (staff.length === 0) {
      return `
        <div class="empty-state" style="text-align:center; padding:3rem; color:#6e6e73; grid-column:1/-1;">
          <div class="empty-icon" style="font-size:4rem; margin-bottom:1rem;">💾</div>
          <h3>No staff members found</h3>
          <p>Click Sync to load staff information from TimeClock</p>
        </div>
      `;
    }

    return staff.map(member => `
      <div class="staff-card" onclick="employerTabs.openStaffProfile('${member.userId}')">
        <div class="staff-avatar">
          <img src="${member.avatar}" alt="${member.name}">
          ${member.suspended ? '<div class="status-badge suspended">Suspended</div>' : ''}
        </div>
        <div class="staff-info">
          <h3>${member.name}</h3>
          <p class="staff-department">${member.profile.department}</p>
          <p class="staff-id">${member.profile.staffId}</p>
        </div>
        <div class="staff-stats">
          <div class="stat-item">
            <span class="stat-label">Payslips</span>
            <span class="stat-value">${member.stats.payslips}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Reports</span>
            <span class="stat-value">${member.stats.reports}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  async openStaffProfile(userId) {
    const staff = await employerAPI.getStaffMember(userId, true);
    
    showModal(`
      <div class="staff-profile">
        <div class="profile-header">
          <img src="${staff.staff.avatar}" alt="${staff.staff.name}" class="profile-avatar-large">
          <div>
            <h2>${staff.staff.name}</h2>
            <p>${staff.staff.profile.department} • ${staff.staff.profile.staffId}</p>
            <p>${staff.staff.discordTag}</p>
          </div>
        </div>

        <div class="profile-tabs">
          <button class="tab-btn active" onclick="employerTabs.switchProfileTab('overview')">Overview</button>
          <button class="tab-btn" onclick="employerTabs.switchProfileTab('payslips')">Payslips (${staff.staff.payslips?.length || 0})</button>
          <button class="tab-btn" onclick="employerTabs.switchProfileTab('disciplinaries')">Disciplinaries (${staff.staff.disciplinaries?.length || 0})</button>
          <button class="tab-btn" onclick="employerTabs.switchProfileTab('reports')">Reports (${staff.staff.reports?.length || 0})</button>
        </div>

        <div id="profile-tab-content">
          ${this.renderProfileOverview(staff.staff)}
        </div>

        <div class="profile-actions mt-4">
          ${staff.staff.suspended ? 
            `<button class="btn btn-success" onclick="employerTabs.unsuspendUser('${userId}')">Unsuspend User</button>` :
            `<button class="btn btn-warning" onclick="employerTabs.suspendUser('${userId}')">Suspend User</button>`
          }
          <button class="btn btn-danger" onclick="employerTabs.dismissUser('${userId}')">Dismiss User</button>
        </div>
      </div>
    `, true);
  }

  renderProfileOverview(staff) {
    return `
      <div class="profile-overview">
        <div class="info-grid">
          <div class="info-item">
            <strong>Email:</strong> ${staff.profile.email}
          </div>
          <div class="info-item">
            <strong>Department:</strong> ${staff.profile.department}
          </div>
          <div class="info-item">
            <strong>Base Level:</strong> ${staff.profile.baseLevel}
          </div>
          <div class="info-item">
            <strong>Status:</strong> ${staff.profile.status}
          </div>
          <div class="info-item">
            <strong>Timezone:</strong> ${staff.profile.timezone}
          </div>
          <div class="info-item">
            <strong>Country:</strong> ${staff.profile.country}
          </div>
        </div>

        <div class="roles-section mt-3">
          <h4>Discord Roles</h4>
          <div class="roles-list">
            ${staff.roles.map(role => `<span class="role-badge">${role}</span>`).join('')}
          </div>
        </div>

        <div class="last-login mt-3">
          <strong>Last Login:</strong> ${new Date(staff.lastLogin).toLocaleString()}
        </div>
      </div>
    `;
  }

  async suspendUser(userId) {
    showModal(`
      <h2>⚠️ Suspend User</h2>
      <p>Please provide a reason for suspension:</p>
      <textarea id="suspend-reason" class="form-control" rows="3" placeholder="Reason for suspension..."></textarea>
      <div class="form-actions mt-3">
        <button class="btn btn-secondary" onclick="hideModal()">Cancel</button>
        <button class="btn btn-warning" onclick="employerTabs.confirmSuspend('${userId}')">Confirm Suspension</button>
      </div>
    `);
  }

  async confirmSuspend(userId) {
    const reason = document.getElementById('suspend-reason').value;
    if (!reason) {
      showNotification('Please provide a reason', 'error');
      return;
    }

    const result = await employerAPI.suspendUser(userId, reason, ['@Staff'], true);
    if (result.success) {
      showNotification('User suspended successfully', 'success');
      hideModal();
      this.navigateToTab('database');
    }
  }

  async dismissUser(userId) {
    showModal(`
      <h2>🚫 Dismiss User</h2>
      <p class="danger-text">This action will permanently remove the user from all systems. Are you sure?</p>
      <textarea id="dismiss-reason" class="form-control" rows="3" placeholder="Reason for dismissal..."></textarea>
      <div class="form-actions mt-3">
        <button class="btn btn-secondary" onclick="hideModal()">Cancel</button>
        <button class="btn btn-danger" onclick="employerTabs.confirmDismiss('${userId}')">Confirm Dismissal</button>
      </div>
    `);
  }

  async confirmDismiss(userId) {
    const reason = document.getElementById('dismiss-reason').value;
    if (!reason) {
      showNotification('Please provide a reason', 'error');
      return;
    }

    const result = await employerAPI.dismissUser(userId, reason, true);
    if (result.success) {
      showNotification('User dismissed successfully', 'success');
      hideModal();
      this.navigateToTab('database');
    }
  }

  async syncDatabase() {
    showNotification('Syncing staff database...', 'info');
    try {
      await this.navigateToTab('database');
      showNotification('Database synced successfully', 'success');
    } catch (error) {
      showNotification('Failed to sync database', 'error');
    }
  }

  // ============================
  // FILE OPERATIONS
  // ============================
  
  createNote() {
    const noteId = 'note_' + Date.now();
    this.openNoteEditor(noteId, '', '');
  }

  formatText(format) {
    const textarea = document.getElementById('note-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let formattedText = selectedText;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'h1':
        formattedText = `# ${selectedText}`;
        break;
      case 'h2':
        formattedText = `## ${selectedText}`;
        break;
      case 'h3':
        formattedText = `### ${selectedText}`;
        break;
      case 'ul':
        formattedText = `- ${selectedText}`;
        break;
      case 'ol':
        formattedText = `1. ${selectedText}`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
    }

    textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    this.updatePreview(textarea.value);
  }

  async deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
      await employerAPI.deleteNote(noteId);
      showNotification('Note deleted', 'success');
      this.navigateToTab('notepad');
    }
  }

  createFolder() {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      showNotification('Creating folder: ' + folderName, 'info');
      // TODO: Implement folder creation API call
      setTimeout(() => {
        showNotification('Folder created successfully', 'success');
        this.navigateToTab('files');
      }, 500);
    }
  }

  async openFile(fileId) {
    showNotification('Opening file...', 'info');
    // TODO: Implement file viewing/downloading
  }

  async shareFile(fileId) {
    showModal(`
      <h2>Share File</h2>
      <p>Select employers to share this file with:</p>
      <div id="share-employer-list" class="checkbox-list">
        <p>Loading employers...</p>
      </div>
      <div class="form-actions mt-3">
        <button class="btn btn-secondary" onclick="hideModal()">Cancel</button>
        <button class="btn btn-primary" onclick="employerTabs.confirmShareFile('${fileId}')">Share</button>
      </div>
    `);
  }

  async downloadFile(fileId) {
    showNotification('Downloading file...', 'info');
    // TODO: Implement file download
  }

  async deleteFile(fileId) {
    if (confirm('Are you sure you want to delete this file?')) {
      await employerAPI.deleteFile(fileId);
      showNotification('File deleted', 'success');
      this.navigateToTab('files');
    }
  }

  async confirmShareFile(fileId) {
    showNotification('File shared successfully', 'success');
    hideModal();
  }

  // ============================
  // NAVIGATION
  // ============================
  
  async navigateToTab(tabName) {
    this.currentTab = tabName;
    
    // Wait for element to be available and visible (DOM might still be loading)
    let content = document.getElementById('main-content');
    let retries = 0;
    const maxRetries = 20; // Increase retries for embedded mode
    
    while ((!content || content.offsetParent === null) && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 100));
      content = document.getElementById('main-content');
      retries++;
    }
    
    if (!content) {
      console.error('[Employer Suite] main-content element not found after waiting');
      return;
    }
    
    if (content.offsetParent === null) {
      console.warn('[Employer Suite] main-content element exists but is not visible');
      // Try to make parent visible if it's hidden
      const dashboard = document.getElementById('dashboard');
      if (dashboard) {
        dashboard.classList.remove('hidden');
        dashboard.style.display = 'block';
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    // Show loading
    content.innerHTML = '<div class="loading-screen"><div class="spinner"></div></div>';

    // Render appropriate tab
    let html = '';
    switch (tabName) {
      case 'home':
        html = this.renderHome();
        break;
      case 'docs':
        html = this.renderDocs();
        break;
      case 'files':
        html = await this.renderFiles();
        break;
      case 'notepad':
        html = await this.renderNotepad();
        break;
      case 'calendar':
        html = await this.renderCalendar();
        break;
      case 'database':
        html = await this.renderDatabase();
        break;
      default:
        html = this.renderHome();
    }

    content.innerHTML = html;
  }
}

// Create global instance
const employerTabs = new EmployerSuiteTabs();

// Utility Functions
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.remove('hidden');

  setTimeout(() => {
    notification.classList.add('hidden');
  }, 4000);
}

function showModal(content, large = false) {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal');
  
  modal.innerHTML = `
    <button class="modal-close" onclick="hideModal()">×</button>
    ${content}
  `;
  
  if (large) {
    modal.style.maxWidth = '1200px';
  } else {
    modal.style.maxWidth = '800px';
  }
  
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
}

function hideModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal').classList.add('hidden');
}
