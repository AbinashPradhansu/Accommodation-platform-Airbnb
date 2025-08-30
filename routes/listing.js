const express = require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner,validateListing } = require("../middleware.js");
const listingController=require("../controllers/listing.js");
const multer=require('multer');
const {storage}=require("../cloudConfig.js");
const upload=multer({storage});
 

router.route("/")
.get(wrapAsync(listingController.index))
.post( isLoggedIn,upload.single('listing[image]'), 
validateListing,wrapAsync(listingController.createListing));

// .post((req,res) => {
//     res.send(req.body);
// })

// new route
router.get("/new",isLoggedIn,listingController.renderNewForm);                                                                                                                                                                                                                                                                                                                                  

router.route("/:id")
.get( wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner,wrapAsync(listingController.deleteListing));

// edit route
router.get("/:id/edit",isLoggedIn, isOwner,wrapAsync(listingController.renderEditForm));

module.exports=router;


// // index route
// router.get("/",wrapAsync(listingController.index));

// // new route
// router.get("/new",isLoggedIn,listingController.renderNewForm);

// // show Route
// router.get("/:id", wrapAsync(listingController.showListing));

// // create Route
// router.post(
//     "/", isLoggedIn,validateListing,wrapAsync(listingController.createListing));

// // edit route
// router.get("/:id/edit",isLoggedIn, isOwner,wrapAsync(listingController.renderEditForm));

// // update Route
// router.put("/:id",isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// // delete Route
// router.delete("/:id",isLoggedIn, isOwner,wrapAsync(listingController.deleteListing));

// module.exports=router;