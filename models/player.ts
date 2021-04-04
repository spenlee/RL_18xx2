import { Document, model, Schema } from "mongoose"

export interface IPlayer extends Document {
  playerNumber: number;
  money: number;
}

export const PlayerSchema = new Schema({
  playerNumber: Number,
  money: Number
});

export const Player = model<IPlayer>('player', PlayerSchema);
