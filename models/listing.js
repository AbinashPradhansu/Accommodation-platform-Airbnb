

const mongoose = require("mongoose");
const { listingSchema } = require("../schema");
const Schema = mongoose.Schema;
const Review=require("./review.js");
const { required } = require("joi");

const ListingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url:String,
        filename: String
    },
    price: Number,
    location: String,
    country: String,
    reviews:[
        {
              type:Schema.Types.ObjectId,
              ref:"Review"
        },
      
    ],
    owner:{
       type:Schema.Types.ObjectId,
        ref:"User",
    },
   geometry: {
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
    },
    coordinates: {
        type: [Number],
        default: [0, 0]
    }
}

});

 ListingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
       await Review.deleteMany({_id:{$in:listing.reviews}})
    }   
 });

const Listing = mongoose.model("Listing", ListingSchema);
module.exports = Listing;




// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const ListingSchema = new Schema({
//     title: {
//         type: String,
//         required: true,
//     },
//     description: String,
//     image: {
//         type: String,
//         default:
//             "https://images.unsplash.com/photo-1533371452382-d45a9da51ad9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDMwfDZzTVZqVExTa2VRfHxlbnwwfHx8fHw%3D",
//         set: (v) =>
//             v === ""
//                 ? "https://images.unsplash.com/photo-1533371452382-d45a9da51ad9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDMwfDZzTVZqVExTa2VRfHxlbnwwfHx8fHw%3D"
//                 : v,
//     },
//     price: Number,
//     location: String,
//     country: String,
// });

// const Listing = mongoose.model("Listing", ListingSchema);
// module.exports = Listing;
