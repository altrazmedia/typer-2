# Typer

## Overview

Web app that lets groups of friends bet on football match scores. Users predict game results before kickoff and earn points based on prediction accuracy.

A user must belong to a group that has tournaments assigned to it. Each tournament contains a list of games and a leaderboard.

## App Target

Built for a small, private group of friends. It was never intended for a broader audience.


## Core Features

### Groups

- A user can be a member of multiple groups
- The group creator is automatically an admin; a group can have multiple admins
- Only admins can edit the group name and invite new members
- Each tournament is assigned to a single group

### Tournaments

- Assigned to a group
- Only a group admin can create or edit a tournament
- Contains a list of games to bet on
- Only members of the assigned group can view and bet on its games
- Includes a leaderboard showing how many points each member has earned

### Games

- Each game reflects a real football match between two teams
- Only a group admin can add and edit tournament games
- A game is considered **finished** once its kickoff time has passed, even if no scoreline has been entered yet
- Users can submit bets before the game's kickoff time
- After kickoff, the group admin can enter or edit the final scoreline
- Entering or editing a scoreline triggers automatic bet evaluation — each bet is marked as one of:

  `EXACT_SCORE` — user predicted the exact final score

  `CORRECT_OUTCOME` — user predicted the correct outcome (win/draw) but not the exact score

  `INCORRECT` — all other cases, including when the user did not place a bet at all

- The leaderboard awards points for `EXACT_SCORE` and `CORRECT_OUTCOME` based on values configured per tournament; `INCORRECT` bets earn no points

### Bets

- A user can submit one bet per game
- Bets can be edited up until the game's kickoff time
- Once an admin enters a scoreline, all bets for that game are automatically evaluated and points are awarded


## Additional Features

### PWA

The app is installable as a Progressive Web App on mobile devices.

### Push Notifications

The app supports browser push notifications. A daily cron job sends reminders to users who have not yet placed bets on upcoming games.

### MCP

An MCP server allows users to interact with the app's API through their AI assistants. It supports:

- Listing upcoming and finished games in a tournament
- Placing a bet
- Checking the tournament leaderboard

Access to the MCP server is authenticated via an OAuth 2.0 flow built specifically for this integration.


## Language

All user-facing text (labels, buttons, messages, error feedback) is written in **Polish**.
