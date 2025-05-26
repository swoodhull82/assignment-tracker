/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

type AssignmentStatus = 'Pending' | 'In Progress' | 'Completed';
type DisplayStatus = AssignmentStatus | 'Overdue';

interface Assignment {
  id: string;
  title: string;
  assignee: string; // Keep internal name 'assignee' for simplicity
  type: 'MDL' | 'SOP Review' | 'Internal Audit' | 'DOC';
  dueDate: string; 
  status: AssignmentStatus;
}

const TEAM_MEMBERS_KEY = 'teamMembersList';
const DEFAULT_TEAM_MEMBERS = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
let teamMembers: string[] = [];

const LOCAL_STORAGE_KEY = 'teamAssignments';
let assignments: Assignment[] = [];

const DOMElements = {
  form: document.getElementById('new-assignment-form') as HTMLFormElement,
  titleInput: document.getElementById('assignment-title') as HTMLInputElement,
  assigneeSelect: document.getElementById('assignment-assignee') as HTMLSelectElement,
  typeSelect: document.getElementById('assignment-type') as HTMLSelectElement,
  dueDateInput: document.getElementById('assignment-due-date') as HTMLInputElement,
  listContainer: document.getElementById('assignment-list') as HTMLDivElement,
  filterStatusSelect: document.getElementById('filter-status') as HTMLSelectElement,
  sortBySelect: document.getElementById('sort-by') as HTMLSelectElement,
  emptyStateMessage: document.querySelector('#assignment-list .empty-state') as HTMLParagraphElement,
  newAssigneeNameInput: document.getElementById('new-assignee-name') as HTMLInputElement,
  addAssigneeButton: document.getElementById('add-assignee-button') as HTMLButtonElement,
  addAssigneeMessageArea: document.getElementById('add-assignee-message-area') as HTMLDivElement,
  mainNav: document.getElementById('main-nav') as HTMLElement,
  pageDashboard: document.getElementById('page-dashboard') as HTMLDivElement,
  pageCalendar: document.getElementById('page-calendar') as HTMLDivElement,
  pageReminders: document.getElementById('page-reminders') as HTMLDivElement,
  pageProjects: document.getElementById('page-projects') as HTMLDivElement,
  pageDocuments: document.getElementById('page-documents') as HTMLDivElement,
  pageSettings: document.getElementById('page-settings') as HTMLDivElement,
  // It's often better to query all page contents and nav links dynamically in the function
  // but if direct access to specific ones is needed often, they can be listed here.
  taskCompletionChart: document.getElementById('taskCompletionChart') as HTMLCanvasElement,
  tasksLeftPerPersonChart: document.getElementById('tasksLeftPerPersonChart') as HTMLCanvasElement,
};

declare const Chart: any; // Declare Chart.js global

let taskCompletionChartInstance: any = null;
let tasksLeftPerPersonChartInstance: any = null;

function saveAssignments(): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(assignments));
}

function saveTeamMembers(): void {
  localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(teamMembers));
}

function loadTeamMembers(): void {
  const storedMembers = localStorage.getItem(TEAM_MEMBERS_KEY);
  if (storedMembers) {
    teamMembers = JSON.parse(storedMembers);
  } else {
    teamMembers = [...DEFAULT_TEAM_MEMBERS];
  }
  if (!teamMembers || teamMembers.length === 0) {
      teamMembers = [...DEFAULT_TEAM_MEMBERS];
  }
}

function loadAssignments(): void {
  const storedAssignments = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedAssignments) {
    assignments = JSON.parse(storedAssignments);
  }
}

function getDisplayStatus(assignment: Assignment): DisplayStatus {
  if (assignment.status !== 'Completed' && new Date(assignment.dueDate) < new Date(new Date().setHours(0,0,0,0))) {
    return 'Overdue';
  }
  return assignment.status;
}

function populateAssigneeDropdown(): void {
    if (!DOMElements.assigneeSelect) return;
    DOMElements.assigneeSelect.innerHTML = ''; 
    teamMembers.forEach(member => {
      const option = document.createElement('option');
      option.value = member;
      option.textContent = member;
      DOMElements.assigneeSelect.appendChild(option);
    });
}

function renderAssignments(): void {
  if (!DOMElements.listContainer) return;
  DOMElements.listContainer.innerHTML = ''; 
  const filterStatus = DOMElements.filterStatusSelect.value;
  const sortBy = DOMElements.sortBySelect.value;
  let filteredAssignments = assignments.filter(assignment => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'Overdue') return getDisplayStatus(assignment) === 'Overdue';
    return assignment.status === filterStatus;
  });
  filteredAssignments.sort((a, b) => {
    switch (sortBy) {
      case 'dueDate': return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'dueDateDesc': return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      case 'title': return a.title.localeCompare(b.title);
      case 'assignee': return a.assignee.localeCompare(b.assignee);
      default: return 0;
    }
  });
  if (filteredAssignments.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty-state';
    p.textContent = 'No assignments match your filters. Try adjusting them or add a new assignment!';
    DOMElements.listContainer.appendChild(p);
    return;
  }
  filteredAssignments.forEach(assignment => {
    const card = document.createElement('div');
    card.className = 'assignment-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-labelledby', `assignment-title-${assignment.id}`);
    const displayStatus = getDisplayStatus(assignment);
    const statusClass = displayStatus.toLowerCase().replace(' ', '-');
    card.innerHTML = `
      <h3 id="assignment-title-${assignment.id}">${escapeHtml(assignment.title)}</h3>
      <p><strong>Team Member:</strong> ${escapeHtml(assignment.assignee)}</p>
      <p><strong>Type:</strong> ${escapeHtml(assignment.type)}</p>
      <p class="due-date"><strong>Due:</strong> ${escapeHtml(assignment.dueDate)}</p>
      <p><strong>Status:</strong> <span class="status-badge status-${statusClass}">${escapeHtml(displayStatus)}</span></p>
      <div class="assignment-actions">
        ${assignment.status !== 'Completed' ? `
          ${assignment.status === 'Pending' ? `<button class="button small" data-id="${assignment.id}" data-action="start" aria-label="Mark ${escapeHtml(assignment.title)} as In Progress">Start</button>` : ''}
          ${assignment.status === 'In Progress' ? `<button class="button small" data-id="${assignment.id}" data-action="complete" aria-label="Mark ${escapeHtml(assignment.title)} as Completed">Complete</button>` : ''}
          ${assignment.status === 'In Progress' ? `<button class="button small secondary" data-id="${assignment.id}" data-action="pend" aria-label="Mark ${escapeHtml(assignment.title)} as Pending">Set to Pending</button>` : ''}
        ` : `<button class="button small secondary" data-id="${assignment.id}" data-action="reopen" aria-label="Reopen ${escapeHtml(assignment.title)}">Reopen</button>`}
        <button class="button small danger" data-id="${assignment.id}" data-action="delete" aria-label="Delete ${escapeHtml(assignment.title)}">Delete</button>
      </div>
    `;
    card.querySelectorAll<HTMLButtonElement>('.assignment-actions button').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const id = target.dataset.id;
        const action = target.dataset.action;
        if (id && action) {
          handleAssignmentAction(id, action as 'start' | 'complete' | 'pend' | 'reopen' | 'delete');
        }
      });
    });
    DOMElements.listContainer.appendChild(card);
  });
}

function escapeHtml(unsafe: string): string {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function handleAssignmentAction(id: string, action: 'start' | 'complete' | 'pend' | 'reopen' | 'delete'): void {
  const assignmentIndex = assignments.findIndex(a => a.id === id);
  if (assignmentIndex === -1) return;
  switch (action) {
    case 'start': assignments[assignmentIndex].status = 'In Progress'; break;
    case 'complete': assignments[assignmentIndex].status = 'Completed'; break;
    case 'pend': assignments[assignmentIndex].status = 'Pending'; break;
    case 'reopen': assignments[assignmentIndex].status = 'Pending'; break;
    case 'delete': if (confirm('Are you sure you want to delete this assignment?')) { assignments.splice(assignmentIndex, 1); } break;
  }
  saveAssignments();
  renderAssignments(); // This will also re-render charts
}

function showAssigneeMessage(message: string, type: 'success' | 'error'): void {
  if (!DOMElements.addAssigneeMessageArea) return;

  const messageArea = DOMElements.addAssigneeMessageArea;
  messageArea.textContent = message;
  messageArea.className = `message-area ${type}`; // Reset classes and add current type
  messageArea.style.display = 'block'; // Make it visible

  // Clear message after 3 seconds for success, persist for error
  if (type === 'success') {
    setTimeout(() => {
      messageArea.textContent = '';
      messageArea.style.display = 'none';
      messageArea.className = 'message-area'; // Reset class
    }, 3000);
  }
}

function handleAddAssignee(): void {
    const newNameInput = DOMElements.newAssigneeNameInput;
    const newName = newNameInput.value.trim();

    if (!DOMElements.addAssigneeMessageArea) {
        console.error("Assignee message area not found!");
        // Fallback to alert if message area is missing, though ideally it should always be there.
        if (!newName) {
            alert('Please enter a name for the new team member.');
            newNameInput.focus();
            return;
        }
        if (teamMembers.some(member => member.toLowerCase() === newName.toLowerCase())) {
            alert(`"${newName}" is already in the team list.`);
            newNameInput.value = '';
            newNameInput.focus();
            return;
        }
    }


    if (!newName) {
        showAssigneeMessage('Please enter a name for the new team member.', 'error');
        newNameInput.focus();
        return;
    }

    if (teamMembers.some(member => member.toLowerCase() === newName.toLowerCase())) {
        showAssigneeMessage(`"${newName}" is already in the team list.`, 'error');
        newNameInput.value = '';
        newNameInput.focus();
        return;
    }

    teamMembers.push(newName);
    saveTeamMembers();
    populateAssigneeDropdown();
    showAssigneeMessage(`"${newName}" has been added successfully!`, 'success');
    newNameInput.value = '';
    // newNameInput.focus(); // Keep focus on the input for potentially adding more
}

function handleFormSubmit(event: SubmitEvent): void {
  event.preventDefault();
  if (!DOMElements.form.checkValidity()) {
    DOMElements.form.reportValidity();
    return;
  }
  const newAssignment: Assignment = {
    id: `asg-${Date.now().toString()}-${Math.random().toString(36).substring(2, 7)}`,
    title: DOMElements.titleInput.value.trim(),
    assignee: DOMElements.assigneeSelect.value,
    type: DOMElements.typeSelect.value as Assignment['type'],
    dueDate: DOMElements.dueDateInput.value,
    status: 'Pending',
  };
  assignments.push(newAssignment);
  saveAssignments();
  renderAssignments(); // This will also re-render charts
  DOMElements.form.reset();
  DOMElements.titleInput.focus();
}

function renderTaskCompletionChart(): void {
  if (!DOMElements.taskCompletionChart) return;

  const quarterlyData: { [key: string]: { completed: number, total: number } } = {
    "Q1": { completed: 0, total: 0 },
    "Q2": { completed: 0, total: 0 },
    "Q3": { completed: 0, total: 0 },
    "Q4": { completed: 0, total: 0 },
  };

  assignments.forEach(assignment => {
    const month = new Date(assignment.dueDate).getMonth() + 1; // 1-12
    let quarter: string;
    if (month <= 3) quarter = "Q1";
    else if (month <= 6) quarter = "Q2";
    else if (month <= 9) quarter = "Q3";
    else quarter = "Q4";

    quarterlyData[quarter].total++;
    if (assignment.status === 'Completed') {
      quarterlyData[quarter].completed++;
    }
  });

  const labels = Object.keys(quarterlyData);
  const completedCounts = labels.map(q => quarterlyData[q].completed);
  const pendingCounts = labels.map(q => quarterlyData[q].total - quarterlyData[q].completed);

  if (taskCompletionChartInstance) {
    taskCompletionChartInstance.destroy();
  }

  taskCompletionChartInstance = new Chart(DOMElements.taskCompletionChart.getContext('2d'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Completed Tasks',
          data: completedCounts,
          backgroundColor: 'rgba(46, 133, 64, 0.7)', // --success-color with opacity
          borderColor: 'rgba(46, 133, 64, 1)',
          borderWidth: 1
        },
        {
          label: 'Pending/Overdue Tasks',
          data: pendingCounts,
          backgroundColor: 'rgba(217, 48, 37, 0.7)', // --danger-color with opacity
          borderColor: 'rgba(217, 48, 37, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          stacked: true,
        },
        x: {
          stacked: true,
        }
      },
      plugins: {
        title: {
            display: false, // Already have a title in HTML
            text: 'Task Completion by Quarter (Simulated)'
        }
      }
    }
  });
}

function renderTasksLeftPerPersonChart(): void {
  if (!DOMElements.tasksLeftPerPersonChart || !teamMembers.length) return;

  const tasksLeft: { [key: string]: number } = {};
  teamMembers.forEach(member => tasksLeft[member] = 0);

  assignments.forEach(assignment => {
    if (assignment.status !== 'Completed') {
      if (tasksLeft.hasOwnProperty(assignment.assignee)) {
        tasksLeft[assignment.assignee]++;
      }
      // Optional: handle assignments for members no longer in teamMembers list
    }
  });

  const labels = teamMembers; // Or Object.keys(tasksLeft) if you want to include past members with tasks
  const data = labels.map(member => tasksLeft[member]);

  if (tasksLeftPerPersonChartInstance) {
    tasksLeftPerPersonChartInstance.destroy();
  }

  tasksLeftPerPersonChartInstance = new Chart(DOMElements.tasksLeftPerPersonChart.getContext('2d'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Non-Completed Tasks',
        data: data,
        backgroundColor: 'rgba(0, 78, 137, 0.7)', // --secondary-color with opacity
        borderColor: 'rgba(0, 78, 137, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1 // Ensure y-axis shows whole numbers for task counts
          }
        }
      },
      plugins: {
        title: {
            display: false, // Already have a title in HTML
            text: 'Tasks Remaining per Team Member'
        }
      }
    }
  });
}


function handleNavigation(event: Event): void {
  event.preventDefault();
  const targetLink = event.currentTarget as HTMLAnchorElement;
  const pageIdToShow = targetLink.dataset.page;

  if (!pageIdToShow) return;

  // Hide all page content
  document.querySelectorAll<HTMLDivElement>('.page-content').forEach(page => {
    page.style.display = 'none';
  });

  // Show the target page content
  const targetPage = document.getElementById(`page-${pageIdToShow}`);
  if (targetPage) {
    // Special handling for dashboard layout
    if (pageIdToShow === 'dashboard') {
        targetPage.style.display = 'grid'; // Re-apply grid display for dashboard
    } else {
        targetPage.style.display = 'block';
    }
  } else {
    console.warn(`Page content for 'page-${pageIdToShow}' not found.`);
  }

  // Update active navigation link
  if (DOMElements.mainNav) {
    DOMElements.mainNav.querySelectorAll('a').forEach(link => {
      link.classList.remove('active-nav');
    });
    targetLink.classList.add('active-nav');
  }
}


function initializeApp(): void {
  // Check for core elements required for dashboard functionality first
  if (!DOMElements.form || !DOMElements.listContainer || !DOMElements.filterStatusSelect ||
      !DOMElements.sortBySelect || !DOMElements.newAssigneeNameInput || !DOMElements.addAssigneeButton ||
      !DOMElements.addAssigneeMessageArea || !DOMElements.mainNav || !DOMElements.pageDashboard ||
      !DOMElements.taskCompletionChart || !DOMElements.tasksLeftPerPersonChart ) { // Added chart canvas checks
    console.error('One or more critical DOM elements are missing. App cannot initialize.');
    return;
  }

  console.log("Initializing App...");
  loadTeamMembers();
  populateAssigneeDropdown();
  loadAssignments();
  renderAssignments(); // This renders the dashboard content AND CHARTS

  // Setup event listeners for dashboard specific elements
  DOMElements.form.addEventListener('submit', handleFormSubmit);
  // Render assignments (and thus charts) also on filter/sort changes
  DOMElements.filterStatusSelect.addEventListener('change', () => {
    renderAssignments();
    renderTaskCompletionChart(); // Explicitly call chart updates if renderAssignments doesn't already
    renderTasksLeftPerPersonChart();
  });
  DOMElements.sortBySelect.addEventListener('change', () => {
    renderAssignments();
    renderTaskCompletionChart();
    renderTasksLeftPerPersonChart();
  });

  if (DOMElements.addAssigneeButton) {
      DOMElements.addAssigneeButton.addEventListener('click', handleAddAssignee);
  } else {
      console.error("Add Assignee Button NOT FOUND!");
  }

  // Setup navigation
  const navLinks = DOMElements.mainNav.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavigation);
  });

  // Set Dashboard as active by default
  const defaultActiveLink = DOMElements.mainNav.querySelector('a[data-page="dashboard"]');
  if (defaultActiveLink) {
    defaultActiveLink.classList.add('active-nav');
  }
  // Ensure only dashboard is visible initially (other pages are display:none via CSS or inline style)
  // The dashboard is visible by default due to not having `style="display: none;"`
  // and its grid layout is applied via CSS.

  // Initial chart rendering
  renderTaskCompletionChart();
  renderTasksLeftPerPersonChart();

  const themeToggle = document.createElement('button');
  themeToggle.textContent = 'Toggle Dark Mode';
  themeToggle.className = 'button';
  themeToggle.style.position = 'fixed';
  themeToggle.style.top = '10px';
  themeToggle.style.right = '10px';
  themeToggle.setAttribute('aria-label', 'Toggle color theme');
  document.body.appendChild(themeToggle);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  themeToggle.addEventListener('click', () => {
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });
  const today = new Date().toISOString().split('T')[0];
  DOMElements.dueDateInput.value = today;
  DOMElements.dueDateInput.min = today; 
}

// Start the application
document.addEventListener('DOMContentLoaded', initializeApp);

// Modify renderAssignments to call chart rendering functions
const originalRenderAssignments = renderAssignments;
renderAssignments = () => {
  originalRenderAssignments(); // Call the original function
  if (document.getElementById('page-dashboard')?.style.display !== 'none') {
    renderTaskCompletionChart();
    renderTasksLeftPerPersonChart();
  }
};