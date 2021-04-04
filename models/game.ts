import { Document, model, Schema } from "mongoose"
import { IBank, BankSchema } from './bank';
import { IPlayer, PlayerSchema } from './player';
import { IPrivateCompany, PrivateCompanySchema } from './private_company';
import { IMinorCompany, MinorCompanySchema } from './minor_company';

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
    enum: ["AUCTION", "PRIVATE_AUCTION", "STOCK", "OPERATING", "MERGING"],
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
  }
});

export const Game = model<IGame>('game', GameSchema);
