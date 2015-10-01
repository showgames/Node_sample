var http = require('http');
var fs = require('fs');
var ejs = require('ejs');
var qs = require('querystring');
var mongoose = require('mongoose');
var settings = require('./settings.js');

var TodoSchema = new mongoose.Schema({
  title: {type:String},
  content: {type:String}
});

var template = fs.readFileSync('./todo.ejs', 'utf-8');


var con = mongoose.connect('mongodb://'+settings.host+'/'+settings.db);
var db = con.connection;

checkConnectToDb(db);


var Todo = con.model('Todo', TodoSchema);

var server = http.createServer();
server.on('request', function(req, res){
  // POST処理
  if(req.method === 'POST') {
    req.data = "";
    req.on("readable", function() {
      req.data += req.read();
    });
    req.on("end", function() {
      var query = qs.parse(req.data);
      var todo = new Todo({title:query.title, content:query.contents});

      todo.save(function (err){
        if(err) { console.log(err); }
        findData(res);
      });
    });

  } else {
    findData(res);
  }
});

server.listen(settings.port, settings.host);
console.log("Server listening at " + settings.host + ":" + settings.port);


function renderForm(title_posts, contents_posts , res) {
  var data = ejs.render(template, {
    title_posts: title_posts,
    contents_posts: contents_posts
  });
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(data);
  res.end();
}

function checkConnectToDb(db){

  db.on('error', console.error.bind(console, 'connection error:'));


  db.once('open', function (callback){
    console.log("conncet successfully!");
  });
}

function findData(res){
  Todo.find({}, function(err, docs) {
    var title_posts = [];
    var contents_posts = [];
    if (err) {console.log(err);}
    for(var i = 0, size = docs.length; i < size; i++){
      title_posts.push(docs[i].title);
      contents_posts.push(docs[i].content);
    }
    renderForm(title_posts, contents_posts ,res);
  });
}
