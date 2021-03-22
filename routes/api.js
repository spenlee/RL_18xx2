const express = require ('express');
const router = express.Router();
const GameState = require('../models/gamestate');

router.get('/gamestate', (req, res, next) => {
  console.log("Hey dad");
  // get all, project 'name' attribute
  GameState.find({}, 'name')
    .then(data => res.json(data))
    .catch(next)
});

module.exports = router;
