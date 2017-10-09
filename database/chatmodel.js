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
    db.bucket.query(query, function(error, result1) {
        if(error) {
            return callback(error, null);
        }
        if ( result1.length==0) {
            return ChatModel.create(data, callback);
        }
        else {
            db.bucket.get(result1[0].id, function(error, result) {
                if (error) {
                    throw error;
                }
                cconsole.log("existing data: " + JSON.stringify(result));

                msgRecord = {"recTimestamp": Date.now(), "msgContent": data.message};
                mcount = result.value.sessionContent.push(msgRecord)
                msgDocument = result;
        
                db.bucket.upsert(result.value.id, msgDocument, function(error, result) {
                    if (error) throw error;
                    return callback(null, result);
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
        console.log(statement);
        console.log("reuslts: "+JSON.stringify(result));
        callback(null, result);
    });
};
module.exports = ChatModel;