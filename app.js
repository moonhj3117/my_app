var express = require('express');
var path = require('path');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


mongoose.connect(process.env.MONGO_DB);

var db = mongoose.connection;
db.once("open", function(){
  console.log("DB conection!");
});
db.on("error",function(err){
  console.log("DB ERROR : ", err);
});

var postSchema = mongoose.Schema({
  title:{type:String, required:true},
  body:{type:String, required:true},
  createdAt: {type:Date, default:Date.now},
  updatedAt:Date
});
var Post = mongoose.model('post',postSchema);

var dataSchema = mongoose.Schema({
  name:String,
  count:Number
});
var Data = mongoose.model('data',dataSchema);
Data.findOne({name:"myData"},function(err,data){
  if(err) return console.log("Data ERROR:", err);
  if(!data){
    Data.create({name:"myData",count:0},function(err,data){
      if(err) return console.log("Data ERROR:",err);
      console.log("Counter initialized : ",data);
    });
  }
});

app.set("view engine",'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
var data = {count:0};
app.get('/',function (req, res){
  Data.findOne({name:"myData"},function(err,data){
    if(err) return console.log("Data ERROR:", err);
    data.count++;
    data.save(function(err){
      if(err) return console.log("Data ERROR:",err);
      res.render('my_first_ejs',data);
    });
  });
});

app.get('/posts',function(req,res){
  Post.find({},function(err,posts){
    if(err) return res.json({success:false, message:err});
    res.json({success:true,data:posts});
  });
});
app.get('/posts/:id',function(res, req){
  Post.findById(req.params.id, function(err, req){
    if(err) return res.json({success:false, message:err});
    res.json({success:true, data:post});
  });
});
app.put('/posts/:id',function(req, res){
  req.body.post.updatedAt= Date.now();
  Post.findByIdAndUpdate(req.params.id, req.body.post, function(err,post){
    if(err) return res.json({success:false, message:err});
    res.json({success:true, message:post._id+" updated"});
  });
});
app.delete('/posts/:id',function(req,res){
  Post.findByIdAndRemove(req.params.id, function(err, post){
    if(err) return res.json({success:false, message:err});
    res.json({success:true, message:post._id+" deleted"});
  });
});

app.post('/posts',function(req,res){
  Post.create(req.body.post, function(err,post){
    if(err) return res.json({success:false,message:err});
    res.json({success:true,data:post});
  });
});


app.listen(3000, function(){
  console.log('Server On!');
});
