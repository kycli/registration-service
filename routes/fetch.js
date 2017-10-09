var express = require('express');
var router = express.Router();

var chatModel = require("../database/chatmodel");

/* GET home page. */
router.get('/', function(req, res, next) {
  cconsole.log("req: "+req.connection.remoteAddress);
  chatModel.getSessionAll(req.connection.remoteAddress, function(error, result) {
    if(error) {
        return res.status(400).send(error);
    }
    return res.send(result);
  });
});

module.exports = router;
