var express = require('express');
var path = require('path');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var async = require('async');


mongoose.connect(process.env.MONGO_DB);

var db = mongoose.connection;
db.once("open", function(){
  console.log("DB conection!");
});
db.on("error",function(err){
  console.log("DB ERROR : ", err);
});

// model Schema
var postSchema = mongoose.Schema({
  title:{type:String, required:true},
  body:{type:String, required:true},
  createdAt: {type:Date, default:Date.now},
  updatedAt:Date
});
var Post = mongoose.model('post',postSchema);

var userSchema = mongoose.Schema({
  email : {type:String, required:true, unique:true},
  nickname: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  createdAt: {type:Date, default:Date.now}
});
var User = mongoose.model('user', userSchema);

// view setting
app.set("view engine",'ejs');

//set middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());

app.use(session({secret:'MySecret'}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done){
  done(null, user.id);
});
passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
});

var LocalStrategy = required('passport-local').Strategy;
passport.use('local-login',
  new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, doen){
    User.findOne({'email' : email }, function(err, user){
      if (err) return done(err);

      if(!user){
        req.flash("email", req.body.email);
        return done(null, false, req.flash('loginError','No user found.'));
      }

      if(user.password != password){
        req.flash("email", req.body.email);
        return done(null, false, req.flash('lgoinError','Password does not Match.'));
      }
      return done(null, user);
    });
  })
);


// set home routes
app.get('/', function(req, res){
  res.redirect('/posts');
});
app.get('/login',function(req,res){
  res.render('login/login', {email:req.flash("email")[0], loginError:req.flash('loginError')});
});
app.post('/login', function(req, res, next){
  req.flash("email");
  if(req.body.email.length === 0 || req.body.password.length === 0){
    req.flash("email",req.body.email);
    req.flash("loginError", "Please enter both email and password.");
    res.redirect('/login');
  }else{
    next();
  }
}, passport.authenticate('local-login', {
  successRedirect : '/posts',
  failureRedirect : '/login',
  failureFlash : true
})
);
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// set user routes
app.get('/users/new', function(req,res){

}); // new
app.post('/users', checkUserRegValidation, function(req, res,next){

}); // create
app.get('/users/:id', function(req, res){

}); // show


app.get('/posts',function(req,res){
  Post.find({}).sort('-createdAt').exec(function(err,posts){
    if(err) return res.json({success:false, message:err});
    res.render("posts/index", {data:posts});
  });
});
app.get('/posts/new',function(req,res){
  res.render("posts/new");
});

app.post('/posts',function(req,res){
  console.log(req.body);
  Post.create(req.body.post, function(err,post){
    if(err) return res.json({success:false,message:err});
    res.redirect('/posts');
  });
});
app.get('/posts/:id', function(req, res){
  Post.findById(req.params.id, function(err, post){
    if(err) return res.json({success:false, message:err});
    res.render("posts/show",{data:post});
  });
});
app.get('/posts/:id/edit', function(req,  res){
  Post.findById(req.params.id, function(err, post){
    if(err) return res.json({success:false, message:err});
    res.render("posts/edit", {data:post});
  });
});
app.put('/posts/:id', function(req,res){
  req.body.post.updatedAt=Date.now();
  Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, post){
    if(err) return res.json({success:false, message:err});
    res.redirect('/posts/'+req.params.id);
  });
});

app.delete('/posts/:id', function(req,res){
  Post.findByIdAndRemove(req.params.id, function(err,post){
    if(err) return res.json({success:false, message:err});
    res.redirect('/posts');
  });
});

app.listen(3000, function(){
  console.log('Server On!');
});
