// Single Responsibility: this module ONLY decides whether assignment data is valid.
// It does not touch the DOM, storage, or ids.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.AssignmentValidator = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const PRIORITIES = ["Low", "Medium", "High"];
  const STATUSES = ["Not Started", "In Progress", "Completed"];
  const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

  function isRealDate(value) {
    if (!DATE_PATTERN.test(value)) return false;
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  }

  // today: "YYYY-MM-DD" string. allowPastDate: true when editing an item whose date is unchanged.
  function validateAssignment(input, { today, allowPastDate = false } = {}) {
    const errors = [];
    const name = String(input.name ?? "").trim();
    const course = String(input.course ?? "").trim();
    const dueDate = String(input.dueDate ?? "");
    const description = String(input.description ?? "").trim();
    const priority = input.priority ?? "Medium";
    const status = input.status ?? "Not Started";

    if (!name || !course || !dueDate) {
      errors.push("Please enter an assignment name, course, and due date.");
    } else if (!isRealDate(dueDate)) {
      errors.push("The due date is not a valid date.");
    } else if (!allowPastDate && today && dueDate < today) {
      errors.push("The due date cannot be in the past. Choose today or a future date.");
    }
    if (name.length > 100) errors.push("The assignment name must be 100 characters or fewer.");
    if (course.length > 80) errors.push("The course name must be 80 characters or fewer.");
    if (!PRIORITIES.includes(priority)) errors.push("Priority must be Low, Medium, or High.");
    if (!STATUSES.includes(status)) errors.push("Status must be Not Started, In Progress, or Completed.");

    return {
      valid: errors.length === 0,
      errors,
      value: { name, course, dueDate, priority, status, description }
    };
  }

  return { validateAssignment, PRIORITIES, STATUSES, isRealDate };
});
