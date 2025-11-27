const Listing = require("../models/listing");
const axios = require("axios");  // ⭐ using OpenStreetMap instead of Mapbox

// FREE GEOCODING FUNCTION (OSM)
async function geocodeLocation(location) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
        const response = await axios.get(url, {
            headers: { "User-Agent": "Wonderlust-App" }
        });

        if (response.data.length === 0) {
            return null;
        }

        return {
            type: "Point",
            coordinates: [
                parseFloat(response.data[0].lon),
                parseFloat(response.data[0].lat)
            ]
        };
    } catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
}

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show", { listing });
};

module.exports.createListing = async (req, res, next) => {
    // ⭐ Geocode using OpenStreetMap
    const geometry = await geocodeLocation(req.body.listing.location);

    if (!geometry) {
        req.flash("error", "Location not found. Try a different place!");
        return res.redirect("/listings/new");
    }

    const url = req.file.path;
    const filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = geometry; // ⭐ Set geometry manually

    await newListing.save();
    req.flash("success", "New listing created");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/edit", { listing });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // If user uploaded new image
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing deleted");
    res.redirect("/listings");
};












// const Listing=require("../models/listing");
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// const mapToken = process.env.MAP_TOKEN;
// const geocodingClient = mbxGeocoding({ accessToken: mapToken });


// module.exports.index=async (req,res)=>{
//    const allListings=await Listing.find({});
//    res.render("listings/index",{allListings});
// };


// module.exports.renderNewForm=(req,res)=>{
//     res.render("listings/new");
// };

// module.exports.showListing=async(req,res)=>{
//     let{id}=req.params;
//   const listing= await Listing.findById(id)
//   .populate({
//     path:"reviews",
//     populate:{
//     path:"author",
//   }, 
//  })
//   .populate("owner");
//   if(!listing){
//     req.flash("error","Listing you requsted does not existed!");
//     res.redirect("/listings");
//   }
//   res.render("listings/show",{listing});
// };

// module.exports.createListing=async (req,res,next)=>{
//        let response=  await geocodingClient.forwardGeocode({
//           query: req.body.listing.location,
//           limit: 1,
//         }).send();
        

//         let url=req.file.path;
//         let filename=req.file.filename;
//         const newListing=new Listing(req.body.listing);
//         newListing.owner=req.user._id;
//         newListing.image={url,filename};
        
//         newListing.geometry=response.body.features[0].geometry;
        
//         await newListing.save();
//         req.flash("success","new listing created");
//         res.redirect("/listings");  
//     };

// module.exports.renderEditForm=async (req,res)=>{
//       let{id}=req.params;
//       const listing= await Listing.findById(id);
//       if(!listing){
//            req.flash("error","Listing you requsted does not existed!");
//            res.redirect("/listings");
//        }
//       res.render("listings/edit",{listing});
// };

// module.exports.updateListing=async (req,res)=>{
//           let{id}=req.params;
//          let listing= await  Listing.findByIdAndUpdate(id,{...req.body.listing});

//          if(typeof req.file !=="undefined"){
//          let url=req.file.path;
//          let filename=req.file.filename;
//           listing.image={url,filename};
//           await listing.save();
//          }
//           req.flash("success","listing updated");
//           res.redirect(`/listings/${id}`);
// };

// module.exports.deleteListing=async (req,res)=>{
//           let{id}=req.params;
//          let deletedListing= await Listing.findByIdAndDelete(id);
//          req.flash("success"," listing Deleted");
//          res.redirect("/listings");
// };

