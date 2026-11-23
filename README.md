# Student Assignment Tracker — Sprint 2

## Purpose
A small web application for high school and college students to organize assignments, due dates, priorities, and completion status.

## Sprint goals
- **Sprint 1:** Allow students to add assignments, view their assignments, mark them complete, and keep the data after refreshing the browser.
- **Sprint 2:** Allow a student to correct an assignment after adding it, and to back up and restore their assignments by exporting them (CSV or JSON) and importing a JSON backup.

## Technologies
- HTML5
- CSS3
- JavaScript (vanilla)
- Browser `localStorage` for persistence

## Prerequisites
- A modern browser (Chrome, Firefox, Edge, or Safari).
- To run the app: no database, package installation, or API key is required.
- To run the automated tests only: [Node.js](https://nodejs.org) 20 or newer (tested on Node 22). There are no npm packages to install.

## Installation and running
1. Download or clone this repository.
2. Open the `SourceCode` folder.
3. Open `index.html` in a modern web browser.

For a local server (optional), open a terminal in `SourceCode` and run:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

## Running the automated tests
From the `SourceCode` folder (the one containing `package.json`):
```bash
npm test
```
(or `node --test`). All tests should pass.

## Try the Sprint 1 functionality
1. Enter an assignment name, course, due date, priority, and status.
2. Select **Add assignment**. The new assignment should appear in the list.
3. Try submitting the form with a required field blank; a validation message should appear.
4. Add an assignment due within the next three days to see the **Due soon** label.
5. Mark an assignment as complete and confirm the status changes.
6. Refresh the page and confirm saved assignments remain.
7. Try searching by assignment name or course and use the status and priority filters.
8. Use the sort menu to change the order of the list.
9. Delete a sample assignment if you no longer need it.

## Try the Sprint 2 functionality
**Edit an assignment (US-05)**
1. Add an assignment, then select **Edit** on its card. The form fills in and the button changes to **Save changes**.
2. Change a field and select **Save changes**; the card updates and the change survives a refresh.
3. Clear the assignment name and save; a validation message appears and nothing changes. Select **Cancel edit** to leave edit mode.

**Export (US-06)**
1. In **Backup and restore**, select **Export CSV** or **Export JSON backup**; a file named `assignments.csv` / `assignments.json` downloads.
2. With an empty list, the same buttons show "There are no assignments to export."

**Import (US-07)**
1. Select **Import JSON backup** and choose a file exported from this app. A message reports how many were imported and how many were skipped as already present.
2. Choose a file that is not valid JSON, or a JSON file with an invalid assignment; an error appears and nothing is changed.

## Project structure
- `index.html`, `styles.css`, `app.js` — the page and the UI wiring only.
- `js/validator.js` — input rules. `js/repository.js` — saving/loading. `js/service.js` — add/edit/import logic.
- `js/exporters.js` — export formats. `js/backup.js` — backup-file parsing.
- `tests/` — automated tests.

## Storage and configuration
Assignments are saved in the current browser's local storage under `student-assignment-tracker-v1`. Data stays in that browser on that device; it is not synchronized to other devices or browsers. Clearing browser data can remove saved assignments. No credentials or environment variables are required.

## Known limitations
- This is a Sprint 1 prototype, not a deployed multi-user application.
- Data is stored locally in the browser and is not backed up or shared.
- There is no login, automatic reminder, school-system integration, or cloud database.
- Automated tests cover the logic modules in `js/`; the page itself (buttons, layout, file download) is checked manually.
- Import accepts JSON backups only (CSV is export-only), and skips records whose id already exists rather than updating them.
- Due dates are interpreted using the browser's local date.
