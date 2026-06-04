# Bets feature:

- users bet on a Game result
- bet can be added/edited only to a Game which has not started yet (kickoffAt < now)
- users can bet only on Games in Tournaments added to their Groups
- after the game result is updated, each bet assigned to this game will have a betResult filled with one of the values:
-   - EXACT_SCORE - user predicted the exact score
-   - CORRECT_OUTCOME - user has predicted the winner of the game (or a tie) but not the exact score
-   - INCORRECT - user has not predicted the correct outcode or has not provided the bet at all
