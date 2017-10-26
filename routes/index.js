var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto"); //part of node; no need to install.

//root route
router.get("/", function(req, res){
	res.render("landing");
});

// =================
// AUTH ROUTES	
// =================

//show register form
router.get("/register", function(req, res){
	res.render("register", {page: 'register'});
});

//sign up logic
router.post("/register", function(req, res){
	var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
  });
	if(req.body.adminCode === 'yelpcampsecret'){
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			req.flash("error", err.message);
			return res.redirect("register");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome to YelpCamp, " + user.username + "!");
			res.redirect("/campgrounds");
		});
	});
});

//login form
router.get("/login", function(req, res){
	res.render("login", {page: 'login'});
});

//handling login logic
//app.post("/login", middleware, callback)
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), function(req, res){
});

// FORGOT PASSWORD
router.get("/forgot", function(req, res){
	res.render("forgot");
});

router.post('/forgot', function(req, res, next) {
	//an array of functions that get called one after another
	async.waterfall([
	  function(done) {
			crypto.randomBytes(20, function(err, buf) {
				//token is the link that gets sent to users that expire after an hour
					var token = buf.toString('hex');
					done(err, token);
			});
	  },
	  function(token, done) {
		//find user by email
		User.findOne({ email: req.body.email }, function(err, user) {
			if(err){
				console.log(err);
			}
			if (!user) {
				req.flash('error', 'No account with that email address exists.');
				return res.redirect('/forgot');
			}
	
			user.resetPasswordToken = token;
			user.resetPasswordExpires = Date.now() + 3600000; // 1 hour in ms
	
			user.save(function(err) {
				done(err, token, user);
			});
		});
	  },
	  //send email to user
	  function(token, user, done) {
		var smtpTransport = nodemailer.createTransport({
		  service: 'Gmail', 
		  secure: true,
		  auth: {
			user: 't.wong.443@gmail.com',
			pass: process.env.GMAILPW
		  }
		});
		
		var mailOptions = {
		  to: user.email,
		  from: 't.wong.443@gmail.com',
		  subject: 'Node.js Password Reset',
		  text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
			'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
			'http://' + req.headers.host + '/reset/' + token + '\n\n' +
			'If you did not request this, please ignore this email and your password will remain unchanged.\n'
		};
		smtpTransport.sendMail(mailOptions, function(err) {
		  console.log('mail sent');
		  req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
		  done(err, 'done');
		});
	  }
	], function(err) {
	  if (err) return next(err);
	  res.redirect('/forgot');
	});
});
  
router.get('/reset/:token', function(req, res) {
	User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
	  if (!user) {
			req.flash('error', 'Password reset token is invalid or has expired.');
			return res.redirect('/forgot');
	  }
	  res.render('reset', {token: req.params.token});
	});
});
  
router.post('/reset/:token', function(req, res) {
	async.waterfall([
	  function(done) {
		User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
		  if (!user) {
				req.flash('error', 'Password reset token is invalid or has expired.');
				return res.redirect('back');
			}
			// if first password = second password, proceed
		  if(req.body.password === req.body.confirm) {
				//after we set the new pw, make the token invalid
				user.setPassword(req.body.password, function(err) {
					user.resetPasswordToken = undefined;
					user.resetPasswordExpires = undefined;
		
					// save user w/ new pw and log in
					user.save(function(err) {
						req.logIn(user, function(err) {
							done(err, user);
						});
					});
				});
		  } else {
			  req.flash("error", "Passwords do not match.");
			  return res.redirect('back');
		  }
		});
	  },
	  function(user, done) {
		var smtpTransport = nodemailer.createTransport({
		  service: 'Gmail', 
		  auth: {
			user: 't.wong.443@gmail.com',
			pass: process.env.GMAILPW
		  }
		});
		var mailOptions = {
		  to: user.email,
		  from: 't.wong.443@gmail.com',
		  subject: 'Your password has been changed',
		  text: 'Hello,\n\n' +
			'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
		};
		smtpTransport.sendMail(mailOptions, function(err) {
		  req.flash('success', 'Success! Your password has been changed.');
		  done(err);
		});
	  }
	], function(err) {
	  res.redirect('/campgrounds');
	});
});  

//user logout
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged You Out");
    res.redirect("/campgrounds");
});

// user profile
router.get("/users/:id", function(req, res) {
	User.findById(req.params.id, function(err, foundUser) {
	  if(err) {
			req.flash("error", "User Not Found");
			res.redirect("/");
	  }
	  Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
			if(err) {
				req.flash("error", "Something Went Wrong.");
				res.redirect("/");
			}
			res.render("users/show", {user: foundUser, campgrounds: campgrounds});
		});
	});
});



module.exports = router;