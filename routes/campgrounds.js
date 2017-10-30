var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX - SHOW ALL CAMPGROUNDS
router.get("/", function(req, res){
	var noMatch = null;
	//"Fuzzy" search with MongoDB
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({name: regex}, function(err, allCampgrounds){
			if(err){
				console.log(err);
			} else{
				if(allCampgrounds.length < 1){
					noMatch = "No campgrounds match that query, please try again.";
				}
				res.render("campgrounds/index", {campgrounds:allCampgrounds, noMatch:noMatch, page: 'campgrounds'});		
			}
		});
	} else {
		//GET ALL CAMPGROUNDS FROM DB
		Campground.find({}, function(err, allCampgrounds){
			if(err){
				console.log(err);
			} else{
				res.render("campgrounds/index", {campgrounds:allCampgrounds, noMatch:noMatch, page: 'campgrounds'});			
			}
		});
	}
});

//CREATE - CREATE NEW CAMPGROUND
router.post("/", middleware.isLoggedIn, function(req, res){
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCampground = {name: name, price: price, image: image, description: desc, author: author}
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else {
			res.redirect("/campgrounds");
		}
	});
});

//NEW - SHOW FORM TO CREATE NEW CAMPGROUND
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});

//SHOW - SHOWS MORE INFO ABOUT ONE CAMPGROUND
router.get("/:id", function(req, res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Campground not found");
			res.redirect("back");
		} else {
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	//is user logged in
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("back");
        } else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//DELETE CAMPGROUND
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("back");
        } else {
			req.flash("success", "Campground deleted");
            res.redirect("/campgrounds");
        }
    });
});

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;