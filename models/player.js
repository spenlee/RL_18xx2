const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
  player_number: Number,
  money: Number
});

const Player = mongoose.model('player', PlayerSchema);

module.exports = {
  Player,
  PlayerSchema
};