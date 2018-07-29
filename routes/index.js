var express = require('express');
var router = express.Router();
var clients = require('../clients/clients');

/* GET home page. */

router.get('/:client', function(req, res, next) {
  var client = clients[req.params.client];
  console.log(client.logo);
  res.render('clients/' + req.params.client, {title: client.title, path: client.path, logo: client.logo});
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'VIVA E-Commerce', logo: 'images/android-logo.png' });
});

module.exports = router;
