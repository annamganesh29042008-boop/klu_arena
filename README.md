# KLU Arena 🏆

**WHERE CHAMPIONS COMPETE**

KLU Arena is a modern Sports & Esports Tournament Portal concept for KLU students. It brings physical sports and competitive gaming into one tournament experience.

## Included features

- Sports and Esports category browsing
- Tournament discovery with category, game, status and text search filters
- Tournament detail page with Overview, Schedule, Bracket and Leaderboard tabs
- Tournament registration form with browser-side demo storage
- Live Match Center with scoreboard and match-event feed
- Upcoming matches and results
- Team directory, team profiles and team creation flow
- Leaderboard and tournament rankings
- Player signup/login demo flow
- Password recovery demo flow
- Organizer dashboard with tournament creation, registration queue and result updates
- Contact/support form
- Rules & Guidelines, FAQ, About and Privacy pages
- Branded 404 page
- Responsive dark red/black KLU Arena visual system
- Shared JavaScript for search, URL filtering, navigation, notifications and bookmarks

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser LocalStorage for demo account, team, registration, contact and recovery state
- GitHub for version control

## Main pages

- `index.html` — homepage
- `tournaments.html` — tournament discovery
- `tournament-details.html` — tournament detail, schedule, bracket and leaderboard
- `register.html` — tournament registration
- `sports.html` — sports arena
- `esports.html` — esports arena
- `matches.html` — match center
- `match.html` — live match details
- `leaderboard.html` — rankings
- `teams.html` — teams directory
- `team-profile.html` — sample team profile
- `create-team.html` — team creation
- `organizer.html` — organizer control center
- `login.html` / `signup.html` — demo account flow
- `forgot-password.html` — password recovery demo
- `about.html` — platform overview
- `rules.html` — competition rules
- `faq.html` — frequently asked questions
- `contact.html` — support/contact form
- `privacy.html` — demo privacy information
- `404.html` — branded not-found page

## Run locally

Because this is a static front-end project, you can open `index.html` directly in a browser. For the best development experience, use the VS Code Live Server extension.

## Deployment

The repository is structured for GitHub Pages deployment from the `main` branch root. GitHub Pages itself must be enabled in the repository Settings → Pages screen.

## Important project limitation

This is a **college-project demo**, not a production backend. Tournament records, authentication, live scores, organizer data and submissions are currently simulated with page data and browser LocalStorage. A production version should add secure authentication, a real database, server-side validation, role-based organizer access, real-time match updates, persistent prize records and a secure deployment configuration.
