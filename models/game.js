const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {PlayerSchema} = require('../models/player');
const {BankSchema} = require('../models/bank');

const GameSchema = new Schema({
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

const Game = mongoose.model('game', GameSchema);

module.exports = Game;
