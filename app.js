var express = require('express');
var path = require('path');
var app = express();
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_DB);

var db = mongoose.connection;
db.once("open", function(){
  console.log("DB conection!");
});
db.on("error",function(err){
  console.log("DB ERROR : ", err);
});

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

app.listen(3000, function(){
  console.log('Server On!');
});
