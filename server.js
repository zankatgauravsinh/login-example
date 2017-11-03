
var express = require("express");
var app = express();
var bodyParser=require('body-parser');
var mongoose = require('mongoose');
var dialog = require('dialog');
var formidable = require('formidable');
var fs = require('fs');
var u = require('./user');
var router = express.Router();
var parseurl = require('parseurl')
var path = __dirname + '/views/';
var session = require('express-session')
var MongoStore=require('connect-mongo')(session);
var methodOverride = require('method-override')
var FileReader = require('filereader')
app.use(bodyParser.urlencoded())
app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store:new MongoStore({mongooseConnection:mongoose.connection})
   }))
   
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.set('views', __dirname + '/views');

var User = require('./user.js');
console.log(User,'user')
var handlebars  = require('express-handlebars');
app.engine('pug', require('pug').renderFile);
app.set('view engine', 'pug');
var joinPath = require('path.join');
app.use(express.static(joinPath(__dirname, './public')));



/*
modules
*/


        router.use(function (req,res,next) {
        console.log("/" + req.method);
        next();
        });


     
        router.get("/login",function(req,res){
            res.render('login')
        });
        router.get("/",function(req,res){
            if (req.session.user == null){
                // if user is not logged-in redirect back to login page //
                        res.redirect('/login');
                    }	else{
                        console.log(req.session.user)
                        res.render('home', {
                            title :' home',
                            user : req.session.user
                        });
                    }
        })
    
    
        /*
        login Activity
        */

            router.post("/login", function (req, res) {
            console.log(req.body)
            var username= req.body.username
            var password= req.body.password

            User.findOne({username:username,password:password},function(err,user){
                console.log(user,err);
                    if (user) {
                            req.session.regenerate(function () {
                                req.session.user = user;
                                        res.cookie('username', user.username, { maxAge: 900000 });
                                        res.cookie('password', user.password, { maxAge: 900000 });
                                        res.redirect('/')
                            })
                         }
                          else {
                                res.render('login')
                        }
                            
        });
    });
/*
Signup
*/


                router.get("/signup",function(req,res){
                res.render('signup');
                });

                router.post("/signup", function (req, res) {
                var username= req.body.username
                var password= req.body.password
                var name= req.body.name
                var email= req.body.email                
                var user = new User();

                user.username=username;
                user.password=password;
                user.name=name;
                user.email=email;

                user.save(function(err,user) {
                   // if (err) {

                      //  console.log(user,err);
                        if(err){
                            console.log(err);
                            return res.status(500).send('failed to signup');
                        }else{  
                           
                            req.session.user = user;
                            res.cookie('username', user.username, { maxAge: 900000 });
                            res.cookie('password', user.password, { maxAge: 900000 });
                            res.redirect('/')
                            
                        } 
                    })
                });
                

                router.get('/edit/:id',function(req,res){
                    User.findById(req.params.id,function(err, user) {                         
                           user?status=200:status=400
                           console.log(user)
                    res.render('edit', {user})
  
            
                })
            })
        
                router.post('/edit/:id', function (req, res) {
                    User.findById(req.params.id,function (err, user) {  
                        if (err) {
                            res.status(500).send(err);
                        } else{                           
                            user.username= req.body.username;
                            user.password= req.body.password;
                            user.name= req.body.name;
                            user.email= req.body.email;
                            console.log(req.params)
                            user.save(function(err) {
                                if (err){
                                  console.log('error')
                                }
                                else{
                                console.log('success')
                                req.session.user = user;
                                res.status(200).send();
                                res.redirect('/')
                            }    
                                                   
                              });
                            
                            };
                        
                        
                    });
            
            });


                              // Find all users
                    router.get('/list', function(req, res){
                        
                    User.find({},function(err, user) {
                    if (err ) {
                        res.status(500).send(err)                                 
                        res.json("user not found");
                    }
                    
                    else if (user.length) {
                        
                        user?status=200:status=400
                        console.log(user)
                        res.render('list', {users:user});
                        
                        }
                        
                    })
                    
                    
                });
                       
                    router.post('/delete/:id', function (req, res) {
                        console.log(req.params)
                        
                        User.findByIdAndRemove(req.params.id,function(err, user) {
                            res.clearCookie('username');
                            res.clearCookie('password');
                                        if (err) {
                                            res.statusCode = 403;
                                            res.send(err);
                                        } else {
                                            req.session.destroy(function(err){ 
                                                res.redirect('/list')
                                        })
                                    }
                                    });
                            });
                                
                    router.post('/logout', function(req, res){
                        res.clearCookie('username');
                        res.clearCookie('password');
                        req.session.destroy(function(err){ 
                            res.redirect('/login')
                            
                            });
                    })
                   
                
                app.use("/",router);

                
                module.exports=router;

                app.listen(2002,function(){
                console.log("http://localhost:2002");
                });