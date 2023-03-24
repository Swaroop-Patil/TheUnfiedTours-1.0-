const  mongoose  = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); //read our vars from file and saves to nodejs envir var
const app = require('./app'); //import app (./ to say that we r in curr folder)

const DB =process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD); //REPLACING PLACEHOLDER<PASSWORD> with real passsword

mongoose
//.connect(process.env.DATABASE_LOCAL,{ *****connection to localDB****
.connect(DB,{     //connect() returns a promise ***CONNECTION TO HOSTED DB
  useNewUrlParser:true,   // default depreciations
  useCreateIndex:true,
  useFindAndModify:false

})
.then(()=>// con => console.log(con.connections); //(****handling PROMISE by using then()***)con obj is result val of promise
  console.log("DB connection successful"));

  /*const tourSchema=new mongoose.Schema({  //to specify schema for our data/describe data
    name:{
      type:String,
      required:[true, "a tour must have a name"],
      unique:true //so that no 2 docs have same name
    },
    rating:{
        type:Number,
         default:4.5
    },
    price:{
        type:Number,
      required:[true, "a tour must have a price"]
    }
  });

  const Tour=mongoose.model("Tour",tourSchema); //creating model called "Tour"

  var testTour=new Tour({  //new document"testTour" created from "Tour" model
    name:"the Forest Hiker",
    rating:4.7,
    price:497
  });

  var testTour=new Tour({  //new document"testTour" created from "Tour" model
    name:"the MONSTER",
    rating:4.5,
    price:440
  });

  testTour.save().then(doc =>{     //to save document to DB, the result value of promise that save() returns is the final doc as it is in DB
    console.log(doc);
  }).catch(err => {
    console.log("ERROR 😢:",err);
  }); */
  


const port = process.env.PORT || 3000;
app.listen(port, () => { //app.listen to start server
  console.log(`App running on port ${port}...`);
});



