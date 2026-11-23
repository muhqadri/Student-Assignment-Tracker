const test = require("node:test");
const assert = require("node:assert/strict");
const { validateAssignment } = require("../js/validator");
const { valid } = require("./helpers");

const today = "2026-11-22";

test("accepts a normal assignment and trims text", () => {
  const r = validateAssignment(valid({ name: "  Lab 4  " }), { today });
  assert.equal(r.valid, true);
  assert.equal(r.value.name, "Lab 4");
});

test("rejects missing required fields", () => {
  const r = validateAssignment(valid({ course: "   " }), { today });
  assert.equal(r.valid, false);
  assert.match(r.errors[0], /name, course, and due date/);
});

test("rejects a past due date unless allowPastDate is set", () => {
  assert.equal(validateAssignment(valid({ dueDate: "2026-11-01" }), { today }).valid, false);
  assert.equal(validateAssignment(valid({ dueDate: "2026-11-01" }), { today, allowPastDate: true }).valid, true);
});

test("accepts today's date", () => {
  assert.equal(validateAssignment(valid({ dueDate: today }), { today }).valid, true);
});

test("rejects impossible dates such as Feb 30", () => {
  const r = validateAssignment(valid({ dueDate: "2027-02-30" }), { today });
  assert.equal(r.valid, false);
  assert.match(r.errors[0], /not a valid date/);
});

test("rejects unknown priority and status values", () => {
  assert.equal(validateAssignment(valid({ priority: "Urgent" }), { today }).valid, false);
  assert.equal(validateAssignment(valid({ status: "Done" }), { today }).valid, false);
});

test("rejects over-long names", () => {
  assert.equal(validateAssignment(valid({ name: "x".repeat(101) }), { today }).valid, false);
});
