var uuid = require("uuid");
var db = require("../app");
var config = require("../config");
var N1qlQuery = require('couchbase').N1qlQuery;

function ChatModel() { };

ChatModel.create = function(data, callback) {
    var chatMessage = {
        id: uuid.v4(),
        sessionId: data.sessionId,
        message: data.message
    };
    db.bucket.insert("chat::" + chatMessage.id, chatMessage, function(error, result) {
        if(error) {
            return callback(error, null);
        }
        return callback(null, result);
    });
}

ChatModel.getAll = function(callback) {
    var statement = "SELECT id, message " +
                    "FROM `" + config.couchbase.bucket + "`";
    var query = N1qlQuery.fromString(statement);//.consistency(N1qlQuery.Consistency.REQUEST_PLUS);
    db.bucket.query(query, function(error, result) {
        if(error) {
            return callback(error, null);
        }
        callback(null, result);
    });
};

ChatModel.getSessionAll = function(sessionId, callback) {
    var statement = "SELECT id, message " +
                    "FROM `" + config.couchbase.bucket + "`" +
                    "WHERE sessionId = '" + sessionId + "'";

    var query = N1qlQuery.fromString(statement);//.consistency(N1qlQuery.Consistency.REQUEST_PLUS);
    db.bucket.query(query, function(error, result) {
        if(error) {
            return callback(error, null);
        }
        callback(null, result);
    });
};
module.exports = ChatModel;