import { Document, model, Schema } from "mongoose"

export interface StockSlot {
  coordinate: Coordinate,
  price: number,
  color: string,
  isParValueSlot: boolean,
}

// chart coordinates
export interface Coordinate {
  row: number,
  column: number,
}

export interface IStockMarket extends Document {
  // all the stock market slots that major companies populate
  // the key is the <row>;<column> of the 18MEX stock chart
  // the value is the ordered list of companies in that stock slot
  activeStockSlots: Map<string, string[]>;
  // major company short name to stock slot
  companyToStockSlotKey: Map<string, StockSlot>;
  // stock chart
  // top-left origin 2D grid, 0-index, positively increasing down the x and y axis
  chart: StockSlot[][];
}

export const StockMarketSchema = new Schema({
  activeStockSlots: {
    type: Map,
    of: [String],
    default: {},
  },
  companyToStockSlotKey: {
    type: Map,
    of: String,
    default: {},
  },
  chart: [[{
    coordinate: {
      row: Number,
      column: Number,
    },
    price: Number,
    color: {
      type: String,
      enum: ["NONE", "YELLOW"],
      default: "NONE"
    },
    isParValueSlot: Boolean,
  }]]
});

export const StockMarket = model<IStockMarket>('stockMarket', StockMarketSchema);
