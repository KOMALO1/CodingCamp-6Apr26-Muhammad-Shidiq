# Requirements Document

## Introduction

A personal dashboard web app built with vanilla HTML, CSS, and JavaScript. It runs entirely in the browser with no backend, using Local Storage for persistence. The dashboard provides four core widgets: a time/date greeting, a focus timer, a to-do list, and a quick links panel — all in a clean, minimal interface.

## Glossary

- **Dashboard**: The single-page web application that hosts all widgets.
- **Greeting_Widget**: The component that displays the current time, date, and a time-based greeting message.
- **Focus_Timer**: The countdown timer component set to 25 minutes by default.
- **Todo_List**: The component that manages a list of user tasks.
- **Task**: A single to-do item with a text description and a completion state.
- **Quick_Links**: The component that displays user-defined shortcut buttons to external URLs.
- **Link**: A single quick-link entry consisting of a label and a URL.
- **Local_Storage**: The browser's built-in client-side key-value storage API.
- **Storage_Manager**: The module responsible for reading and writing data to Local Storage.
- **Theme**: The active color scheme of the Dashboard, either "light" or "dark".
- **Sort_Order**: The ordering applied to the Todo_List, either by creation date (default) or alphabetically by task text.

---

## Requirements

### Requirement 1: Time, Date, and Greeting Display

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the dashboard, so that I have an immediate sense of the time of day without checking elsewhere.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM format, updated every minute.
2. THE Greeting_Widget SHALL display the current date including the day of the week, month, and day number.
3. WHEN the local time is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good morning".
4. WHEN the local time is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good afternoon".
5. WHEN the local time is between 18:00 and 21:59, THE Greeting_Widget SHALL display the greeting "Good evening".
6. WHEN the local time is between 22:00 and 04:59, THE Greeting_Widget SHALL display the greeting "Good night".

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can time focused work sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL initialize with a countdown value of 25 minutes and 00 seconds (25:00).
2. WHEN the user activates the start control, THE Focus_Timer SHALL begin counting down one second per second.
3. WHEN the Focus_Timer is counting down and the user activates the stop control, THE Focus_Timer SHALL pause the countdown at the current remaining time.
4. WHEN the user activates the reset control, THE Focus_Timer SHALL return the countdown value to 25:00 and stop any active countdown.
5. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and display a visual indication that the session has ended.
6. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL display the remaining time in MM:SS format, updated every second.

---

### Requirement 3: To-Do List

**User Story:** As a user, I want to add, edit, complete, and delete tasks in a to-do list that persists across browser sessions, so that I can track my work without losing it on page reload.

#### Acceptance Criteria

1. WHEN the user submits a non-empty text input, THE Todo_List SHALL add a new Task with the provided text and an incomplete state.
2. IF the user submits an empty or whitespace-only text input, THEN THE Todo_List SHALL reject the submission and not create a Task.
3. IF the user submits text that is identical (case-insensitive) to an existing Task's text, THEN THE Todo_List SHALL reject the submission and not create a duplicate Task.
4. WHEN the user activates the edit control on a Task, THE Todo_List SHALL allow the user to modify the Task's text and save the updated text.
5. WHEN the user activates the complete control on an incomplete Task, THE Todo_List SHALL update the Task's state to complete and apply a visual distinction to that Task.
6. WHEN the user activates the complete control on a complete Task, THE Todo_List SHALL update the Task's state to incomplete and remove the visual distinction.
7. WHEN the user activates the delete control on a Task, THE Todo_List SHALL remove that Task from the list.
8. WHEN the user selects a Sort_Order, THE Todo_List SHALL reorder the displayed Tasks according to the selected Sort_Order without modifying the underlying Task data.
9. WHEN any Task is added, edited, completed, or deleted, THE Storage_Manager SHALL persist the full updated Task list to Local Storage.
10. WHEN the Dashboard loads, THE Storage_Manager SHALL restore all previously saved Tasks from Local Storage and THE Todo_List SHALL display them.
11. WHEN the Dashboard loads, THE Storage_Manager SHALL restore the previously saved Sort_Order from Local Storage and THE Todo_List SHALL apply it on render.

---

### Requirement 4: Quick Links

**User Story:** As a user, I want to save and manage shortcut buttons to my favorite websites, so that I can open them quickly from the dashboard.

#### Acceptance Criteria

1. WHEN the user submits a label and a valid URL, THE Quick_Links SHALL add a new Link and display it as a clickable button.
2. IF the user submits a missing label or an invalid URL, THEN THE Quick_Links SHALL reject the submission and not create a Link.
3. WHEN the user activates a Link button, THE Dashboard SHALL open the corresponding URL in a new browser tab.
4. WHEN the user activates the delete control on a Link, THE Quick_Links SHALL remove that Link from the panel.
5. WHEN any Link is added or deleted, THE Storage_Manager SHALL persist the full updated Link list to Local Storage.
6. WHEN the Dashboard loads, THE Storage_Manager SHALL restore all previously saved Links from Local Storage and THE Quick_Links SHALL display them.

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my tasks and links to be saved automatically, so that my data is not lost when I close or refresh the browser.

#### Acceptance Criteria

1. THE Storage_Manager SHALL store Task data under a dedicated, consistent Local Storage key.
2. THE Storage_Manager SHALL store Link data under a dedicated, consistent Local Storage key.
3. IF Local Storage is unavailable or returns a parse error, THEN THE Storage_Manager SHALL initialize with an empty dataset and THE Dashboard SHALL remain functional.

---

### Requirement 6: Layout and Visual Design

**User Story:** As a user, I want a clean, readable, and responsive layout, so that the dashboard is easy to use across different screen sizes.

#### Acceptance Criteria

1. THE Dashboard SHALL present all four widgets (Greeting_Widget, Focus_Timer, Todo_List, Quick_Links) in a single-page layout with no navigation required.
2. THE Dashboard SHALL use a single CSS file for all styling.
3. THE Dashboard SHALL use a single JavaScript file for all behavior.
4. WHEN the viewport width is below 768px, THE Dashboard SHALL reflow the layout so that widgets stack vertically and remain fully usable.
5. THE Dashboard SHALL apply a consistent typographic scale and spacing so that all text is legible at default browser font sizes.

---

### Requirement 7: Light and Dark Theme Toggle

**User Story:** As a user, I want to switch between a light and dark color scheme, so that I can use the dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a toggle control that switches the active Theme between "light" and "dark".
2. WHEN the user activates the theme toggle, THE Dashboard SHALL apply the selected Theme to all widgets immediately without a page reload.
3. WHEN the Dashboard loads and no saved Theme exists, THE Dashboard SHALL apply the Theme that matches the user's operating system color-scheme preference.
4. WHEN the user activates the theme toggle, THE Storage_Manager SHALL persist the selected Theme to Local Storage.
5. WHEN the Dashboard loads and a saved Theme exists, THE Storage_Manager SHALL restore the saved Theme and THE Dashboard SHALL apply it before rendering any content.
