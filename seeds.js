var mongoose = require("mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment");

var data = [
    {
        name: "Cloud's Rest", 
        image: "https://images.unsplash.com/photo-1492648272180-61e45a8d98a7?dpr=1&auto=format&fit=crop&w=1950&h=&q=60&cs=tinysrgb&crop=",
        description: "Spicy jalapeno tenderloin chicken fatback in meatball, filet mignon eu pig sint in. Ham irure ad, pork duis turkey non shank. Ad turducken anim bacon t-bone excepteur incididunt do jowl esse elit eiusmod burgdoggen consectetur. Reprehenderit cow shank, venison pig fugiat meatloaf pancetta velit est enim. Est drumstick voluptate reprehenderit frankfurter cillum fugiat pork loin tongue eiusmod cupidatat bresaola dolore corned beef ham hock. Mollit porchetta dolore ea. Aliquip sed leberkas jerky, strip steak dolor consequat ipsum burgdoggen."
    },
    {
        name: "Alvord Desert", 
        image: "https://images.unsplash.com/photo-1468956398224-6d6f66e22c35?dpr=1&auto=format&fit=crop&w=1955&h=&q=60&cs=tinysrgb&crop=",
        description: "Velit shankle quis do excepteur sausage alcatra, meatloaf landjaeger. Occaecat flank eu, reprehenderit pork chop sunt fugiat ex. Sirloin in magna, eu meatloaf pastrami aliqua do occaecat corned beef bacon pork chop. Prosciutto dolore tongue, alcatra strip steak reprehenderit ham hock pork short ribs commodo id turducken. Capicola cillum cupim commodo quis aute salami sirloin t-bone jowl pork shoulder fatback aliqua."
    },
    {
        name: "Stevens Pass", 
        image: "https://images.unsplash.com/photo-1455496231601-e6195da1f841?dpr=1&auto=format&fit=crop&w=1995&h=&q=60&cs=tinysrgb&crop=",
        description: "Andouille eu kevin ex tenderloin brisket voluptate ut frankfurter beef ribs eiusmod ball tip. Ground round in irure est adipisicing lorem alcatra tempor jerky shoulder kevin tail enim. Duis meatball eu, sausage ea ipsum tri-tip tail quis bacon laborum. Swine do nostrud adipisicing, meatloaf cow veniam. Aliquip meatloaf dolore, rump ut landjaeger ground round fugiat jerky boudin doner mollit veniam qui cillum. Doner beef chuck officia, nostrud alcatra ut pancetta culpa short ribs."
    }
]

function seedDB(){
    //Remove all campgrounds
    Campground.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed campgrounds");
            //add a few campgrounds
        data.forEach(function(seed){
            Campground.create(seed, function(err, campground){
                if(err){
                    console.log(err);
                } else{
                    console.log("added a campground");
                    //create a comment
                    Comment.create(
                        {
                            text: "This place is great, but I wish there was internet.",
                            author: "Homer"
                        }, function(err, comment){
                            if(err){
                                console.log(err);
                            } else{
                                campground.comments.push(comment);
                                campground.save();
                                console.log("Created new comment");
                            }
                        });
                }
            });
        });
    });

}

module.exports = seedDB;