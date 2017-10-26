var Campground = require("../models/campground");
var Comment = require("../models/comment");

//ALL MIDDLEWARE
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err || !foundCampground){
				req.flash("error", "Campground not found");
				res.redirect("back");
			} else {
				//does user own this campground?
					// ".equals" is a method provided by mongoose
				if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
					//move onto the following code
					next();
				} else {
					req.flash("error", "You don't have permission to do that");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");
	}
}

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err || !foundComment){
				req.flash("error", "Comment not found");
				res.redirect("back");
			} else {
				//does user own this comment?
					// ".equals" is a method provided by mongoose
				if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
					//move onto the following code
					next();
				} else {
					req.flash("error", "You don't have permission to do that");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");
	}
}

middlewareObj.isLoggedIn = function(req, res, next){
    //isAuthenticated comes with PassportJS
    if(req.isAuthenticated()){
        return next();
	}
	req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = middlewareObj;