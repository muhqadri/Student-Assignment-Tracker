const STORAGE_KEY = "student-assignment-tracker-v1";
const form = document.getElementById("assignment-form");
const nameInput = document.getElementById("assignment-name");
const courseInput = document.getElementById("course-name");
const dueInput = document.getElementById("due-date");
const priorityInput = document.getElementById("priority");
const statusInput = document.getElementById("status");
const descriptionInput = document.getElementById("description");
const formMessage = document.getElementById("form-message");
const list = document.getElementById("assignment-list");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search");
const statusFilter = document.getElementById("filter-status");
const priorityFilter = document.getElementById("filter-priority");
const sortSelect = document.getElementById("sort-by");
const formHeading = document.getElementById("form-heading");
const submitButton = document.getElementById("submit-button");
const cancelEditButton = document.getElementById("cancel-edit");
const exportButtons = document.querySelectorAll("[data-format]");
const backupMessage = document.getElementById("backup-message");

const service = new AssignmentService({
  repository: new AssignmentRepository(window.localStorage, STORAGE_KEY),
  validator: AssignmentValidator,
  newId: () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  now: () => Date.now(),
  today: () => localDateString()
});
let editingId = null;

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateDifference(dateString) {
  const due = new Date(`${dateString}T00:00:00`);
  const today = new Date(`${localDateString()}T00:00:00`);
  return Math.round((due - today) / 86400000);
}

function isOverdue(assignment) {
  return assignment.status !== "Completed" && dateDifference(assignment.dueDate) < 0;
}

function isDueSoon(assignment) {
  const days = dateDifference(assignment.dueDate);
  return assignment.status !== "Completed" && days >= 0 && days <= 3;
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function showMessage(message, type = "") {
  formMessage.textContent = message;
  formMessage.className = `message ${type}`.trim();
}

function updateDashboard(assignments) {
  document.getElementById("total-count").textContent = assignments.length;
  document.getElementById("active-count").textContent =
    assignments.filter(a => a.status !== "Completed").length;
  document.getElementById("soon-count").textContent =
    assignments.filter(isDueSoon).length;
  document.getElementById("overdue-count").textContent =
    assignments.filter(isOverdue).length;
  document.getElementById("list-count").textContent =
    `${assignments.length} ${assignments.length === 1 ? "item" : "items"}`;
}

function makeBadge(text, extraClass = "") {
  const badge = document.createElement("span");
  badge.className = `badge ${extraClass}`.trim();
  badge.textContent = text;
  return badge;
}

function renderAssignments() {
  const assignments = service.list();
  updateDashboard(assignments);
  list.replaceChildren();

  const query = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const selectedPriority = priorityFilter.value;

  let visible = assignments.filter(assignment => {
    const matchesSearch = assignment.name.toLowerCase().includes(query) ||
      assignment.course.toLowerCase().includes(query);
    const matchesStatus = selectedStatus === "All" ||
      (selectedStatus === "Overdue" ? isOverdue(assignment) : assignment.status === selectedStatus);
    const matchesPriority = selectedPriority === "All" || assignment.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (sortSelect.value === "due-asc") visible.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  if (sortSelect.value === "due-desc") visible.sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  if (sortSelect.value === "priority") {
    const rank = { High: 3, Medium: 2, Low: 1 };
    visible.sort((a, b) => rank[b.priority] - rank[a.priority] || a.dueDate.localeCompare(b.dueDate));
  }
  if (sortSelect.value === "created") visible.sort((a, b) => b.createdAt - a.createdAt);

  visible.forEach(assignment => {
    const card = document.createElement("article");
    card.className = "assignment-card";

    const main = document.createElement("div");
    main.className = "assignment-main";
    const titleRow = document.createElement("div");
    titleRow.className = "assignment-title-row";
    const title = document.createElement("span");
    title.className = "assignment-title";
    title.textContent = assignment.name;
    titleRow.append(title, makeBadge(assignment.priority, assignment.priority.toLowerCase()));

    if (assignment.status === "Completed") {
      titleRow.append(makeBadge("Completed", "completed"));
    } else if (isOverdue(assignment)) {
      titleRow.append(makeBadge("Overdue", "overdue"));
    } else if (isDueSoon(assignment)) {
      titleRow.append(makeBadge("Due soon", "soon"));
    }

    const meta = document.createElement("div");
    meta.className = "assignment-meta";
    [assignment.course, `Due ${formatDate(assignment.dueDate)}`, assignment.status].forEach(value => {
      const item = document.createElement("span");
      item.textContent = value;
      meta.append(item);
    });
    main.append(titleRow, meta);

    if (assignment.description) {
      const description = document.createElement("p");
      description.className = "assignment-description";
      description.textContent = assignment.description;
      main.append(description);
    }

    const actions = document.createElement("div");
    actions.className = "card-actions";
    if (assignment.status !== "Completed") {
      const completeButton = document.createElement("button");
      completeButton.type = "button";
      completeButton.className = "small-button complete";
      completeButton.textContent = "✓ Complete";
      completeButton.addEventListener("click", () => changeStatus(assignment.id, "Completed"));
      actions.append(completeButton);
    } else {
      const reopenButton = document.createElement("button");
      reopenButton.type = "button";
      reopenButton.className = "small-button";
      reopenButton.textContent = "Reopen";
      reopenButton.addEventListener("click", () => changeStatus(assignment.id, "In Progress"));
      actions.append(reopenButton);
    }

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "small-button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => startEditing(assignment));
    actions.append(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "small-button delete";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      if (window.confirm(`Delete "${assignment.name}"?`)) {
        const result = service.remove(assignment.id);
        if (!result.ok) showMessage(result.errors[0], "error");
        if (editingId === assignment.id) stopEditing();
        renderAssignments();
      }
    });
    actions.append(deleteButton);
    card.append(main, actions);
    list.append(card);
  });

  emptyState.classList.toggle("visible", visible.length === 0);
}

function changeStatus(id, status) {
  const result = service.setStatus(id, status);
  if (!result.ok) showMessage(result.errors[0], "error");
  renderAssignments();
}

function formValues() {
  return {
    name: nameInput.value,
    course: courseInput.value,
    dueDate: dueInput.value,
    priority: priorityInput.value,
    status: statusInput.value,
    description: descriptionInput.value
  };
}

function resetFormDefaults() {
  form.reset();
  priorityInput.value = "Medium";
  statusInput.value = "Not Started";
}

function startEditing(assignment) {
  editingId = assignment.id;
  nameInput.value = assignment.name;
  courseInput.value = assignment.course;
  dueInput.value = assignment.dueDate;
  dueInput.removeAttribute("min"); // an overdue item must keep its original date
  priorityInput.value = assignment.priority;
  statusInput.value = assignment.status;
  descriptionInput.value = assignment.description || "";
  formHeading.textContent = "Edit assignment";
  submitButton.textContent = "Save changes";
  cancelEditButton.hidden = false;
  showMessage("");
  form.scrollIntoView({ behavior: "smooth", block: "center" });
  nameInput.focus();
}

function stopEditing() {
  editingId = null;
  dueInput.min = localDateString();
  formHeading.textContent = "Add an assignment";
  submitButton.textContent = "＋ Add assignment";
  cancelEditButton.hidden = true;
  resetFormDefaults();
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const wasEditing = editingId !== null;
  const result = wasEditing ? service.update(editingId, formValues()) : service.add(formValues());
  if (!result.ok) {
    showMessage(result.errors.join(" "), "error");
    return;
  }
  if (wasEditing) stopEditing(); else resetFormDefaults();
  showMessage(wasEditing ? "Assignment updated and saved." : "Assignment added and saved.", "success");
  renderAssignments();
});

cancelEditButton.addEventListener("click", () => {
  stopEditing();
  showMessage("");
});

exportButtons.forEach(button => {
  button.addEventListener("click", () => {
    const result = AssignmentExporters.exportAssignments(button.dataset.format, service.list());
    if (!result.ok) {
      showBackupMessage(result.errors[0], "error");
      return;
    }
    const url = URL.createObjectURL(new Blob([result.content], { type: result.mimeType }));
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename;
    link.click();
    URL.revokeObjectURL(url);
    showBackupMessage(`Exported ${service.list().length} assignment(s) to ${result.filename}.`, "success");
  });
});

function showBackupMessage(message, type = "") {
  backupMessage.textContent = message;
  backupMessage.className = `message ${type}`.trim();
}

form.addEventListener("reset", () => { if (editingId === null) showMessage(""); });
[searchInput, statusFilter, priorityFilter, sortSelect].forEach(control => {
  control.addEventListener("input", renderAssignments);
  control.addEventListener("change", renderAssignments);
});

document.getElementById("today-label").textContent =
  new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

// Use a local date for the date input's minimum to avoid UTC/time-zone surprises.
dueInput.min = localDateString();
renderAssignments();
