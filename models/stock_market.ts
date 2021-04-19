import { Document, model, Schema } from "mongoose"

// properties of a row to map to the price value list
// rows are all a subsection of the price value list - with a different initial offset and length
export interface MappedRow {
  mappedStartIndex: number,
  length: number,
}

export interface IStockMarket extends Document {
  // ordered list of stock market slot price values
  prices: number[];
  // map rows and their properties
  rows: MappedRow[];
  // all the stock market slots that major companies populate
  // the key is the single digit row + double digit column of the 18MEX stock chart
  // the value is the ordered list of companies in that stock slot
	activeStockSlots: Map<string, string[]>;
  // major company short name to active stock slot key
  companyToStockSlotKey: Map<string, string>;
}

export const StockMarketSchema = new Schema({
  prices: [Number],
  rows: [{
    mappedStartIndex: Number,
    length: Number,
  }],
  activeStockSlots: {
    type: Map,
    of: [String]
  },
  companyToStockSlotKey: {
    type: Map,
    of: String
  },
});

export const StockMarket = model<IStockMarket>('stockMarket', StockMarketSchema);
