# Game feature

- Games are added to a Tournament
- only a Group admin to which the Tournament is added to can add or edit a Game
- Game reflects a football match - has 2 teams (home and away), kickoff time and scoreline, which is empty for an upcoming game
- Game is trated as 'finished' is kickoff date has passed - even if the score is not provided yet
- Group admin can edit the score if the game is finished
- after the game score is added/ updated all Bets assigned to this Game are checked to determine the betResult
