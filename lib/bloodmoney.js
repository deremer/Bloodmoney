/**********************************************************
 *
 * BLOODMONEY
 * Redis Cache Banking System
 *   An extremely simple way to cache data.
 *   If the key doesn't exist, its value is cached
 *	 If the key already exists, it's cached value is returned
 *
 * 2011 Grande Labs, Inc.
 * Authors: David DeRemer
 * https://github.com/deremer
 *   
 *
 **********************************************************/
 
 
/**********************************************************
 * Module dependencies.
 **********************************************************/
 
var redis = require("redis"),
		assert = require("assert");


/**********************************************************
 * BloodBank.
 *
 * @Param {Object} config: config details for redis
 *	(e.g., var config = { port : XXXX, host : 'host', pass : 'pass'})
 * @Param {String} name: the name of the cache bank
 * @Param {String} expires: default expiration for new deposits
 *
 **********************************************************/

var BloodBank = function (config, name, expires) {

	if (config && name) {
		var self = this;
		this.id = "BLOODBANK:" + name; // Identifier of the bank
		
		// Create redis cache bank client
		this.	client = redis.createClient(config.port, config.host);
		
		// If authorization is required    
		if (config.pass) {
			this.client.auth(config.pass, function (err, res) {
			  if (err) { aError(err, self.id);}
			  if (res.toString() != 'OK') { aError('Redis Authorization Failed', self.id); }
			});
		}
		
		// Print to console that publisher started
		console.log('STARTED: ' + this.id);
		
		this.client.on('ready', function() {
			// console.log('READY: ' + self.id); 	
		})
		
		// If client ends, throw an error
	  this.client.on('end', function() {
			// aError('CONNECTION ENDED:', self.id); 	
		});
		
		// Handle error if there is a problem
		this.client.on('error', function (error) {
			if (error) { aError(error, self.id); }
			else { aError('Received undefined error', self.id); }
	  });
		
	} else { aError('Missing required parameters — config/name'); }
	
	if (expires && Number(expires) != 'NaN') { this.defaultExpiration = expires; }
	
};


/**********************************************************
 * BloodBank.deposit
 * (sets a key and it's expiration, if provided) 
 *
 * @Param {String} key: redis key for cached item
 * @Param {String} value: redis key for cached item
 * @Param {Number} expires: time to live in seconds for cached item 
 * @Param {Function} callback: function to callback to after finishing 
 *
 **********************************************************/

BloodBank.prototype.deposit = function(key, value, expires, callback) {

	var self = this;
	
	var exp;
	if (expires && Number(expires) != 'NaN') { exp = expires; }
	else if (this.defaultExpiration) { exp = this.defaultExpiration; }
	
	if (key && value) {
		if (exp) {
			this.client.setex(key, exp, value, function (err, rep) {
				finish(err, rep, self.id, key, callback);
			});	
		} else {
			this.client.set(key, value, function (err, rep) {
				finish(err, rep, self.id, key, callback);
			});
		}
	} else { finish('Missing key and/or value', null, self.id, key, callback); }
};


/**********************************************************
 * BloodBank.withdrawal
 * (retrieves the value for a key)
 *
 * @Param {String} key: redis key for cached item
 * @Param {Function} callback: function to callback to after finishing 
 *
 **********************************************************/

BloodBank.prototype.withdrawal = function(key, callback) {
	
	var self = this;
	
	if (key) {
		this.client.get(key, function (err, rep) {
	  	finish(err, rep, self.id, key, callback);
	  }); 
	} else { finish('Missing key', null, self.id, key, callback); }
};


/**********************************************************
 * BloodBank.lockbox
 * (sets a key to never expire)
 *
 * @Param {String} key: redis key for cached item
 * @Param {Function} callback: function to callback to after finishing 
 *
 **********************************************************/

BloodBank.prototype.lockbox = function(key, callback) {
	
	var self = this;
	
	if (key) {
		this.client.persist(key, function (err, rep) {
	  	if (err) { finish(err, rep, self.id, key, callback); }
			else {
				if (rep == 0) {
					self.client.exists(key, function (err, rep) {
						var error, reply;	
						if (err) { error = err; }
						if (rep == 0) { error = 'Key does not exist'; }
						else { reply = 'Key did not have a timeout'; } 
						finish(error, reply, self.id, key, callback);
					});
				} else { finish(err, rep, self.id, key, callback); }
			}
	  });
	} else { finish('Missing key', null, self.id, key, callback); }
};


/**********************************************************
 * BloodBank.balance
 * (gets the remaining time to live for a key)
 *
 * @Param {String} key: redis key for cached item
 * @Param {Function} callback: function to callback to after finishing 
 *
 **********************************************************/

BloodBank.prototype.balance = function(key, callback) {
	
	var self = this;
	
	if (key) {
		this.client.ttl(key, function (err, rep) {
			if (err) { finish(err, rep, self.id, key, callback); }
			else {
				if (rep == -1) {
					self.client.exists(key, function (err, rep) {
						var error, reply			
						if (err) { error = err; }
						if (rep = 0) { error = 'Key does not exist'; }
						else { reply = 'Key did not have a timeout'; } 
						finish(error, reply, self.id, key, callback);
					});
				} else { finish(err, rep, self.id, key, callback); }
			}
	  });
	} else { finish('Missing key', null, self.id, key, callback); }
};


/**********************************************************
 * BloodBank.inquire
 * (see if a cache exists, if yes->return value, if no->cache new value)
 *
 * @Param {String} key: redis key for cached item
 * @Param {Function} callback: function to callback to after finishing 
 *
 **********************************************************/

BloodBank.prototype.inquire = function(key, value, expires, callback) {

	var self = this;
	
	this.withdrawal(key, function(error, reply) {
		if (error) { callback(error); }
		else if (reply) {
			console.log('Cache Withdrawal Key:' + key);
			callback(null, reply); 
		}
		else {
			self.deposit(key, value, expires, function(error, reply) {
				if (error) { callback(error); }
				else { callback(null, value); }		
			});		
		}
	});
};


/**********************************************************
 * Support functions.
 **********************************************************/
 
var finish = function (error, reply, id, key, callback) {
	if (callback) { callback(error, reply); }
	else {
		if (error) { aError(error, id, key); }
		else { aSuccess(reply, id, key); } 
	}
}

var aError = function (err, id, key, value) {
	var toPrint = 'FAILURE: ';
	if (id) { toPrint += id; }
	if (err) { toPrint += ' ERROR:' + err; }
	else { toPrint += ' ERROR:Undefined Error'; }
	if (key) { toPrint += ' KEY:' + key; }
	if (value) { toPrint += ' VALUE:' + value; }
	console.log(toPrint);
};

var aSuccess = function (res, id, key, value) {
	var toPrint = 'SUCCESS: ';
	if (id) { toPrint += id; }
	if (res) { toPrint += ' RESULT:' + res; }
	else { toPrint += ' RESULT: Null Result (key does not exist)'; }
	if (key) { toPrint += ' KEY:' + key; }
	if (value) { toPrint += ' VALUE:' + value; }
	console.log(toPrint);
};


/**********************************************************
 * Exports.
 **********************************************************/

exports.BloodBank = BloodBank;



