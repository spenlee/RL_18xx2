const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameStateSchema = new Schema({
  name: {
    type: String,
    required: [true, 'The name text field is required']
  }
})

const GameState = mongoose.model('gamestate', GameStateSchema);

module.exports = GameState;
