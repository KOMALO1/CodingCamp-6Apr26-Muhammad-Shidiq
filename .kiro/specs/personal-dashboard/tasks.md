# Implementation Plan: Personal Dashboard

## Overview

Implement a single-page personal dashboard using vanilla HTML, CSS, and JavaScript. All logic lives in `js/app.js`, all styles in `css/styles.css`, with `index.html` as the entry point. State is persisted to browser Local Storage via a central `StorageManager`. Modules are implemented incrementally, each wired into `App.init()` before moving on.

## Tasks

- [x] 1. Scaffold project structure and HTML skeleton
  - Create `index.html` with semantic layout: `<header>` (title + theme toggle button), `<main>` with four widget containers (`#greeting`, `#timer`, `#todo`, `#links`), and `<footer>`
  - Create empty `css/styles.css` and `js/app.js` files linked from `index.html`
  - Add `data-theme` attribute to `<html>` element (default `"light"`)
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 2. Implement StorageManager
  - [x] 2.1 Implement `StorageManager` module in `js/app.js`
    - Implement `get(key)` with try/catch around `localStorage.getItem` + `JSON.parse`; return `null` on any error
    - Implement `set(key, value)` with try/catch around `JSON.stringify` + `localStorage.setItem`; swallow errors silently
    - Define `StorageManager.KEYS` constant object: `{ TASKS: 'pd_tasks', LINKS: 'pd_links', THEME: 'pd_theme', SORT_ORDER: 'pd_sort_order' }`
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 2.2 Write property test for StorageManager persistence round-trip
    - **Property 9: Task list persistence round-trip**
    - **Validates: Requirements 3.9, 3.10, 3.11, 5.1**

  - [ ]* 2.3 Write unit tests for StorageManager error handling
    - Test that corrupt JSON in localStorage returns `null` without throwing
    - Test that missing key returns `null`
    - _Requirements: 5.3_

- [x] 3. Implement ThemeManager
  - [x] 3.1 Implement `ThemeManager` module in `js/app.js`
    - Implement `detect()` using `window.matchMedia('(prefers-color-scheme: dark)')`; return `'dark'` or `'light'`
    - Implement `apply(theme)` setting `document.documentElement.setAttribute('data-theme', theme)`
    - Implement `init()`: read saved theme from `StorageManager.get(THEME)`; fall back to `detect()` if null; call `apply()`
    - Implement `toggle()`: flip current theme, call `apply()`, persist via `StorageManager.set(THEME, theme)`
    - Wire theme toggle button click to `ThemeManager.toggle()` in `App.init()`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 3.2 Write property test for theme toggle round-trip
    - **Property 13: Theme toggle is a round-trip**
    - **Validates: Requirements 7.1, 7.4**

  - [ ]* 3.3 Write property test for theme persistence round-trip
    - **Property 14: Theme persistence round-trip**
    - **Validates: Requirements 7.5**

- [x] 4. Implement GreetingWidget
  - [x] 4.1 Implement `GreetingWidget` module in `js/app.js`
    - Implement `getGreeting(hour)`: return `"Good morning"` (5–11), `"Good afternoon"` (12–17), `"Good evening"` (18–21), `"Good night"` (22–4)
    - Implement `formatDate(date)`: return string in `"Weekday, Month D"` format using `toLocaleDateString`
    - Implement `render()`: update `#greeting` with current time (HH:MM), formatted date, and greeting text
    - Implement `init()`: call `render()` immediately, then `setInterval(render, 60000)`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 4.2 Write property test for greeting function coverage
    - **Property 1: Greeting function covers all hours**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

- [x] 5. Implement FocusTimer
  - [x] 5.1 Implement `FocusTimer` module in `js/app.js`
    - Define internal state: `{ totalSeconds: 1500, intervalId: null, running: false }`
    - Implement `formatTime(seconds)`: return zero-padded `"MM:SS"` string
    - Implement `render()`: update timer display element with `formatTime(totalSeconds)`; toggle disabled state on start/stop buttons
    - Implement `tick()`: decrement `totalSeconds` if `> 0`; call `render()`; if `totalSeconds <= 0` call `stop()` and apply session-ended visual indicator
    - Implement `start()`: set `running = true`, start `setInterval(tick, 1000)`, call `render()`
    - Implement `stop()`: clear interval, set `running = false`, call `render()`
    - Implement `reset()`: call `stop()`, set `totalSeconds = 1500`, call `render()`
    - Implement `init()`: wire start/stop/reset button clicks; call `render()`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 5.2 Write property test for time formatting
    - **Property 2: Time formatting is always zero-padded MM:SS**
    - **Validates: Requirements 2.6**

  - [ ]* 5.3 Write property test for timer reset
    - **Property 3: Timer reset always returns to initial state**
    - **Validates: Requirements 2.4**

  - [ ]* 5.4 Write unit tests for FocusTimer
    - Test initial state renders as `"25:00"`
    - Test `stop()` preserves current remaining time
    - Test timer stops automatically at `00:00`
    - _Requirements: 2.1, 2.3, 2.5_

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement TodoList
  - [x] 7.1 Implement `TodoList` data layer in `js/app.js`
    - Define in-memory `tasks` array; load from `StorageManager.get(TASKS)` on `init()`, defaulting to `[]`
    - Implement `persist()`: call `StorageManager.set(TASKS, tasks)` with the insertion-order array
    - Implement `isDuplicate(text)`: case-insensitive check against existing task texts
    - Implement `add(text)`: trim input; return `false` if empty or duplicate; otherwise push new Task object `{ id, text, completed: false, createdAt }` and call `persist()`; return `true`
    - Implement `edit(id, text)`: find task by id, update text, call `persist()`; return `false` if not found
    - Implement `toggle(id)`: flip `completed` on matching task, call `persist()`
    - Implement `delete(id)`: filter out task by id, call `persist()`
    - Implement `setSortOrder(order)`: persist order via `StorageManager.set(SORT_ORDER, order)`; call `render()`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [x] 7.2 Implement `TodoList.render()` and DOM wiring
    - Implement `render()`: read sort order from storage; sort a copy of `tasks` (by `createdAt` or `text` case-insensitively); build task item elements with complete toggle, edit, and delete controls; replace `#todo` list contents
    - Wire add-task form submit to `TodoList.add()` in `init()`; wire sort-order selector to `setSortOrder()`
    - Restore saved sort order on `init()` and apply to initial render
    - _Requirements: 3.4, 3.8, 3.10, 3.11_

  - [ ]* 7.3 Write property test for adding a valid task
    - **Property 4: Adding a valid task grows the list**
    - **Validates: Requirements 3.1**

  - [ ]* 7.4 Write property test for whitespace and duplicate rejection
    - **Property 5: Whitespace-only and duplicate inputs are rejected**
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 7.5 Write property test for toggle completion round-trip
    - **Property 6: Toggle completion is a round-trip**
    - **Validates: Requirements 3.5, 3.6**

  - [ ]* 7.6 Write property test for delete by id
    - **Property 7: Delete removes the task by id**
    - **Validates: Requirements 3.7**

  - [ ]* 7.7 Write property test for sort order immutability
    - **Property 8: Sort order does not mutate stored task data**
    - **Validates: Requirements 3.8**

- [x] 8. Implement QuickLinks
  - [x] 8.1 Implement `QuickLinks` data layer in `js/app.js`
    - Define in-memory `links` array; load from `StorageManager.get(LINKS)` on `init()`, defaulting to `[]`
    - Implement `persist()`: call `StorageManager.set(LINKS, links)`
    - Implement `isValidUrl(url)`: use `new URL(url)` in try/catch; return `true` only if protocol is `http:` or `https:`
    - Implement `add(label, url)`: return `false` if label is empty or `isValidUrl` fails; otherwise push new Link `{ id, label, url }`, call `persist()`, return `true`
    - Implement `delete(id)`: filter out link by id, call `persist()`
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

  - [x] 8.2 Implement `QuickLinks.render()` and DOM wiring
    - Implement `render()`: build link button elements with `target="_blank"` and `href` set to link URL, plus a delete control; replace `#links` panel contents
    - Wire add-link form submit to `QuickLinks.add()` in `init()`
    - _Requirements: 4.1, 4.3, 4.6_

  - [ ]* 8.3 Write property test for adding a valid link
    - **Property 10: Adding a valid link grows the links list**
    - **Validates: Requirements 4.1**

  - [ ]* 8.4 Write property test for invalid link rejection
    - **Property 11: Invalid link inputs are rejected**
    - **Validates: Requirements 4.2**

  - [ ]* 8.5 Write property test for link list persistence round-trip
    - **Property 12: Link list persistence round-trip**
    - **Validates: Requirements 4.5, 4.6, 5.2**

  - [ ]* 8.6 Write unit tests for QuickLinks rendering
    - Test that rendered link buttons have `target="_blank"` and correct `href`
    - _Requirements: 4.3_

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement CSS layout and theming
  - [x] 10.1 Implement base layout and typography in `css/styles.css`
    - Define CSS custom properties for colors, spacing, and typography under `:root` (light theme defaults)
    - Override custom properties under `[data-theme="dark"]` for dark theme
    - Style `<header>`, `<main>` CSS Grid (two-column), and `<footer>`
    - Apply consistent typographic scale and spacing so all text is legible at default font sizes
    - _Requirements: 6.1, 6.4, 6.5, 7.2_

  - [x] 10.2 Implement responsive layout and widget styles
    - Add `@media (max-width: 768px)` breakpoint: switch grid to single column
    - Style each widget card (greeting, timer, todo, links) with padding, border-radius, and background using CSS variables
    - Style timer display, task list items (including completed state visual distinction), link buttons, form inputs, and the theme toggle button
    - _Requirements: 6.4, 3.5, 4.3_

- [x] 11. Wire App.init() and final integration
  - [x] 11.1 Implement `App.init()` in `js/app.js`
    - Call modules in order: `ThemeManager.init()`, `GreetingWidget.init()`, `FocusTimer.init()`, `TodoList.init()`, `QuickLinks.init()`
    - Ensure `App.init()` is invoked on `DOMContentLoaded`
    - _Requirements: 6.1, 7.5, 3.10, 3.11, 4.6_

  - [ ]* 11.2 Write DOM smoke tests
    - Test that all four widget containers (`#greeting`, `#timer`, `#todo`, `#links`) exist after page load
    - _Requirements: 6.1_

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use **fast-check** with `fc.configureGlobal({ numRuns: 100 })` and a mock `localStorage` (in-memory Map)
- Sorting is applied at render time only; the stored array always remains in insertion order
