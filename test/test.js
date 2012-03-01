var bloodmoney = require('../index.js'),
		url = require('url'),
		async = require('async');


// Setup REDIS-TO-GO
var redisUrl = url.parse('redis://db:key@server.redistogo.com:port/'), // Replace with real URL
		redisAuth = redisUrl.auth.split(':'),
		config = { 'host' : redisUrl.hostname, 'port' : redisUrl.port, 'db' : redisAuth[0], 'pass' : redisAuth[1]};

/* Alternate REDIS Setup Method
var	config = {
		port : 6379,
		host : 'localhost',
		pass : ''
};
*/

// Create the cache bank with a default expiration of 1 hour
var myBank = new bloodmoney.BloodBank(config, 'myBank', 3600);

// Create the cache bank with no default expiration
var myEternalBank = new bloodmoney.BloodBank(config, 'myEternalBank');


// A function to test functions as key values
var myFunction = function(name, date) {
	return name + ' @ ' + date;
}

var testCount = 1;

var wait = function(callback) {
	var next = function() {
		console.log('-------------TEST: ' + testCount + ' -------------');
		testCount++;
		callback()
	}
	setTimeout(next, 1000);
}


// Deposits
var makeDeposits = function(callback) {
	
	myBank.deposit('key1','value1');
	myBank.deposit('key2','value2', null, function (err, res) {
		if (err) { console.log('Deposit Error for key2: ' + err); }
		else { console.log('Deposit Result for key2: ' + res); }
	});
	myBank.deposit('key3','value3', 10000);
	myBank.deposit('key4', myFunction('david',Date.now()), 100, function (err, res) {
		if (err) { console.log('Deposit Error for key4: ' + err); }
		else { console.log('Deposit Result for key4: ' + res); }
	});
	
	myEternalBank.deposit('keyA','valueA');
	myEternalBank.deposit('keyB','valueB', null, function (err, res) {
		if (err) { console.log('Deposit Error for keyB: ' + err); }
		else { console.log('Deposit Result for keyB: ' + res); }
	});
	myEternalBank.deposit('keyC','valueC', 10000);
	myEternalBank.deposit('keyD', myFunction('david',Date.now()), 100, function (err, res) {
		if (err) { console.log('Deposit Error for keyD: ' + err); }
		else { console.log('Deposit Result for keyD: ' + res); }
	});
	
	callback();
	
}

// Check Balance
var checkBalance = function(callback) {

	myBank.balance('key1');
	myBank.balance('key2');
	myBank.balance('key3');
	myBank.balance('key4', function (err, res) {
		if (err) { console.log('Balance Error for key4: ' + err); }
		else { console.log('Balance Result for key4: ' + res); }
	});
	myBank.balance('nonexistentKey');
	myEternalBank.balance('keyA');
	myEternalBank.balance('keyB');
	myEternalBank.balance('keyC');
	myEternalBank.balance('keyD', function (err, res) {
		if (err) { console.log('Balance Error for keyD: ' + err); }
		else { console.log('Balance Result for keyD: ' + res); }
	});
	
	callback();

}

// Withdrawals
var makeWithdrawals = function(callback) {

	myBank.withdrawal('key1');
	myBank.withdrawal('key2', function (err, res) {
		if (err) { console.log('Withdrawal Error for key2: ' + err); }
		else { console.log('Withdrawal Result for key2: ' + res); }
	});
	myBank.withdrawal('key3');
	myBank.withdrawal('key4', function (err, res) {
		if (err) { console.log('Withdrawal Error for key4: ' + err); }
		else { console.log('Withdrawal Result for key4: ' + res); }
	});
	myBank.withdrawal('nonexistentKey');
	
	callback();

}

// Put in the lockbox
var putLockbox = function(callback) {

	myBank.lockbox('key1');
	myBank.lockbox('key4', function (err, res) {
		if (err) { console.log('Lockbox Error for key4: ' + err); }
		else { console.log('Lockbox Result for key4: ' + res); }
	});
	myBank.lockbox('nonexistentKey');
	
	callback();

}

// Make inquiries
var makeInquiries = function(callback) {

	// Inquire about existing keys
	myBank.inquire('key1', 'new value', null, function (err, res) {
		if (err) { console.log(err); }
		else { console.log(res); }
	});
	myBank.inquire('key2', 'new value 2', 100000, function (err, res) {
		if (err) { console.log(err); }
		else { console.log(res); }
	});
	
	// Inquire about new keys
	myBank.inquire('keyNewOne', 'new value 3', null, function (err, res) {
		if (err) { console.log(err); }
		else { console.log(res); }
	});
	
	myBank.inquire('keyNewTwo', myFunction('david',Date.now()), 100000, function (err, res) {
		if (err) { console.log(err); }
		else { console.log(res); }
	});
	
	callback();

}

// Put in the lockbox
var putLockboxAgain = function(callback) {

	myBank.lockbox('key1');
		
	callback();

}

// Check Balance Again
var checkBalanceAgain = function(callback) {

	myBank.balance('key1');
	myBank.balance('key2');
	myBank.balance('key3');
	myBank.balance('key4', function (err, res) {
		if (err) { console.log('Re-Balance Error for key4: ' + err); }
		else { console.log('Re-Balance Result for key4: ' + res); }
	});
	
	callback();

}

// Reset
var reset = function(callback) {

	myBank.client.flushall(function(err,res){
		if (err) { console.log(err); }
		else { console.log(res + ': All keys flushed'); }
	});
	
	callback();

}

async.series([
	reset,
	wait,
	makeDeposits,
	wait,
	checkBalance,
	wait,
	makeWithdrawals,
	wait,
	putLockbox,
	wait,
	makeInquiries,
	wait,
	putLockboxAgain,
	wait,
	checkBalanceAgain,
	wait,
	reset
]);