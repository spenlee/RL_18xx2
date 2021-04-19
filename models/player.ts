import { Document, model, Schema } from "mongoose"
import { StockCertificates } from './major_company';

export interface StockTurnState {
  hasBought: boolean;
  // short names of major companies sold in the stock turn
  majorCompaniesSold: string[];
  hasSoldPrivateCompany: boolean;
}

export interface IPlayer extends Document {
  playerNumber: number;
  money: number;
	stockTurnState: StockTurnState;
  companyToCerts: Map<string, StockCertificates>;
}

export const PlayerSchema = new Schema({
  playerNumber: Number,
  money: Number,
  stockTurnState: {
    hasBought: {type: Boolean, default: false},
    majorCompaniesSold: {type: [String], default: []},
    hasSoldPrivateCompany: {type: Boolean, default: false},
  },
  companyToCerts: {
    type: Map,
    of: {
      twenty: Number,
      ten: Number,
      five: Number,
    },
    default: {}
  },
});

export const Player = model<IPlayer>('player', PlayerSchema);
