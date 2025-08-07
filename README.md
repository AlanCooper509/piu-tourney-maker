# squidwardyell
Pump It Up Tournament Builder/Leaderboard Web App

## Tech Stack
  - Backend Hosting: Supabase
  - Frontend Hosting: Netlify/Vercel (React)

## Running Locally
- **Prerequisite:** Install [Node.js](https://nodejs.org/)
- Clone this repository:
  ```bash
  git clone https://github.com/jaekim019/squidwardyell
  ```
- Install dependencies:
  ```bash
  npm install
  ```
- Run the dev server:
  ```bash
  npm run dev
  ```

## Planned Features
Features/Considerations to implement as of 08/04/25:

### ADMIN
  - OAuth login
  - View/Select associated tournaments
  - Create new tournament (gauntlet only for now)
    - Tourney form:
      - Name/Start Date/End Date
      - Add/Edit/Remove Players: 
        - Player form: Name
      - Add/Edit/Remove Rounds: 
        - Round form:
          - Add Chart to chart pool list
            - Need a Chart DB to pull updated list of charts from
            - form fields: type (S/D) level (01 to 29) name (str) image url (str)
          - Specify Chart Selection logic (uniform random for now)
           - Add player advancement cutoff (no double elim logic for now)
           - Specify scoring convention (only TOTAL SCORE for now)
  - Edit existing tournament
    - add/edit/remove players
    - buttons to start/end the tournament
      - Logic to automatically place all players in first round
    - edit existing tournament name
    - edit existing round details
      - buttons to start/end round (and draw the confirmed charts?)
      - Override logic to be able to manually add/remove a tourney player into a round
      - Override logic to edit/remove chart from chart pool list or re-draw chart
      - edit advancement cutoff prior to round conclusion
    - input scores
      - round --> chart --> player --> score value

### SPECTATOR
  - View/Select active or past tournaments
  - View/Select any of a tournaments' rounds
  - View Leaderboard and progress of scores for that round
    - Show player name, cumulative score, and expand for individual chart scores
  - Live updating leaderboard (sockets or Supabase Realtime?)
