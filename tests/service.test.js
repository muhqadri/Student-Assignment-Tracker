const test = require("node:test");
const assert = require("node:assert/strict");
const { makeService, fakeStorage, valid } = require("./helpers");

// ---- Sprint 1 behaviour still works through the service ----
test("add, complete, reopen, and delete still work", () => {
  const { service } = makeService();
  const { assignment } = service.add(valid());
  service.setStatus(assignment.id, "Completed");
  assert.equal(service.list()[0].status, "Completed");
  service.setStatus(assignment.id, "In Progress");
  assert.equal(service.list()[0].status, "In Progress");
  service.remove(assignment.id);
  assert.equal(service.list().length, 0);
});

test("adding with a past date is rejected", () => {
  const { service } = makeService();
  assert.equal(service.add(valid({ dueDate: "2026-11-01" })).ok, false);
  assert.equal(service.list().length, 0);
});

