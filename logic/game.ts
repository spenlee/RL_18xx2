import {IGame, Game} from '../models/game';
import {IPlayer, Player} from '../models/player';
import {IBank, Bank} from '../models/bank';
import {IPrivateCompany, PrivateCompany} from '../models/private_company';
import {IMinorCompany, MinorCompany} from '../models/minor_company';
import {IStockMarket, StockMarket, MappedRow} from '../models/stock_market';
import {IMajorCompany, MajorCompany, StockCertificates} from '../models/major_company';

// delegated Response from a function that isn't a routed API
export interface Response {
  // hasRes determines if there are values for status, error, and message
  hasRes: boolean;
  status?: number;
  error?: string;
  message?: string;
  values?: any;
}

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
  newGame.stockMarket = initStockMarket();
  newGame.majorCompanyMap = initMajorCompanies();
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

function initStockMarket(): IStockMarket {
  const stockMarket = new StockMarket();
  stockMarket.prices = [10, 20, 30, 40, 45, 50, 55, 60, 65, 70, 75, 80, 90, 100, 110, 120, 130, 140, 150, 165, 180, 200];
  stockMarket.rows = [
    {
      mappedStartIndex: 7,
      length: 15,
    },
    {
      mappedStartIndex: 6,
      length: 15,
    },
    {
      mappedStartIndex: 5,
      length: 14,
    },
    {
      mappedStartIndex: 4,
      length: 12,
    },
    {
      mappedStartIndex: 3,
      length: 9,
    },
    {
      mappedStartIndex: 2,
      length: 5,
    },
    {
      mappedStartIndex: 1,
      length: 5,
    },
    {
      mappedStartIndex: 0,
      length: 1,
    },
  ];
  return stockMarket;
};

function initMajorCompanies(): Map<string, IMajorCompany> {
  // NDM: 2 5% certificates
  const ndm = getMajorCompany(
    "NDM", "National Railways of Mexico", getStockCertificates(1, 7, 2));
  const pr = getMajorCompany(
    "FCP", "Pacific Railroad", getCommonStockSpread());
  const mr = getMajorCompany(
    "MR", "Mexican Railway", getCommonStockSpread());
  // UDY: 1 10% reserved certificate. It doesn't count for float or toward ownership until after SR closes
  const udy = getMajorCompany(
    "UDY", "United Railways of Yucatan", getStockCertificates(1, 7, 0), 1);
  const chi = getMajorCompany(
    "CHI", "Chihuahua Pacific Railway", getCommonStockSpread());
  const mcr = getMajorCompany(
    "MCR", "Mexican Central Railway", getCommonStockSpread());
  const tm = getMajorCompany(
    "TM", "Texas-Mexican Railway", getCommonStockSpread());
  const sud = getMajorCompany(
    "SUD", "Southern Pacific Railroad of Mexico", getCommonStockSpread());
  return [ndm, pr, mr, udy, chi, mcr, tm ,sud].reduce(function(map: Map<string, IMajorCompany>, company) {
    map.set(company.shortName, company);
    return map;
  }, new Map());
};

function getMajorCompany(
  shortName: string,
  name: string,
  ipoCerts: StockCertificates,
  reservedCerts?: number,
  ): IMajorCompany {
  const majorCompany = new MajorCompany();
  majorCompany.shortName = shortName;
  majorCompany.name = name;
  majorCompany.ipoCerts = ipoCerts;
  majorCompany.reservedCerts = reservedCerts ?? 0;
  return majorCompany;
}

function getCommonStockSpread(): StockCertificates {
  return {
    twenty: 1,
    ten: 8,
    five: 0,
  };
}

function getStockCertificates(twenty: number, ten: number, five: number): StockCertificates {
  return {
    twenty: twenty,
    ten: ten,
    five: five,
  };
}
