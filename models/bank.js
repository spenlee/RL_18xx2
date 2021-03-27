const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BankSchema = new Schema({
  money: {type: Number, default: 9000}
});

const Bank = mongoose.model('bank', BankSchema);

module.exports = {
	Bank,
	BankSchema
};
