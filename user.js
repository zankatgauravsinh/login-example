var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var session = require('express-session')
var express = require("express");
var app = express();
var fs       = require('fs')
var http     = require('http')
var util     = require('util')
var path     = require('path');

 
var MongoStore=require('connect-mongo')(session);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store:new MongoStore({mongooseConnection:mongoose.connection})
   }))

mongoose.connect("mongodb://localhost/pugpp");
var UserSchema = new mongoose.Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    email: String,
    name: String,
  
});

var User = mongoose.model('users', UserSchema);
module.exports=User;

