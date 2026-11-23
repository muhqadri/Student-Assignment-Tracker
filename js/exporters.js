// Open/Closed: each export format is an entry in a registry. Adding a new format (e.g. iCal)
// means calling registerExporter(...) once; exportAssignments() and the UI never need editing.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.AssignmentExporters = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const exporters = new Map();

  function registerExporter(format, { extension, mimeType, serialize }) {
    exporters.set(format, { extension, mimeType, serialize });
  }

  function csvCell(value) {
    let text = String(value ?? "");
    // Stop spreadsheet apps from running user text as a formula.
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  registerExporter("json", {
    extension: "json",
    mimeType: "application/json",
    serialize: assignments => JSON.stringify(assignments, null, 2)
  });

  registerExporter("csv", {
    extension: "csv",
    mimeType: "text/csv",
    serialize: assignments => {
      const header = ["Name", "Course", "Due Date", "Priority", "Status", "Description"];
      const rows = assignments.map(a =>
        [a.name, a.course, a.dueDate, a.priority, a.status, a.description].map(csvCell).join(","));
      return [header.join(","), ...rows].join("\r\n");
    }
  });

  function exportAssignments(format, assignments) {
    const exporter = exporters.get(format);
    if (!exporter) return { ok: false, errors: [`Unsupported export format: ${format}`] };
    if (!assignments.length) return { ok: false, errors: ["There are no assignments to export."] };
    return {
      ok: true,
      errors: [],
      content: exporter.serialize(assignments),
      filename: `assignments.${exporter.extension}`,
      mimeType: exporter.mimeType
    };
  }

  function formats() {
    return [...exporters.keys()];
  }

  return { registerExporter, exportAssignments, formats };
});
