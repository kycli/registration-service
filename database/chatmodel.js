var uuid = require("uuid");
var db = require("../app");
var config = require("../config");
var couchbase = require("couchbase");
var N1qlQuery = require('couchbase').N1qlQuery;

function ChatModel() { };

ChatModel.create = function(data, callback) {
    docId = "chat~" + uuid.v4();
    msgRecord = {"recTimestamp": Date.now(), "msgContent": data.message};
    msgDocument = {"id": docId, "sessionId": data.sessionId, "sessionContent": [msgRecord]};
    
    db.bucket.insert(docId, msgDocument, function(error, result) {
        if(error) {
            return callback(error, null);
        }
        return callback(null, result);
    });
}

ChatModel.createOrAppend = function(data, callback) {
    var statement = "SELECT id, sessionContent " +
                    "FROM `" + config.couchbase.bucket + "`" +
                    "WHERE sessionId = '" + data.sessionId + "'" +
                    "ORDER BY id DESC LIMIT 1";

    var query = N1qlQuery.fromString(statement);//.consistency(N1qlQuery.Consistency.REQUEST_PLUS);
    db.bucket.query(query, function(error, check) {
        if(error) {
            return callback(error, null);
        }
        if (!!check) {
            return ChatModel.create(data, callback);
        }
        else {
            db.bucket.get(check.id, function(error, result) {
                if (error) {
                    throw error;
                }
                console.log("existing data: " + result.value);

                msgRecord = {"recTimestamp": Date.now(), "msgContent": data.message};
                msgDocument = result.push(msgRecord)
        
                db.bucket.upsert(docId, msgDocument, function(error, result) {
                    if (error) throw error;
                });   
            });  
        }    
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
    var statement = "SELECT sessionContent " +
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