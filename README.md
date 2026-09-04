# KLU Arena 🏆

**WHERE CHAMPIONS COMPETE**

KLU Arena is a modern Sports & Esports Tournament Portal concept for KLU students. It brings physical sports and competitive gaming into one tournament experience.

## Included features

- Sports and Esports category browsing
- Tournament discovery with category, game, status and text search filters
- Tournament detail page with Overview, Schedule, Bracket and Leaderboard tabs
- Tournament registration and verified team creation flows
- Live Match Center with scoreboard and match-event feed
- Upcoming matches and organizer-published results
- Team directory, profiles, sorting and community-created teams
- Player directory, profiles, ratings, ranks and performance history
- Leaderboard for teams and players with filters and sorting
- Demo account signup/login and password recovery
- Organizer control center with tournament creation, registration decisions, result publishing and announcements
- Public announcement center with search and category filters
- Support ticket generation with ticket IDs
- My Activity dashboard for local account, registration, team and support history
- Team comparison, Arena Season, Schedule, Bracket and Prize Center views
- Demo-data export and clear controls
- Rules, FAQ, About and Privacy pages
- Branded 404 page
- Responsive dark red/black KLU Arena visual system
- Shared JavaScript for navigation, search, notifications and bookmarks

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser LocalStorage for the college-project demo state
- GitHub for version control

## Main pages

- `index.html` — homepage
- `tournaments.html` — tournament discovery
- `tournament-details.html` — tournament detail, schedule, bracket and leaderboard
- `register.html` — tournament registration
- `sports.html` / `esports.html` — competition categories
- `matches.html` / `match.html` — match center and live match
- `leaderboard.html` — rankings
- `teams.html` / `team-profile.html` — teams
- `players.html` / `player-profile.html` — players
- `create-team.html` — verified team creation
- `organizer.html` — organizer control center
- `announcements.html` — public updates
- `my-activity.html` — player activity dashboard
- `compare.html` — team comparison
- `season.html` — season overview
- `schedule.html` — schedule view
- `bracket.html` — knockout bracket
- `prizes.html` — prize center
- `login.html` / `signup.html` / `forgot-password.html` — demo account flow
- `about.html` / `rules.html` / `faq.html` / `contact.html` / `privacy.html` — information and support
- `404.html` — branded not-found page

## Run locally

Because this is a static front-end project, you can open `index.html` directly in a browser. For the best development experience, use the VS Code Live Server extension.

## Deployment

The repository is structured for GitHub Pages deployment from the `main` branch root. GitHub Pages itself must be enabled in repository Settings → Pages.

## Important project limitation

This is a **college-project demo**, not a production backend. Tournament records, authentication, live scores, organizer data and submissions are currently simulated with page data and browser LocalStorage. A production version should add secure authentication, a real database, server-side validation, role-based organizer access, real-time match updates, persistent prize records and secure deployment configuration.
