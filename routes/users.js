var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var Query = require('../models/query');

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});
router.get('/queries', function(req, res){
	if (req.query.q) {
		Query.find({ 'mobile': req.query.q },function (err, person) {
		  if (err) return handleError(err);
		  res.render('query', {data : person, patient : true, result : true});	
		});
	}
	else
	{
		str = req.query.t
		str = str.replace(/ +/g, "");
		Query.find({ 'dr_name': str.toLowerCase() },function (err, person) {
		  if (err) return handleError(err);
		  res.render('query', {data : person, patient : false});
		});

	}	
	
});

// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var mobile = req.body.mobile;
	var password = req.body.password;
	var password2 = req.body.password2;
	var user = req.body.user;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('mobile', 'Mobile is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			email:email,
			mobile: mobile,
			password: password,
			user: user
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/users/login');
	}
});

router.post('/query', function(req, res){
	var name = req.body.name;
	var dr_name = req.body.dr_name;
	var mobile = req.body.mobile;
	var dda = req.body.dda;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('dr_name', 'Doctor Name is required').notEmpty();
	req.checkBody('mobile', 'Mobile is required').notEmpty();
	req.checkBody('mobile', 'Enter valid Mobile number').isMobilePhone('en-IN');
	req.checkBody('dda', 'Date of Appointment is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		console.log(errors)
	} else {
		var newQuery = new Query({
			patient_name: name,
			dr_name:dr_name,
			dda: dda,
			approved: 'Pending',
			tpd: 'Nil',
			mobile: mobile
		});

		Query.createQuery(newQuery, function(err, query){
			if(err) throw err;
			console.log(query);
		});

		req.flash('success_msg', 'Query Submitted!');

		res.redirect('/');
	}
});

router.post('/query/approve', function(req, res){
	var id = req.query.id;	
	var tpd = req.body.tpd;
	Query.findOneAndUpdate({_id:id}, {$set: { tpd : tpd, approved : "Approved"}}, function (err, place) {
		req.flash('success_msg', 'Query Approved!');
  	res.redirect('/')
});

});

router.post('/query/reject', function(req, res){
	var id = req.query.id;	
	Query.findOneAndUpdate({_id:id}, {$set: {tpd : "Nil", approved : "Rejected"}}, function (err, place) {
		req.flash('success_msg', 'Query Rejected!');
  	res.redirect('/')
});

});

passport.use(new LocalStrategy(
  function(mobile, password, done) {
   User.getUserByMobile(mobile, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;