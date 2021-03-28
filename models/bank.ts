import { Document, model, Schema } from "mongoose"

export interface IBank extends Document {
  money: number;
}

export const BankSchema = new Schema({
  money: {type: Number, default: 9000}
});

export const Bank = model<IBank>('bank', BankSchema);
