
if(process.env.NODE_ENV !="production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");


const listingsRouter=require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


// const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";
const dbUrl=process.env.ATLAS_DB_URL;


main()
    .then((res) => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,  
});

store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE",err)
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false, // better for production
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // important
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
};



// app.get("/", (req, res) => {
//     res.send(" Main root is workng")
// });


app.use(session(sessionOptions));
app.use(flash());



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});

// app.get("/demouser", async(req,res)=>{
//     let fakeUser=new User({
//         email:"vamsi@gmail.com",
//         username:"delta-student"
//     });

//   let registeredUser=await User.register(fakeUser,"helloworld");
//   res.send(registeredUser);

// });

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

// chat-Gpt code
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    res.status(statusCode).render("error", { err });
});


const port = 3000;
app.listen(port, () => {
    console.log(`server is working on the port ${port}`);

});











// const validateListing=(req,res,next)=>{
//     let {error}=  listingSchema.validate(req.body);   
//     if(error){
//         let errMsg= error.details.map((el)=>el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     }else{
//         next();
//     }
// };


// const validateReview=(req,res,next)=>{
//     let {error}=  reviewSchema.validate(req.body);   
//     if(error){
//         let errMsg= error.details.map((el)=>el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     }else{
//         next();
//     }
// };

// app.use("/listings",listings);
// app.use("/listings/:id/reviews",reviews);

// // index route
// app.get("/Listings", async (req,res)=>{
//    const allListings=await Listing.find({});
//    res.render("listings/index",{allListings});
// });


// // new route
// app.get("/listings/new",(req,res)=>{
//     res.render("listings/new");
// });


// // show Route

// app.get("/listings/:id", wrapAsync(async(req,res)=>{
//     let{id}=req.params;
//   const listing= await Listing.findById(id).populate("reviews");
//   res.render("listings/show",{listing});
// }));


// // create Route

// app.post(
//     "/listings",
//     validateListing,
//      wrapAsync( async (req,res,next)=>{
//         const newListing=new Listing(req.body.listing);
//         await newListing.save();
//         res.redirect("/listings");  
//     })
// );

// // edit route
// app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
//       let{id}=req.params;
//       const listing= await Listing.findById(id);
//       res.render("listings/edit",{listing});
// }));

// // update Route

// app.put("/listings/:id", validateListing, wrapAsync(async (req,res)=>{
//           let{id}=req.params;
//           await  Listing.findByIdAndUpdate(id,{...req.body.listing});
//           res.redirect(`/listings/${id}`);
// }));

// // delete Route
// app.delete("/listings/:id", wrapAsync(async (req,res)=>{
//           let{id}=req.params;
//          let deletedListing= await Listing.findByIdAndDelete(id);
//          res.redirect("/listings");
// }));

// //reviews- post route
// app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req,res)=>{
//       let  listing=await Listing.findById(req.params.id);
//        let newReview=new Review(req.body.review);
//        listing.reviews.push(newReview);
//        await newReview.save();
//        await listing.save();
//        console.log("new review saved");
//        res.redirect(`/listings/${listing._id}`);
// }));

// //Delete reviews Route
// app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
//       let{id,reviewId}=req.params;

//       await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
//       await Review.findByIdAndDelete(reviewId);

//       res.redirect(`/listings/${id}`)
// }));

// app.get("/testListing", async (req,res)=>{
//       let sampleListing=new Listing({
//             title: "Cozy Beach House",
//             description: "A beautiful house by the beach",
//             price: 2000,
//             location:"Hyderabad",
//             country:"india"
//       });
//      await sampleListing.save();
//      console.log("sample was saved");
//      res.send("succesfully tested");

// });



// app.all("*",(req,res,next)=>{
// next(new ExpressError(404,"Page Not Found"));
// });


// chat-Gpt code

// app.use((err, req, res, next) => {
//     const { statusCode = 500 } = err;
//     res.status(statusCode).render("error", { err });
// });


// app.use((err,req,res,next)=>{
//     let{statusCode=500,message="something went Wrong"}=err;
//     res.status(statusCode).render("error.ejs",{message});
//     // res.status(statusCode).send(message);
// });


// app.use((err, req, res, next) => {
//     const { statusCode = 500, message = "Something went wrong!" } = err;
//     res.status(statusCode).send(message);
// });



// const port = 3000;
// app.listen(port, () => {
//     console.log(`server is working on the port ${port}`);

// });