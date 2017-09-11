'use strict';

var express = require('express');
var router = express.Router();

const promise = require('bluebird');
const options = {
    promiseLib: promise
};

var pgp = require('pg-promise')(options);;
const warrantydb = {
    host: 'centos01',
    port: 5432,
    database: 'warranty',
    user: 'postgres',
    password: 'obiee11g'
};

/* GET users listing. */
router.get('/', function(req, res, next) {
   const db = pgp(warrantydb);
   db.one('SELECT product_label FROM retail_product where product_label like \'%80 GB%\'')
     .then( data => {
         res.send('<p>' + data.product_label + '</p>');
     })
     .catch(error => {
         console.log('Error:', error);
     })
     .finally( () => {
         pgp.end();
     });
});

module.exports = router;
