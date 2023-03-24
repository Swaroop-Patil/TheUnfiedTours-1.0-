const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express(); //upon calling express ,it will add bunch of variable to app variable

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));//morgan middleware allows to see req data in console  
}                         //dev:how u want the logging to look like

app.use(express.json()); //express.json() is a middleware :to put data to object or modify on request 
app.use(express.static(`${__dirname}/public`));////so that static files in "PUBLIC" directory are accessed  by broweser

app.use((req, res, next) => { //middlware func
  console.log('Hello from the middleware 👋');
  next(); //to call next middleware in stack
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); //middleware to manipulate request obj,to add curr time to req
  next();                                       //to find when req came
});

// 3) ROUTES or
app.use('/api/v1/tours', tourRouter); //tourRoter is real middelware function use for specific route api/v1/tours(parent route)
app.use('/api/v1/users', userRouter);//when we hav req to /api/v1/users,so when goes to middware stack and when hits this line of code itwill match this url/route and tourouter midware func runs

module.exports = app; //toexport application frm this file
