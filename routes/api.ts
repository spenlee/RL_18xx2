import express from 'express';
import {IGame, Game} from '../models/game';
import {IPlayer} from '../models/player';
import {initNewGame, getNextPlayer, Response} from '../logic/game';
import {throwInvalidInput, throwNotPlayerTurn, getNotEnoughMoneyResponse, throwGameEnded} from '../logic/validation';
import {getOrderedUnownedBiddables} from '../logic/company';
import {handleAuctionFullCirclePass,
  handlePrivateAuctionFullCirclePass,
  handleImmediatePurchase,
  handlePlaceBid,
  validateAuctionCompletion,
  getHighestBid
} from '../logic/auction';

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

/*
expected input:
numPlayers: int 3-5
*/
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

/*
expected input:
playerNumber: int
amount: int
companyShortName: string
pass: boolean
*/
router.post('/bid/:id', (req: any, res: any, next: any) => {
  console.log(`Entering bid with gameId: ${req.params.id}, req: ${JSON.stringify(req.body)}`);

  if (!Number.isInteger(req.body.playerNumber)) {
    return throwInvalidInput(req.body.playerNumber, "playerNumber", res);
  }

  if (!Number.isInteger(req.body.amount)) {
    return throwInvalidInput(req.body.amount, "amount", res);
  }

  if (!(typeof req.body.companyShortName === "string")) {
    return throwInvalidInput(req.body.companyShortName, "companyShortName", res);
  }

  if (!(typeof req.body.pass === "boolean")) {
    return throwInvalidInput(req.body.pass, "pass", res);
  }

  const playerNumber: number = parseInt(req.body.playerNumber);
  const amount: number = parseInt(req.body.amount);
  const companyShortName: string = req.body.companyShortName;
  const pass: boolean = req.body.pass;

  Game.findById(req.params.id)
    .then((game: IGame | any) => {
      if (game.hasGameEnded) {
        return throwGameEnded(game, res);
      }

      if (playerNumber !== game.currentPlayerTurn) {
        return throwNotPlayerTurn(playerNumber, game.currentPlayerTurn, res);
      }

      if (game.roundType !== "AUCTION" && game.roundType !== "PRIVATE_AUCTION") {
        return res.status(400).json({"statusCode": 400,
          "error": "InvalidAction",
          "message": `Game roundType: ${game.roundType} is not AUCTION or PRIVATE_AUCTION`});
      }

      const biddables = getOrderedUnownedBiddables(game);

      if (pass) {
        console.log("PASS");
        game.consecutivePasses += 1;

        if (game.roundType === "AUCTION") {
          const numPlayers = game.playerMap.size;
          if (game.consecutivePasses === numPlayers) {
            console.log("AUCTION full circle pass.");
            const r = handleAuctionFullCirclePass(game, biddables);
            if (r.hasRes) {
              game.save()
                .then((game: IGame) => {
                  res.status(r.status).json({
                    error: r.error,
                    message: r.message,
                    game: game
                  });
                })
                .catch(next);
              return;
            }
          } else {
            console.log("AUCTION NOT full circle pass.");            
            game.currentPlayerTurn = getNextPlayer(playerNumber, game);
          }
        } else {
          // PRIVATE_AUCTION pass
          // The expectation to reach this state is that there is more than 1 bidder and a highest bidder.
          // check if this is a full circle pass where the highest bidder buys and money is returned, or
          // if action falls to the next player.
          const numPlayersBidding = biddables[0].biddingPlayerNumberToAmountMap.size;
          // A full circle is when all players excluding the highest bidder pass
          if (game.consecutivePasses - 1 === numPlayersBidding) {
            console.log("PRIVATE_AUCTION full circle pass.");   
            handlePrivateAuctionFullCirclePass(game, biddables);
          } else {
            console.log("PRIVATE_AUCTION NOT full circle pass.");   
            game.currentPlayerTurn = getNextPlayer(playerNumber, game);
          }
        }
      } else {
        console.log("BID");
        game.consecutivePasses = 0;

        if (!game.privateCompanyMap.has(companyShortName)
          && !game.minorCompanyMap.has(companyShortName)) {
          return throwInvalidInput(companyShortName, "companyShortName", res);
        }
        // A bid is made
        // 1. The lowest valued company is immediately purchased. Execute transaction. Shift priority deal
        // 2. Otherwise add the bid if player has not already bid. Set aside the money to the bid pool. Shift the player turn
        let r: Response = {hasRes: false};
        if (biddables[0].shortName === companyShortName) {
          r = handleImmediatePurchase(game.playerMap.get("" + playerNumber), game, biddables);
        } else {
          r = handlePlaceBid(game, amount, companyShortName);
        }

        if (r.hasRes) {
          return res.status(r.status).json({
            error: r.error,
            message: r.message,
            game: game
          });
        }
      }

      // waterfall auction
      // 1. There are no companies left. Set to STOCK round, Shift the player turn to priority deal
      // 2. The lowest valued company has no bidders. Set to AUCTION
      // 3. The lowest valued company has 1 bidder. Execute transaction. Shift priority deal
      // 4. The lowest valued company has multiple bidders. Set to PRIVATE_AUCTION,
      //   action is on the player after the highest bidder
      while (true) {
        if (biddables.length === 0) {
          const r = validateAuctionCompletion(game);
          if (r.hasRes) {
            return res.status(r.status).json({
              error: r.error,
              message: r.message,
              game: game
            });
          }
          game.roundType = "STOCK";
          game.currentPlayerTurn = game.priorityDealPlayerNumber;
          break;
        } else if (biddables[0].biddingPlayerNumberToAmountMap.size === 0) {
          game.roundType = "AUCTION";
          break;
        } else if (biddables[0].biddingPlayerNumberToAmountMap.size === 1) {
          // only 1 bidding player, handle it the same as a full circle pass - highest bidder buys
          // but it works as a purchase, so priority deal changes
          const buyingPlayerNumber = biddables[0].biddingPlayerNumberToAmountMap.keys()[0];
          handlePrivateAuctionFullCirclePass(game, biddables);
          game.currentPlayerTurn = getNextPlayer(buyingPlayerNumber, game);
          game.priorityDealPlayerNumber = game.currentPlayerTurn;
        } else {
          const highestBid = getHighestBid(biddables[0].biddingPlayerNumberToAmountMap);
          const biddingPlayerNumbers = biddables[0].biddingPlayerNumberToAmountMap.keys();
          biddingPlayerNumbers.sort();
          const nextBidder = biddingPlayerNumbers.indexOf(highestBid.playerNumber) + 1 % biddingPlayerNumbers.length;
          game.roundType = "PRIVATE_AUCTION";
          game.currentPlayerTurn = nextBidder;
          break;
        }
      }

      game.save()
        .then((game: IGame) => {
          res.status(200).json({
            error: '',
            game: game
          });
        })
        .catch(next);
    })
    .catch(next);
});


export default router;
