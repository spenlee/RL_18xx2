import express from 'express';
import {IGame, Game} from '../models/game';
import {IPlayer, Player} from '../models/player';
import {IBank, Bank} from '../models/bank';

const router = express.Router();

router.get('/game', (req: any, res: any, next: any) => {
  console.log("Hey dad");
  Game.find({})
    .then((games: IGame[]) => res.json(games))
    .catch(next);
});

router.get('/game/:id', (req: any, res: any, next: any) => {
  console.log("Hey dad ", req.params.id);
  Game.findById(req.params.id)
    .then((game: IGame | any) => res.json(game))
    .catch(next);
});

router.post('/game', (req: any, res: any, next: any) => {
  console.log("Hey dad start a new game ", req.body);

  const numPlayers = req.body.numPlayers;
  if (numPlayers === undefined || numPlayers === null || numPlayers < 3 || numPlayers > 5) {
    res.status(400).json({"statusCode": 400, "message": "Choose 3-5 players."});
    return;
  }

  const newGame = initNewGame(numPlayers);

  newGame.save()
    .then((game: IGame) => res.json(game))
    .catch(next);
});

router.delete('/game/:id', (req: any, res: any, next: any) => {
  console.log("Hey dad delete a new game", req.params.id);

  Game.deleteOne({"_id": req.params.id})
    .then((data: any) => res.json(data))
    .catch(next);
});

router.delete('/game', (req: any, res: any, next: any) => {
  console.log("Hey dad delete all the games");

  Game.deleteMany({})
    .then((data: any) => res.json(data))
    .catch(next);
});

function initNewGame(numPlayers: number): IGame {
  const newGame = new Game();

  const players = [];
  for (let i = 0; i < numPlayers; i++) {
    const player = new Player();
    player.player_number = i;
    if (numPlayers === 3) {
      player.money = 625;
    } else if (numPlayers === 4) {
      player.money = 500;
    } else {
      player. money = 450;
    }
    players.push(player);
  }

  newGame.priority_deal_player_number = Math.floor(Math.random() * numPlayers);
  newGame.current_player_turn = newGame.priority_deal_player_number;
  if (numPlayers === 3) {
    newGame.player_certificate_limit = 19;
  } else if (numPlayers === 4) {
    newGame.player_certificate_limit = 14;
  } else {
    newGame.player_certificate_limit = 11;
  }
  newGame.players = players;
  newGame.bank = new Bank();
  return newGame;
};

export default router;
