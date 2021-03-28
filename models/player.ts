import { Document, model, Schema } from "mongoose"

export interface IPlayer extends Document {
  player_number: number;
  money: number;
}

export const PlayerSchema = new Schema({
  player_number: Number,
  money: Number
});

export const Player = model<IPlayer>('player', PlayerSchema);
