import { Document, model, Schema } from "mongoose"

export interface StockCertificates {
  twenty: number,
  ten: number,
  five: number,
}

export interface IMajorCompany extends Document {
  name: string,
  shortName: string,
  parValue: number,
  money: number,
  hasFloated: boolean,
  lastRunRevenue: number,
  owningPlayerNumber: number,
  playerNumberToCertsOwned: Map<string, StockCertificates>,
  ipoCerts: StockCertificates,
  openMarketCerts: StockCertificates,
  reservedCerts: number,
}

export const MajorCompanySchema = new Schema({
  name: String,
  shortName: String,
  parValue: {type: Number, default: 0},
  money: {type: Number, default: 0},
  hasFloated: {type: Boolean, default: false},
  lastRunRevenue: {type: Number, default: 0},
  owningPlayerNumber: {type: Number, default: -1},
  playerNumberToCertsOwned: {
    type: Map,
    of: {
      twenty: {type: Number, default: 0},
      ten: {type: Number, default: 0},
      five: {type: Number, default: 0},
    },
    default: {}
  },
  ipoCerts: {
    twenty: {type: Number, default: 0},
    ten: {type: Number, default: 0},
    five: {type: Number, default: 0},
  },
  openMarketCerts: {
    twenty: {type: Number, default: 0},
    ten: {type: Number, default: 0},
    five: {type: Number, default: 0},
  },
  reservedCerts: {type: Number, default: 0}
});

export const MajorCompany = model<IMajorCompany>('majorCompany', MajorCompanySchema);
