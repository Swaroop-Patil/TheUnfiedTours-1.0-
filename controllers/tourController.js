const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {    //setting the properties of query obj with values specified or prefilling values for user
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // EXECUTE QUERY                                           //video:3:19:00
    const features = new APIFeatures(Tour.find(), req.query)  //Tour.find()to find all tours 7&return a promise that we will await,so make it async
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query; //tours will hav all the data(all Tours)

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id); 
    //or  //Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createTour = async (req, res) => {  //create Tour document based on data that comes frm body
  try {
    // const newTour = new Tour({})  //
    // newTour.save()

    const newTour = await Tour.create(req.body); //calling create method directly on Tour model
                                                 //req.body :data that comes with POST req which we want to store in DB
                                                // awaiting the result of promise of create()
      res.status(201).json({
      status: 'success',
      data: {
        tour: newTour //sending newly created Tour document asresponse to client
      }
    });
  } catch (err) { //catch has access to err obj  //when there is validation err ccc

    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { // await the result of this query-> .findBy..()
      new: true,   //to send updated doc to client
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour:tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

//Aggregation pipelines for manipulating data & calculating avg price,distance ..
exports.getTourStats = async (req, res) => {    //getTourStats func to calculate statistics about our tour
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } } //$match:this stage to select/filter certain docs
      },
      {                                           //$group:this stage used to grp docs using accumulator ,like calculating avg rating
        $group: {
          _id: { $toUpper: '$difficulty' },       //group according to difficulty schema level
          numTours: { $sum: 1 },                  //add 1 for each document that goes throgh this pipeline//gives total no.of field
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },           //{$mongodb operator:'$name_of field'}
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },                                          //$sort:this stage used to sort according to fields
      {
        $sort: { avgPrice: 1 }
      }
      // {
      //   $match: { _id: { $ne: 'EASY' } }       //selecting all docs which not easy,medium & difffficult
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

// aggregation pipeline for  implemmenting a fun which calculates busiest month of year

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; //*1 to transform it to no.

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'        //$uwind: deconsturucts and puts 1 doc for each array/dates
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),  //we want our dates b/w 1st an d last dates off curr year
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },     //id: on what basis r u grouping
          numTourStarts: { $sum: 1 },         // to count how many tours in a month
          tours: { $push: '$name' }           //$push: to create an array and push namefield of tour to docs
        }
      },
      {
        $addFields: { month: '$_id' }          //adds month field
      },
      {
        $project: {                             //
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1 }            //sort numtourstats in desending order
      },                                        //sort according to moth which is busiest/most no, of tours in a month
      {
        $limit: 12                              //limit the no.of docs or output
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};




































/*
**********************************************************

//HANDLER FUNCTIONS
//const fs = require('fs');
const Tour=require('./../models/tourModel');

/*const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);*/

// CREATING & EXPORTING MIDDLEWARE FUNC CHECK ID
/*exports.checkID = (req, res, next, val) => {  // val IS ARGUMENT OF PARAMETR
  console.log(`Tour id is: ${val}`);

  //TO CHECK IF ID IS VALID
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({            //return,SO EXPRESS DONT CONTINUE TO RUN HITTING next() after sending response)
      status: 'fail',
      message: 'Invalid ID'
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({     //if no name or price ,return frm func and esend a message
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next();  //if evrything is there move to nxt middleware
};







exports.getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    //results: tours.length,
    //data: {
    //  tours
   // }
  });
};

//to get 1 tour
exports.getTour = (req, res) => {
  console.log(req.params);//variable in url r parameters ,req.params assigns values to our variables
  
  const id = req.params.id * 1;
 
 // const tour = tours.find(el => el.id === id); //find() wil create an array  containng only those elements for which (el.id===id) is true
 // res.status(200).json({
   // status: 'success',
   // data: {
   //   tour
   // }
  //});
};

exports.createTour = (req, res) => {
    res.status(200).json({
        status: 'success',
        //data: {
         // tour: newTour
       // }
      });
    };
  // console.log(req.body);


  //giving id as there is no database
  
  /*const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null
  });
};
      */