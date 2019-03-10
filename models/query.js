var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var QuerySchema = mongoose.Schema({
  patient_name: {
    type: String
  },
  dr_name: {
    type: String
  },
  dda: {
    type: String
  },
  approved: {
    type: String
  },
  tpd: {
    type: String
  },
  mobile: {
    type: String
  }
});

var Query = module.exports = mongoose.model('Queries', QuerySchema);
module.exports.createQuery = function(newQuery, callback){
 newQuery.save(callback);
}