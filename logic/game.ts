import {IGame, Game} from '../models/game';
import {IPlayer, Player} from '../models/player';
import {IBank, Bank} from '../models/bank';
import {IPrivateCompany, PrivateCompany} from '../models/private_company';
import {IMinorCompany, MinorCompany} from '../models/minor_company';

export function initNewGame(numPlayers: number): IGame {
  const newGame = new Game();

  const players = new Map();
  for (let i = 0; i < numPlayers; i++) {
    const player = new Player();
    player.playerNumber = i;
    if (numPlayers === 3) {
      player.money = 625;
    } else if (numPlayers === 4) {
      player.money = 500;
    } else {
      player. money = 450;
    }
    players.set("" + i, player);
  }

  newGame.priorityDealPlayerNumber = Math.floor(Math.random() * numPlayers);
  newGame.currentPlayerTurn = newGame.priorityDealPlayerNumber;
  if (numPlayers === 3) {
    newGame.playerCertificateLimit = 19;
  } else if (numPlayers === 4) {
    newGame.playerCertificateLimit = 14;
  } else {
    newGame.playerCertificateLimit = 11;
  }
  newGame.playerMap = players;
  newGame.bank = new Bank();

  newGame.privateCompanyMap = initPrivateCompanies();
  newGame.minorCompanyMap = initMinorCompanies();
  return newGame;
};

function initPrivateCompanies(): Map<string, IPrivateCompany> {
  const mcar = getPrivateCompany(
    "MCAR", "Mexico City-Acapulco Railroad", 20, 5, 1);
  const kcmor = getPrivateCompany(
    "KCMOR", "Kansas City, Mexico, & Orient Railroad", 40, 10, 2);
  const mir = getPrivateCompany(
    "MIR", "Mexican International Railroad", 100, 20, 6);
  const mnr = getPrivateCompany(
    "MNR", "Mexican National Railroad", 140, 20, 7);
  return [mcar, kcmor, mir, mnr].reduce(function(map: Map<string, IPrivateCompany>, company) {
    map.set(company.shortName, company);
    return map;
  }, new Map());
};

function getPrivateCompany(
  shortName: string,
  name: string,
  parValue: number,
  revenue: number,
  bidOrder: number,
  ): IPrivateCompany {
  const privateCompany = new PrivateCompany();
  privateCompany.shortName = shortName;
  privateCompany.name = name;
  privateCompany.parValue = parValue;
  privateCompany.revenue = revenue;
  privateCompany.bidOrder = bidOrder;
  return privateCompany;
}

function initMinorCompanies(): Map<string, IMinorCompany> {
  const ir = getMinorCompany(
    "IR", "Interoceanic Railroad", 50, 0, 3);
  const sbcr = getMinorCompany(
    "SBCR", "Sonora-Baja California Railroad", 50, 0, 4);
  const sr = getMinorCompany(
    "SR", "Southeastern Railway", 50, 0, 5);
  return [ir, sbcr, sr].reduce(function(map: Map<string, IMinorCompany>, company) {
    map.set(company.shortName, company);
    return map;
  }, new Map());
};

function getMinorCompany(
  shortName: string,
  name: string,
  parValue: number,
  revenue: number,
  bidOrder: number
  ): IMinorCompany {
  const minorCompany = new MinorCompany();
  minorCompany.shortName = shortName;
  minorCompany.name = name;
  minorCompany.parValue = parValue;
  minorCompany.revenue = revenue;
  minorCompany.bidOrder = bidOrder;
  return minorCompany;
}

export function getNextPlayer(playerNumber: number, game: IGame): number {
  const numPlayers = game.playerMap.size;
  return (playerNumber + 1) % numPlayers;
}

// delegated Response from a function that isn't a routed API
export interface Response {
  // hasRes determines if there are values for status, error, and message
  hasRes: boolean;
  status?: number;
  error?: string;
  message?: string;
  values?: any;
}


