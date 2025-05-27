"use strict";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const TEAM_MEMBERS_KEY = 'teamMembersList';
const DEFAULT_TEAM_MEMBERS = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
let teamMembers = [];
const LOCAL_STORAGE_KEY = 'teamAssignments';
let assignments = [];
const DOMElements = {
    form: document.getElementById('new-assignment-form'),
    titleInput: document.getElementById('assignment-title'),
    assigneeSelect: document.getElementById('assignment-assignee'),
    typeSelect: document.getElementById('assignment-type'),
    dueDateInput: document.getElementById('assignment-due-date'),
    listContainer: document.getElementById('assignment-list'),
    filterStatusSelect: document.getElementById('filter-status'),
    sortBySelect: document.getElementById('sort-by'),
    emptyStateMessage: document.querySelector('#assignment-list p.empty-state'), // Ensure specificity if needed
    newAssigneeNameInput: document.getElementById('new-assignee-name'),
    addAssigneeButton: document.getElementById('add-assignee-button'),
};
function saveAssignments() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(assignments));
}
function saveTeamMembers() {
    localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(teamMembers));
}
function loadTeamMembers() {
    const storedMembers = localStorage.getItem(TEAM_MEMBERS_KEY);
    if (storedMembers) {
        teamMembers = JSON.parse(storedMembers);
    }
    else {
        teamMembers = [...DEFAULT_TEAM_MEMBERS];
    }
    if (!teamMembers || teamMembers.length === 0) {
        teamMembers = [...DEFAULT_TEAM_MEMBERS];
    }
}
function loadAssignments() {
    const storedAssignments = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedAssignments) {
        assignments = JSON.parse(storedAssignments);
    }
}
function getDisplayStatus(assignment) {
    if (assignment.status !== 'Completed' && new Date(assignment.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
        return 'Overdue';
    }
    return assignment.status;
}
function populateAssigneeDropdown() {
    if (!DOMElements.assigneeSelect)
        return;
    DOMElements.assigneeSelect.innerHTML = '';
    teamMembers.forEach(member => {
        const option = document.createElement('option');
        option.value = member;
        option.textContent = member;
        DOMElements.assigneeSelect.appendChild(option);
    });
}
function renderAssignments() {
    if (!DOMElements.listContainer)
        return;
    DOMElements.listContainer.innerHTML = '';
    const filterStatus = DOMElements.filterStatusSelect.value;
    const sortBy = DOMElements.sortBySelect.value;
    let filteredAssignments = assignments.filter(assignment => {
        if (filterStatus === 'all')
            return true;
        if (filterStatus === 'Overdue')
            return getDisplayStatus(assignment) === 'Overdue';
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
        // Updated class for empty state to match HTML, plus some padding
        p.className = 'empty-state text-gray-500 italic text-center py-10'; 
        p.textContent = 'No assignments match your filters. Try adjusting them or add a new assignment!';
        DOMElements.listContainer.appendChild(p);
        return;
    }
    filteredAssignments.forEach(assignment => {
        const card = document.createElement('div');
        card.className = 'bg-gray-50 p-4 rounded-lg shadow-md border border-gray-200 mb-4'; // Tailwind classes for card
        card.setAttribute('role', 'listitem');
        card.setAttribute('aria-labelledby', `assignment-title-${assignment.id}`);
        
        const displayStatus = getDisplayStatus(assignment);
        let statusBadgeClasses = 'px-2 py-0.5 inline-block text-xs font-semibold rounded-full ';
        switch (displayStatus) {
            case 'Pending': statusBadgeClasses += 'bg-yellow-200 text-yellow-800'; break;
            case 'In Progress': statusBadgeClasses += 'bg-blue-200 text-blue-800'; break;
            case 'Completed': statusBadgeClasses += 'bg-green-200 text-green-800'; break;
            case 'Overdue': statusBadgeClasses += 'bg-red-200 text-red-800'; break;
            default: statusBadgeClasses += 'bg-gray-200 text-gray-800';
        }

        // Base Tailwind classes for action buttons
        const baseButtonClasses = "py-1 px-3 rounded-md shadow-sm text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
        const startButtonClasses = `${baseButtonClasses} bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-400`;
        const completeButtonClasses = `${baseButtonClasses} bg-green-500 hover:bg-green-600 text-white focus:ring-green-400`;
        const pendReopenButtonClasses = `${baseButtonClasses} bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-400`;
        const deleteButtonClasses = `${baseButtonClasses} bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 ml-2`;


        card.innerHTML = `
      <h3 id="assignment-title-${assignment.id}" class="text-lg font-semibold text-gray-800 mb-2">${escapeHtml(assignment.title)}</h3>
      <p class="text-sm text-gray-600 mb-1"><strong>Team Member:</strong> ${escapeHtml(assignment.assignee)}</p>
      <p class="text-sm text-gray-600 mb-1"><strong>Type:</strong> ${escapeHtml(assignment.type)}</p>
      <p class="text-sm text-gray-600 mb-1 font-medium"><strong>Due:</strong> ${escapeHtml(assignment.dueDate)}</p>
      <p class="text-sm text-gray-600 mb-3"><strong>Status:</strong> <span class="${statusBadgeClasses}">${escapeHtml(displayStatus)}</span></p>
      <div class="assignment-actions mt-3 pt-3 border-t border-gray-200 text-right">
        ${assignment.status !== 'Completed' ? `
          ${assignment.status === 'Pending' ? `<button class="${startButtonClasses}" data-id="${assignment.id}" data-action="start" aria-label="Mark ${escapeHtml(assignment.title)} as In Progress">Start</button>` : ''}
          ${assignment.status === 'In Progress' ? `<button class="${completeButtonClasses}" data-id="${assignment.id}" data-action="complete" aria-label="Mark ${escapeHtml(assignment.title)} as Completed">Complete</button>` : ''}
          ${assignment.status === 'In Progress' ? `<button class="${pendReopenButtonClasses} ml-2" data-id="${assignment.id}" data-action="pend" aria-label="Mark ${escapeHtml(assignment.title)} as Pending">Set to Pending</button>` : ''}
        ` : `<button class="${pendReopenButtonClasses}" data-id="${assignment.id}" data-action="reopen" aria-label="Reopen ${escapeHtml(assignment.title)}">Reopen</button>`}
        <button class="${deleteButtonClasses}" data-id="${assignment.id}" data-action="delete" aria-label="Delete ${escapeHtml(assignment.title)}">Delete</button>
      </div>
    `;
        card.querySelectorAll('.assignment-actions button').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const id = target.dataset.id;
                const action = target.dataset.action;
                if (id && action) {
                    handleAssignmentAction(id, action);
                }
            });
        });
        DOMElements.listContainer.appendChild(card);
    });
}
function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function handleAssignmentAction(id, action) {
    const assignmentIndex = assignments.findIndex(a => a.id === id);
    if (assignmentIndex === -1)
        return;
    switch (action) {
        case 'start':
            assignments[assignmentIndex].status = 'In Progress';
            break;
        case 'complete':
            assignments[assignmentIndex].status = 'Completed';
            break;
        case 'pend':
            assignments[assignmentIndex].status = 'Pending';
            break;
        case 'reopen':
            assignments[assignmentIndex].status = 'Pending';
            break;
        case 'delete':
            if (confirm('Are you sure you want to delete this assignment?')) {
                assignments.splice(assignmentIndex, 1);
            }
            break;
    }
    saveAssignments();
    renderAssignments();
}
function handleAddAssignee() {
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
function handleFormSubmit(event) {
    event.preventDefault();
    if (!DOMElements.form.checkValidity()) {
        DOMElements.form.reportValidity();
        return;
    }
    const newAssignment = {
        id: `asg-${Date.now().toString()}-${Math.random().toString(36).substring(2, 7)}`,
        title: DOMElements.titleInput.value.trim(),
        assignee: DOMElements.assigneeSelect.value,
        type: DOMElements.typeSelect.value,
        dueDate: DOMElements.dueDateInput.value,
        status: 'Pending',
    };
    assignments.push(newAssignment);
    saveAssignments();
    renderAssignments();
    DOMElements.form.reset();
    DOMElements.titleInput.focus();
}
function initializeApp() {
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
    }
    else {
        console.error("Add Assignee Button NOT FOUND!");
    }

    const today = new Date().toISOString().split('T')[0];
    DOMElements.dueDateInput.value = today;
    DOMElements.dueDateInput.min = today;
}
// Start the application
document.addEventListener('DOMContentLoaded', initializeApp);
