const test = require("node:test");
const assert = require("node:assert/strict");
const { exportAssignments } = require("../js/exporters");
const { parseBackup } = require("../js/backup");
const { valid } = require("./helpers");

test("US-06: JSON export round-trips through the backup parser", () => {
  const items = [valid(), valid({ name: "Essay" })];
  const parsed = parseBackup(exportAssignments("json", items).content);
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.records, items);
});

test("US-07: a file that is not JSON is rejected with a clear message", () => {
  const r = parseBackup("this is not json");
  assert.equal(r.ok, false);
  assert.match(r.errors[0], /not valid JSON/);
});

