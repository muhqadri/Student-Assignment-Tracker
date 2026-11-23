const test = require("node:test");
const assert = require("node:assert/strict");
const { exportAssignments, registerExporter, formats } = require("../js/exporters");
const { valid } = require("./helpers");

// ---- US-06: Export ----
test("US-06: CSV has a header row and one row per assignment", () => {
  const r = exportAssignments("csv", [valid(), valid({ name: "Essay" })]);
  assert.equal(r.ok, true);
  assert.equal(r.filename, "assignments.csv");
  const lines = r.content.split("\r\n");
  assert.equal(lines[0], "Name,Course,Due Date,Priority,Status,Description");
  assert.equal(lines.length, 3);
  assert.equal(lines[1], "Lab 4,CS360,2026-12-01,High,Not Started,");
});

test("US-06: CSV escapes commas, quotes, and newlines", () => {
  const r = exportAssignments("csv", [valid({ name: 'Read "Ch 1", Ch 2', description: "line1\nline2" })]);
  assert.ok(r.content.includes('"Read ""Ch 1"", Ch 2"'));
  assert.ok(r.content.includes('"line1\nline2"'));
});

test("US-06: CSV neutralises spreadsheet formulas", () => {
  const r = exportAssignments("csv", [valid({ name: "=SUM(A1:A9)" })]);
  assert.ok(r.content.includes("'=SUM(A1:A9)"));
});

test("US-06: exporting with no assignments gives a clear error", () => {
  const r = exportAssignments("csv", []);
  assert.equal(r.ok, false);
  assert.match(r.errors[0], /no assignments to export/);
});

test("US-06: an unknown format is rejected", () => {
  assert.equal(exportAssignments("pdf", [valid()]).ok, false);
});

test("Open/Closed: a new format can be added without editing existing code", () => {
  registerExporter("txt", {
    extension: "txt",
    mimeType: "text/plain",
    serialize: list => list.map(a => a.name).join("\n")
  });
  assert.ok(formats().includes("txt"));
  assert.equal(exportAssignments("txt", [valid()]).content, "Lab 4");
});
