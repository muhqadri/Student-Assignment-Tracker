// Single Responsibility: persistence only.
// Dependency Inversion: it receives any object with getItem/setItem (localStorage in the
// browser, a plain in-memory fake in tests) instead of reaching for localStorage itself.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.AssignmentRepository = factory();
})(typeof self !== "undefined" ? self : this, function () {
  class AssignmentRepository {
    constructor(storage, key) {
      this.storage = storage;
      this.key = key;
    }
    load() {
      try {
        const saved = this.storage.getItem(this.key);
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    }
    save(assignments) {
      try {
        this.storage.setItem(this.key, JSON.stringify(assignments));
        return true;
      } catch (error) {
        return false;
      }
    }
  }
  return AssignmentRepository;
});
