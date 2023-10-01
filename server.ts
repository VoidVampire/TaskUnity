require('dotenv').config();

const express = require('express')
const expresslayouts = require('express-ejs-layouts')
const session = require('express-session');
const connectDB = require('./server/config/db');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app
.use('/', require('./server/routes/main'))
.use('/', require('./server/routes/admin'))
.use(expresslayouts)
.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});


app.set('view engine', 'ejs');