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
};

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
  renderAssignments();
}

function handleAddAssignee(): void {
    console.log("Add Team Member button clicked!"); // <<< CHANGED TEXT

    const newNameInput = DOMElements.newAssigneeNameInput;
    const newName = newNameInput.value.trim();
    console.log("New member name entered:", newName); // <<< CHANGED TEXT

    if (!newName) {
        console.log("Name is empty, showing alert.");
        // **** CHANGED TEXT ****
        alert('Please enter a name for the new team member.'); 
        newNameInput.focus();
        return; 
    }

    if (teamMembers.some(member => member.toLowerCase() === newName.toLowerCase())) {
        console.log("Name already exists, showing alert.");
        // **** CHANGED TEXT ****
        alert(`"${newName}" is already in the team list.`); 
        newNameInput.value = ''; 
        newNameInput.focus();
        return; 
    }

    teamMembers.push(newName); 
    console.log("Updated teamMembers:", teamMembers); 
    saveTeamMembers();         
    populateAssigneeDropdown(); 
    console.log("Dropdown populated, showing alert."); 
    // **** CHANGED TEXT ****
    alert(`"${newName}" has been added successfully!`); 
    newNameInput.value = ''; 
    newNameInput.focus();    
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
  renderAssignments();
  DOMElements.form.reset();
  DOMElements.titleInput.focus();
}

function initializeApp(): void {
  if (!DOMElements.form || !DOMElements.listContainer || !DOMElements.filterStatusSelect || 
      !DOMElements.sortBySelect || !DOMElements.newAssigneeNameInput || !DOMElements.addAssigneeButton) { 
    console.error('One or more critical DOM elements are missing. App cannot initialize.');
    return;
  }
  console.log("Initializing App..."); 
  loadTeamMembers(); 
  populateAssigneeDropdown();
  loadAssignments();
  renderAssignments();
  DOMElements.form.addEventListener('submit', handleFormSubmit);
  DOMElements.filterStatusSelect.addEventListener('change', renderAssignments);
  DOMElements.sortBySelect.addEventListener('change', renderAssignments);
  if (DOMElements.addAssigneeButton) {
      console.log("Add Assignee Button Found! Adding listener."); 
      DOMElements.addAssigneeButton.addEventListener('click', handleAddAssignee); 
  } else {
      console.error("Add Assignee Button NOT FOUND!"); 
  }
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