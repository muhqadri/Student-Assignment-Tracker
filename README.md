# Student Assignment Tracker — Sprint 1

## Purpose
A small web application for high school and college students to organize assignments, due dates, priorities, and completion status.

## Sprint 1 goal
Allow students to add assignments, view their assignments, mark them complete, and keep the data after refreshing the browser.

## Technologies
- HTML5
- CSS3
- JavaScript (vanilla)
- Browser `localStorage` for persistence

## Prerequisites
- A modern browser (Chrome, Firefox, Edge, or Safari).
- No database, package installation, or API key is required.

## Installation and running
1. Download or clone this repository.
2. Open the `SourceCode` folder.
3. Open `index.html` in a modern web browser.

For a local server (optional), open a terminal in `SourceCode` and run:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

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

## Storage and configuration
Assignments are saved in the current browser's local storage under `student-assignment-tracker-v1`. Data stays in that browser on that device; it is not synchronized to other devices or browsers. Clearing browser data can remove saved assignments. No credentials or environment variables are required.

## Known limitations
- This is a Sprint 1 prototype, not a deployed multi-user application.
- Data is stored locally in the browser and is not backed up or shared.
- There is no login, automatic reminder, school-system integration, or cloud database.
- The application uses manual testing for Sprint 1; automated tests are not included.
- Due dates are interpreted using the browser's local date.
