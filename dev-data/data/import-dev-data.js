//creating script to load data frm json file to DB


const dotenv = require('dotenv');
const app = require('./app'); //import app (./ to say that we r in curr folder)
const  fs  = require('fs');
const Tour=require("./../../models/tourModel");

dotenv.config({ path: './config.env' }); //read our vars from file and saves to nodejs envir var

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

  // READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours); //createsa new document for each obj in array from tours=>tours.simple.json
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {  //if 3rd ele == --import,then import data
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
