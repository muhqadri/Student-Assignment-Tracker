const AssignmentService = require("../js/service");
const AssignmentRepository = require("../js/repository");
const AssignmentValidator = require("../js/validator");

// In-memory stand-in for localStorage (this is what Dependency Inversion buys us).
function fakeStorage({ failOnSave = false, initial = null } = {}) {
  let data = initial;
  return {
    getItem: () => data,
    setItem: (key, value) => {
      if (failOnSave) throw new Error("quota exceeded");
      data = value;
    },
    peek: () => data
  };
}

function makeService({ storage = fakeStorage(), today = "2026-11-22" } = {}) {
  let counter = 0;
  const service = new AssignmentService({
    repository: new AssignmentRepository(storage, "test-key"),
    validator: AssignmentValidator,
    newId: () => `id-${++counter}`,
    now: () => 1000,
    today: () => today
  });
  return { service, storage };
}

const valid = (overrides = {}) => ({
  name: "Lab 4",
  course: "CS360",
  dueDate: "2026-12-01",
  priority: "High",
  status: "Not Started",
  description: "",
  ...overrides
});

module.exports = { fakeStorage, makeService, valid };
