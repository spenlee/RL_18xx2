import { Document, model, Schema } from "mongoose"
import { IBank, BankSchema } from './bank';
import { IPlayer, PlayerSchema } from './player';

export interface IGame extends Document {
  priority_deal_player_number: number,
  current_player_turn: number,
  has_game_ended: boolean,
  players: IPlayer[],
  bank: IBank,
  phase: string,
  round_type: string,
  round_number: number,
  player_certificate_limit: number
}

export const GameSchema = new Schema({
  priority_deal_player_number: Number,
  current_player_turn: Number,
  has_game_ended: {type: Boolean, default: false},
  players: [PlayerSchema],
  bank: BankSchema,
  phase: {
    type: String,
    enum: ["1", "2", "3", "3.5"], // TODO: how many phases are there?
    default: "1"
  },
  round_type: {
    type: String,
    enum: ["AUCTION", "STOCK", "OPERATING", "MERGING"], // TODO: are there more round_types
    default: "AUCTION"
  },
  round_number: {type: Number, default: 1},
  player_certificate_limit: Number
});

export const Game = model<IGame>('game', GameSchema);
