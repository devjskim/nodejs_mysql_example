var http = require('http');
var url = require('url');
var topic = require('./lib/topic');
const author = require('./lib/author');
//데이터베이스에 실제 접속

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        topic.home(request, response);
      } else {
        topic.detail(request, response);
      }
    } else if(pathname === '/create'){
      topic.create(request, response);
    } else if(pathname === '/create_process'){
      topic.create_process(request, response);
    } else if(pathname === '/update'){
      topic.update(request, response);
    } else if(pathname === '/update_process'){
      topic.update_process(request, response);
    } else if(pathname === '/delete_process'){
      topic.delete_process(request, response);
    } else if(pathname === '/author'){
      author.author(request, response);
    } else if(pathname === '/author/create'){
      author.create(request, response);
    } else if(pathname === '/author_create'){
      author.author_create(request, response);
    } else if(pathname === '/author/update'){
      author.update(request, response);
    } else if(pathname === '/author_update'){
      author.update_author(request, response);
    } else if(pathname === '/author/delete_process'){
      author.delete_author(request, response);
    }else {
      response.writeHead(404);
      response.end('Not found');
    }
   
});
app.listen(3000);
