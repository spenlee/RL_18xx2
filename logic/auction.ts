import {IGame} from '../models/game';
import {IPlayer} from '../models/player';
import {Response, getNextPlayer} from './game';
import {getNotEnoughMoneyResponse} from './validation';

export interface HighestBid {
  playerNumber: number;
  amount: number; 
}

export function handleAuctionFullCirclePass(game: IGame, biddables: any[]): Response {
  if (biddables[0].shortName === "MCAR") {
    if (game.privateCompanyMap.get("MCAR")!.parValue === 0) {
      console.log("AUCTION MCAR special case forced purchase.");

      const mcar = game.privateCompanyMap.get("MCAR")!;
      const player = game.playerMap.get("" + game.currentPlayerTurn)!;

      if (player.money - mcar.parValue < 0) {
        return getNotEnoughMoneyResponse(player.money, mcar.parValue);
      }

      mcar.owningPlayerNumber = game.currentPlayerTurn;
      game.privateCompanyMap.set("MCAR", mcar);

      player.money -= mcar.parValue;
      game.bank.money += mcar.parValue;
      game.playerMap.set("" + game.currentPlayerTurn, player);

      game.consecutivePasses = 0;
      game.currentPlayerTurn = getNextPlayer(game.currentPlayerTurn, game);
      game.priorityDealPlayerNumber = game.currentPlayerTurn;

      biddables.shift(); // MCAR no longer biddable
    } else {
      console.log("AUCTION MCAR special case reduce price.");

      const mcar = game.privateCompanyMap.get("MCAR")!;
      mcar.parValue -= 5;
      game.privateCompanyMap.set("MCAR", mcar);

      game.consecutivePasses = 0;
      game.currentPlayerTurn = getNextPlayer(game.currentPlayerTurn, game);
    }
  } else {
    console.log("Revenue payout.");
    // only private companies pay revenue
    for (const c of game.privateCompanyMap.values()) {
      if (c.owningPlayerNumber === -1) {
        continue;
      }

      const player = game.playerMap.get("" + c.owningPlayerNumber)!;
      player.money += c.revenue;
      game.playerMap.set("" + c.owningPlayerNumber, player);
      game.bank.money -= c.revenue;

      if (game.bank.money <= 0) {
        game.hasGameEnded = true;
        let mostMoney = -1;
        for (const p of game.playerMap.values()) {
          if (p.money > mostMoney) {
            mostMoney = p.money;
            game.winningPlayer = p;
          }
        }

        return {
          hasRes: true,
          status: 200,
          message: `Bank is out of money. Game has ended with winner: ${game.winningPlayer}.`
        };
      }
    }

    game.consecutivePasses = 0;
    game.currentPlayerTurn = getNextPlayer(game.currentPlayerTurn, game);
  }

  return {
    hasRes: false
  };
};


export function handlePrivateAuctionFullCirclePass(game: IGame, biddables: any[]): void {
    // highest bidder buys the company, remove from biddables
    const company = biddables.shift();
    const highestBid = getHighestBid(company.biddingPlayerNumberToAmountMap);
    company.owningPlayerNumber = highestBid.playerNumber;
    company.biddingPlayerNumberToAmountMap.delete("" + highestBid.playerNumber);
    game.bank.money += highestBid.amount;

    // return money to other bidders
    for (const [playerNumber, amount] of company.biddingPlayerNumberToAmountMap) {
      const p = game.playerMap.get("" + playerNumber)!;
      p.money += amount;
      game.playerMap.set("" + playerNumber, p);
    }

    if (company.companyType === "PRIVATE") {
      game.privateCompanyMap.set(company.shortName, company);
    } else {
      game.minorCompanyMap.set(company.shortName, company);
    }

    game.consecutivePasses = 0;
};

export function handleImmediatePurchase(player: IPlayer, game: IGame, biddables: any[]): Response {
  const company = biddables[0];
  const p = game.playerMap.get("" + player.playerNumber)!;
  if (p.money < company.parValue) {
    return getNotEnoughMoneyResponse(p.money, company.parValue);
  }

  company.owningPlayerNumber = player.playerNumber;
  p.money -= company.parValue;
  game.bank.money += company.parValue;
  game.currentPlayerTurn = getNextPlayer(player.playerNumber, game);
  game.priorityDealPlayerNumber = game.currentPlayerTurn;
  biddables.shift();
  if (company.companyType === "PRIVATE") {
    game.privateCompanyMap.set(company.shortName, company);
  } else {
    game.minorCompanyMap.set(company.shortName, company);
  }
  return {
    hasRes: false
  };
};

export function handlePlaceBid(game: IGame, amount: number, companyShortName: string): Response {
  let company;
  if (game.privateCompanyMap.has(companyShortName)) {
    company = game.privateCompanyMap.get(companyShortName)!;
  } else {
    company = game.minorCompanyMap.get(companyShortName)!;
  }

  const p = game.playerMap.get("" + game.currentPlayerTurn)!;
  const highestBid = getHighestBid(company.biddingPlayerNumberToAmountMap);
  if (highestBid.playerNumber === -1) {
    if (amount < company.parValue + 5) {
      return {
        hasRes: true,
        status: 400,
        error: "NotEnoughBid",
        message: `Bid placed: ${amount} is not at least parValue + 5: ${company.parValue + 5}`
      }
    }
  } else if (highestBid.playerNumber === game.currentPlayerTurn) {
    return {
      hasRes: true,
      status: 400,
      error: "PlayerAlreadyBid",
      message: `Player is already the highestBidder for ${company.shortName}`
    }
  } else {
    if (amount < highestBid.amount + 5) {
      return {
        hasRes: true,
        status: 400,
        error: "NotEnoughBid",
        message: `Bid placed: ${amount} is not at least highestBid + 5: ${highestBid.amount + 5}`
      }
    }
  }

  let additionalBidMoney = amount;
  // if player already has a lower bid, player can add to it
  if (company.biddingPlayerNumberToAmountMap.has("" + game.currentPlayerTurn)) {
    additionalBidMoney -= company.biddingPlayerNumberToAmountMap.get("" + game.currentPlayerTurn)!;
  }

  if (p.money < additionalBidMoney) {
    return {
      hasRes: true,
      status: 400,
      error: "NotEnoughMoney",
      message: `Player with money: ${p.money} cannot afford bid placed: ${amount}`
    }
  }

  // bid placement cleared
  company.biddingPlayerNumberToAmountMap.set("" + game.currentPlayerTurn, amount);
  p.money -= additionalBidMoney;
  if (company.companyType === "PRIVATE") {
    game.privateCompanyMap.set(company.shortName, company);
  } else {
    game.minorCompanyMap.set(company.shortName, company);
  }
  game.playerMap.set("" + game.currentPlayerTurn, p);
  game.currentPlayerTurn = getNextPlayer(game.currentPlayerTurn, game);
  return {
    hasRes: false
  }
};

export function getHighestBid(bidMap: Map<string, number>): HighestBid {
  let highestBiddingPlayerNumber = -1;
  let highestBidAmount = -1;
  for (const [playerNumber, amount] of bidMap) {
    if (amount > highestBidAmount) {
      highestBidAmount = amount;
      highestBiddingPlayerNumber = Number.parseInt(playerNumber);
    }
  }

  return {
    playerNumber: highestBiddingPlayerNumber,
    amount: highestBidAmount
  }
};

export function validateAuctionCompletion(game: IGame): Response {
  for (const c of game.privateCompanyMap.values()) {
    if (c.owningPlayerNumber === -1) {
      return {
        hasRes: true,
        status: 500,
        error: "UnownedPrivateCompany",
        message: `${c.shortName} is not owned at the end of the AUCTION round.`
      }
    }
  }

  for (const c of game.minorCompanyMap.values()) {
    if (c.owningPlayerNumber === -1) {
      return {
        hasRes: true,
        status: 500,
        error: "UnownedMinorCompany",
        message: `${c.shortName} is not owned at the end of the AUCTION round.`
      }
    }
  }

  return {
    hasRes: false
  }
}
