import { Document, model, Schema } from "mongoose"

export interface IPrivateCompany extends Document {
  companyType: string,
  name: string,
  shortName: string,
  parValue: number,
  revenue: number,
  owningPlayerNumber: number,
  biddingPlayerNumberToAmountMap: Map<string, number>,
  bidOrder: number
}

export const PrivateCompanySchema = new Schema({
  companyType: {type: String, default: "PRIVATE"},
  name: String,
  shortName: String,
  parValue: Number,
  revenue: Number,
  owningPlayerNumber: {type: Number, default: -1},
  biddingPlayerNumberToAmountMap: {
    type: Map,
    of: Number,
    default: {}
  },
  bidOrder: Number
});

export const PrivateCompany = model<IPrivateCompany>('privateCompany', PrivateCompanySchema);
