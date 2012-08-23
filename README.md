[![build status](https://secure.travis-ci.org/deremer/Bloodmoney.png)](http://travis-ci.org/deremer/Bloodmoney)
Bloodmoney
============

## What's Bloodmoney

A very simple caching system using Redis. The primary use case is to see if data already exists in the cache, and if so return that data. If an entry in the cache does not exist then the new data is inserted and returned to the caller. The creation of the cache bank allows the developer to set a default expiration for each cached item, or each item can be assigned it's own unique expiration, or none at all. Items can be put in the "lockbox" to persist. See the test file and the source for additional functions.

## Setup & see how it works

1. npm install bloodmoney
2. configure 'config' in test/test.js to reach your redis server
   (NOTE: running test.js will flush all keys, it is recommended to use a new redis-to-go free db for testing)
3. run $ node test/test.js (BE CAREFUL, this will flush all keys!)
4. check your console to verify output


## Configure the server:

Redis-to-go:

```javascript
var redisUrl = url.parse('redis://db:key@server.redistogo.com:port/'), // Replace with real URL
		redisAuth = redisUrl.auth.split(':'),
		config = { 'host' : redisUrl.hostname, 'port' : redisUrl.port, 'db' : redisAuth[0], 'pass' : redisAuth[1]};
```

Any Redis Server:

```javascript
var	config = {
		port : 0000,
		host : 'server.redistogo.com',
		pass : 'yourcrazylookingkey'
};
```

## Create a bank:

```javascript
// Create the cache bank with a default expiration of 1 hour
var myBank = new bloodmoney.BloodBank(config, 'myBank', 3600);

// Create the cache bank with no default expiration
var myEternalBank = new bloodmoney.BloodBank(config, 'myEternalBank');
```

## Make a bank inquiry:

```javascript
// Make an inquiry using the default expiration policy
myBank.inquire('key1', 'new value', null, function (err, res) {
	if (err) { console.log(err); }
	else { console.log(res); }
});

// Make an inquiry using a function to provide the value and override the default expiration policy
myBank.inquire('keyNewTwo', myFunction('david',Date.now()), 100000, function (err, res) {
		if (err) { console.log(err); }
		else { console.log(res); }
	});
```