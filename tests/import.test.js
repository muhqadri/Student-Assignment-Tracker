const test = require("node:test");
const assert = require("node:assert/strict");
const { makeService, fakeStorage, valid } = require("./helpers");

// ---- US-07: Import ----
test("US-07: importing valid records adds them", () => {
  const { service } = makeService();
  const r = service.importAssignments([valid({ name: "A" }), valid({ name: "B" })]);
  assert.equal(r.ok, true);
  assert.equal(r.imported, 2);
  assert.equal(service.list().length, 2);
});

test("US-07: records whose id already exists are skipped, not duplicated", () => {
  const { service } = makeService();
  service.importAssignments([{ id: "same", ...valid() }]);
  const r = service.importAssignments([{ id: "same", ...valid() }, { id: "new", ...valid() }]);
  assert.equal(r.imported, 1);
  assert.equal(r.skipped, 1);
  assert.equal(service.list().length, 2);
});

test("US-07: one invalid record rejects the whole file (all-or-nothing)", () => {
  const { service } = makeService();
  const r = service.importAssignments([valid({ name: "Good" }), valid({ priority: "Nope" })]);
  assert.equal(r.ok, false);
  assert.match(r.errors[0], /Item 2/);
  assert.equal(service.list().length, 0);
});

test("US-07: a non-list payload is rejected", () => {
  const { service } = makeService();
  assert.equal(service.importAssignments({ not: "a list" }).ok, false);
  assert.equal(service.importAssignments([null]).ok, false);
});

test("US-07: imported overdue items are accepted (they were valid when exported)", () => {
  const { service } = makeService();
  assert.equal(service.importAssignments([valid({ dueDate: "2026-09-01" })]).ok, true);
});
