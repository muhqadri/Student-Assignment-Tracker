// Single Responsibility: turn the text of a backup file into a list of records.
// Validating each record is the validator's job; saving is the service's job.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.BackupParser = factory();
})(typeof self !== "undefined" ? self : this, function () {
  function parseBackup(text) {
    try {
      return { ok: true, errors: [], records: JSON.parse(text) };
    } catch (error) {
      return { ok: false, errors: ["That file is not valid JSON. Choose a backup exported from this app."] };
    }
  }
  return { parseBackup };
});
