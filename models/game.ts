import { Document, model, Schema } from "mongoose"
import { IBank, BankSchema } from './bank';
import { IPlayer, PlayerSchema } from './player';
import { IPrivateCompany, PrivateCompanySchema } from './private_company';
import { IMinorCompany, MinorCompanySchema } from './minor_company';
import { IStockMarket, StockMarketSchema } from './stock_market';
import { IMajorCompany, MajorCompanySchema } from './major_company';

export interface PrivateOffer {
  fromPlayerNumber: number,
  toPlayerNumber: number,
  type: string,
  amount: number,
  privateCompanyName: string
}

export interface IGame extends Document {
  priorityDealPlayerNumber: number,
  currentPlayerTurn: number,
  hasGameEnded: boolean,
  winningPlayer: IPlayer,
  consecutivePasses: number,
  playerMap: Map<string, IPlayer>,
  bank: IBank,
  phase: string,
  roundType: string,
  roundNumber: number,
  playerCertificateLimit: number,
  privateCompanyMap: Map<string, IPrivateCompany>,
  minorCompanyMap: Map<string, IMinorCompany>,
  privateOffer: PrivateOffer,
  stockMarket: IStockMarket,
  majorCompanyMap: Map<string, IMajorCompany>,
}

export const GameSchema = new Schema({
  priorityDealPlayerNumber: Number,
  currentPlayerTurn: Number,
  hasGameEnded: {type: Boolean, default: false},
  winningPlayer: PlayerSchema,
  consecutivePasses: {type: Number, default: 0},
  playerMap: {
    type: Map,
    of: PlayerSchema,
    default: {}
  },
  bank: BankSchema,
  phase: {
    type: String,
    enum: ["1", "2", "3", "3.5"], // TODO: how many phases are there?
    default: "1"
  },
  roundType: {
    type: String,
    enum: ["AUCTION", "PRIVATE_AUCTION", "STOCK", "OPERATING", "MERGING", "PRIVATE_OFFER"],
    default: "AUCTION"
  },
  roundNumber: {type: Number, default: 1},
  playerCertificateLimit: Number,
  privateCompanyMap: {
    type: Map,
    of: PrivateCompanySchema,
    default: {}
  },
  minorCompanyMap: {
    type: Map,
    of: MinorCompanySchema,
    default: {}
  },
  privateOffer: {
    fromPlayerNumber: Number,
    toPlayerNumber: Number,
    type: String,
    amount: Number,
    privateCompanyName: String
  },
  stockMarket: StockMarketSchema,
  majorCompanyMap: {
    type: Map,
    of: MajorCompanySchema,
    default: {}
  },
});

export const Game = model<IGame>('game', GameSchema);
