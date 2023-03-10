require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const errorHandler = require('./utils/errorHandler');
const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

// global error handler
app.use(errorHandler);

// Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running at port no. ${port}`);
});