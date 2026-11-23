const test = require("node:test");
const assert = require("node:assert/strict");
const { makeService, fakeStorage, valid } = require("./helpers");

// ---- US-05: Edit an assignment ----
test("US-05: editing changes the fields and keeps id and createdAt", () => {
  const { service } = makeService();
  const { assignment } = service.add(valid());
  const r = service.update(assignment.id, valid({ name: "Lab 5", priority: "Low" }));
  assert.equal(r.ok, true);
  const saved = service.list()[0];
  assert.equal(saved.name, "Lab 5");
  assert.equal(saved.priority, "Low");
  assert.equal(saved.id, assignment.id);
  assert.equal(saved.createdAt, assignment.createdAt);
});

test("US-05: edit is persisted to storage", () => {
  const { service, storage } = makeService();
  const { assignment } = service.add(valid());
  service.update(assignment.id, valid({ course: "CS999" }));
  assert.equal(JSON.parse(storage.peek())[0].course, "CS999");
});

test("US-05: editing with a blank name is rejected and nothing changes", () => {
  const { service } = makeService();
  const { assignment } = service.add(valid());
  const r = service.update(assignment.id, valid({ name: "" }));
  assert.equal(r.ok, false);
  assert.equal(service.list()[0].name, "Lab 4");
});

test("US-05: an overdue assignment can be edited if its date is unchanged", () => {
  const storage = fakeStorage({
    initial: JSON.stringify([{ id: "old", ...valid({ dueDate: "2026-10-01" }), createdAt: 1 }])
  });
  const { service } = makeService({ storage });
  assert.equal(service.update("old", valid({ dueDate: "2026-10-01", name: "Renamed" })).ok, true);
});

test("US-05: moving a date INTO the past is still rejected", () => {
  const { service } = makeService();
  const { assignment } = service.add(valid());
  assert.equal(service.update(assignment.id, valid({ dueDate: "2026-01-01" })).ok, false);
});

test("US-05: editing an unknown id gives a clear error", () => {
  const { service } = makeService();
  const r = service.update("missing", valid());
  assert.equal(r.ok, false);
  assert.match(r.errors[0], /no longer exists/);
});

test("US-05: a failed save rolls back the edit", () => {
  const storage = fakeStorage();
  const { service } = makeService({ storage });
  const { assignment } = service.add(valid());
  storage.setItem = () => { throw new Error("full"); };
  const r = service.update(assignment.id, valid({ name: "Nope" }));
  assert.equal(r.ok, false);
  assert.equal(service.list()[0].name, "Lab 4");
});

