// Business rules for adding, editing, and importing assignments.
// Dependency Inversion: repository, validator, id generator, and clock are all injected,
// so tests can pass fakes and the UI can pass the real thing.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.AssignmentService = factory();
})(typeof self !== "undefined" ? self : this, function () {
  class AssignmentService {
    constructor({ repository, validator, newId, now, today }) {
      this.repository = repository;
      this.validator = validator;
      this.newId = newId;
      this.now = now;
      this.today = today;
      this.assignments = repository.load();
    }

    list() {
      return this.assignments;
    }

    _persist(previous) {
      if (!this.repository.save(this.assignments)) {
        this.assignments = previous; // roll back so memory matches what is actually saved
        return { ok: false, errors: ["The browser could not save your assignments. Check your browser storage settings."] };
      }
      return { ok: true, errors: [] };
    }

    add(input) {
      const result = this.validator.validateAssignment(input, { today: this.today() });
      if (!result.valid) return { ok: false, errors: result.errors };
      const previous = this.assignments;
      const item = { id: this.newId(), ...result.value, createdAt: this.now() };
      this.assignments = [...previous, item];
      const saved = this._persist(previous);
      return saved.ok ? { ok: true, errors: [], assignment: item } : saved;
    }

    update(id, input) {
      const existing = this.assignments.find(a => a.id === id);
      if (!existing) return { ok: false, errors: ["That assignment no longer exists."] };
      // Keeping an unchanged (possibly overdue) due date must stay allowed.
      const allowPastDate = String(input.dueDate) === existing.dueDate;
      const result = this.validator.validateAssignment(input, { today: this.today(), allowPastDate });
      if (!result.valid) return { ok: false, errors: result.errors };
      const previous = this.assignments;
      const updated = { ...existing, ...result.value };
      this.assignments = previous.map(a => (a.id === id ? updated : a));
      const saved = this._persist(previous);
      return saved.ok ? { ok: true, errors: [], assignment: updated } : saved;
    }

    setStatus(id, status) {
      const existing = this.assignments.find(a => a.id === id);
      if (!existing) return { ok: false, errors: ["That assignment no longer exists."] };
      return this.update(id, { ...existing, status });
    }

    remove(id) {
      const previous = this.assignments;
      this.assignments = previous.filter(a => a.id !== id);
      return this._persist(previous);
    }

    // Import is all-or-nothing: one bad record rejects the whole file and nothing changes.
    importAssignments(records) {
      if (!Array.isArray(records)) return { ok: false, errors: ["The backup file must contain a list of assignments."] };
      const errors = [];
      const cleaned = [];
      records.forEach((record, index) => {
        if (record === null || typeof record !== "object") {
          errors.push(`Item ${index + 1}: not a valid assignment.`);
          return;
        }
        const result = this.validator.validateAssignment(record, { today: this.today(), allowPastDate: true });
        if (!result.valid) {
          errors.push(`Item ${index + 1}: ${result.errors[0]}`);
          return;
        }
        cleaned.push({
          id: typeof record.id === "string" && record.id ? record.id : this.newId(),
          ...result.value,
          createdAt: Number.isFinite(record.createdAt) ? record.createdAt : this.now()
        });
      });
      if (errors.length) return { ok: false, errors };

      const knownIds = new Set(this.assignments.map(a => a.id));
      const fresh = cleaned.filter(item => !knownIds.has(item.id));
      const previous = this.assignments;
      this.assignments = [...previous, ...fresh];
      const saved = this._persist(previous);
      return saved.ok ? { ok: true, errors: [], imported: fresh.length, skipped: cleaned.length - fresh.length } : saved;
    }
  }
  return AssignmentService;
});
