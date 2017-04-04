'use strict';

var path = process.cwd();

module.exports = function (app, passport, session, urli, MongoClient, ObjectId, bodyParser) {

	// Authorized or not
	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) return next();
		else res.sendFile(path + '/public/login.html');
	}
	
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.route('/auth/github').get(passport.authenticate('github'));
	app.route('/auth/github/callback').get(passport.authenticate('github', {successRedirect: '/', failureRedirect: '/'}));

	app.route('/').get(isLoggedIn, function (req, res) {
		res.sendFile(path + '/public/index.html');
	});
	app.route('/my').get(isLoggedIn, function (req, res) {
		res.sendFile(path + '/public/my.html');
	});
	app.route('/new').get(isLoggedIn, function (req, res) {
		res.sendFile(path + '/public/new.html');
	});
	app.route('/logout').get(function (req, res) {
		req.logout();
		res.redirect('/');
	});
    
    // View user name
    app.post('/nameD', function(req, res) {
    	if (req.isAuthenticated()) {
			MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('pinterest-users').find({_id : ObjectId(req.session.passport.user.toString())}).toArray(function(err, data) {
    				if (err) return 0;
    				else res.end(data[0].github.displayName);
    				db.close();
				});
    		});
    	}
    	else res.end('Pinterest Clone');
    });
    
    // Add new image
    app.post('/new', function(req, res) {
    	var url = req.body.url,
    		text = req.body.text;
    	if (req.isAuthenticated()) {
    		var user = req.session.passport.user;
    		MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('pinterest-users').find({_id : ObjectId(req.session.passport.user.toString())}).toArray(function(err, data) {
    				if (err) return 0;
    				else db.collection('pinterest-search').insertMany([{url : url, text : text, num : 0, who: user, whoAvatar: data[0].github.avatar, like: []}], function (err, docs) {
    					if (err) return 0;
						else res.end('OK');
    				});
    				db.close();
    			});
    		});
    	}
    	else res.end('error');
    });
    
    // View list items
    app.post('/view', function(req, res) {
    	var str = '';
    	MongoClient.connect(urli, function(err, db) {
			if (err) return 0;
    		else db.collection('pinterest-search').count(function (e, count) {
    			var k = 0;
				if (count && count > 0) {
    				db.collection('pinterest-search').find().forEach(function(obj) {
    					if (err) return 0;
    					else if (obj.url) {
    						var color = '';
    						for (var i = 0; i < obj.like.length; i++)
    							if (req.isAuthenticated() && obj.like[i] == req.session.passport.user) {
    								color = 'OK';
    								break;
    							}
    						str += obj._id + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + obj.url + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + obj.text + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + obj.num + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + obj.who + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + obj.whoAvatar + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + color + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU';
    						
    					}
    					k++;
    					if (k == count) res.end(str);
    				});
    			}
				else res.end('');
				db.close();
    		});
    	});
    });
    
    // Open user list
    app.post('/userList', function(req, res) {
    	var str = '',
    		who = req.body.who;
    	if (who == null && req.isAuthenticated()) who = req.session.passport.user;
    	MongoClient.connect(urli, function(err, db) {
			if (err) return 0;
    		else db.collection('pinterest-search').find({who : who}).toArray(function(err, data) {
    			if (err) return 0;
    			else if (data && data.length) {
    				for (var i = 0; i < data.length; i++) {
    					var color = '';
    					for (var j = 0; j < data[i].like.length; j++)
    						if (req.isAuthenticated() && data[i].like[j] == req.session.passport.user) {
    							color = 'OK';
    							break;
    						}
    					str += data[i]._id + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + data[i].url + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + data[i].text + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + data[i].num + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + data[i].who + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + data[i].whoAvatar + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + color + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU';
    				}
    				db.collection('pinterest-users').find({_id : ObjectId(who.toString())}).toArray(function(err, data) {
    					if (err) return 0;
    					else if (data && data.length) {
    						str += data[0].github.displayName;
    						res.end(str);
    					}
    					else res.end('');
    				});
    			}
    			else res.end('Your list is empty.');
    			db.close();
    		});
    	});
    });
    
    // Put like
    app.post('/like', function(req, res) {
    	var id = req.body.id;
    	if (req.isAuthenticated()) {
    		var user = req.session.passport.user;
    		MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('pinterest-search').find({_id : ObjectId(id.toString())}).toArray(function(err, data) {
    				if (err) return 0;
    				else if (data && data.length) {
    					var j = 0;
    					for (var i = 0; i < data[0].like.length; i++)
    						if (data[0].like[i] == user) {
    							j = 1;
    							break;
    						}
    					if (j == 0) db.collection('pinterest-search').findOneAndUpdate({_id : ObjectId(id.toString())}, { $inc: {num : 1}, $push: {like: user}}, function (err, docs) {
    						if (err) return 0;
    						else res.end('Like ' + (docs.value.num + 1) + '@OK');
    					});
    					else db.collection('pinterest-search').findOneAndUpdate({_id : ObjectId(id.toString())}, { $inc: {num : -1}, $pull: {like: user}}, function (err, docs) {
    						if (err) return 0;
    						else res.end('Like ' + (docs.value.num - 1) + '@');
    					});
    				}
    				else res.end('');
    				db.close();
    			});
    		});
    	}
    	else res.end('error');
    });
    
    // Delete image
    app.post('/remove', function(req, res) {
    	var id = req.body.id;
    	if (req.isAuthenticated()) {
    		MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('pinterest-search').find({_id : ObjectId(id.toString())}).toArray(function(err, data) {
    				if (err) return 0;
    				else if (data && data.length && req.session.passport.user == data[0].who) {
    					db.collection('pinterest-search').remove({_id : ObjectId(id.toString())});
    					res.end();
    					db.close();
    				}
    			});
    		});
    	}
    });
};