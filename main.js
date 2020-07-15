var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var mysql = require('mysql');
var db = require('./lib/db');

//데이터베이스에 실제 접속

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        db.query(`SELECT * FROM topic`, function(error, topics){
          //console.log(topics);
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(topics);
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      } else {
        db.query(`SELECT * FROM topic`, function(error, topics){
          if(error){
            throw error;
          } else {
            db.query(`SELECT * FROM topic JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], function(error2, topic){
              if(error2){
                throw error2
              } else {
                var list = template.list(topics);
                var html = template.HTML(topic[0].title, list,
                  `<h2>${topic[0].title}</h2>${topic[0].description}
                  <p>by ${topic[0].name}</p>`,
                  ` <a href="/create">create</a>
                    <a href="/update?id=${queryData.id}">update</a>
                    <form action="delete_process" method="post">
                      <input type="hidden" name="id" value="${queryData.id}">
                      <input type="submit" value="delete">
                    </form>`
                );
                response.writeHead(200);
                response.end(html);
              }
            });
          }
        })
      }
    } else if(pathname === '/create'){
        db.query(`SELECT * FROM topic`, function(error, topics){
          db.query(`SELECT * FROM author`, function(error2, authors){
            var title = 'Create';
            var list = template.list(topics);
            var html = template.HTML(title, list,
              `<form action="/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
              <p>
                ${template.authorSelect(authors)}
              </p>
              <p>
                <input type="submit">
              </p>
            </form>`,
            `<a href="/create">create</a>`
            );
            response.writeHead(200);
            response.end(html);
        });
      });
    } else if(pathname === '/create_process'){
      var body = '';
      
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query(`INSERT INTO topic (title, description, created, author_id)
          VALUE (?, ?, NOW(), ?)`,
          [post.title, post.description, post.author],
          function(error, result){
            if(error){
              throw error
            } else {
              response.writeHead(302, {Location: `/?id=${result.insertId}`});
              response.end();
            }
          })
      });
    } else if(pathname === '/update'){
      db.query(`SELECT * FROM topic`, function(error, topics){
        if(error){
          throw error;
        } else {
          db.query(`SELECT * FROM topic where id=?`,[queryData.id], function(error2, topic){
            if(error2){
              throw error2;
            } else {
              db.query(`SELECT * FROM author`, function(error3, authors){
                var title = topic[0].title;
                var description = topic[0].description;
                var list = template.list(topics);
                var html = template.HTML(topics[0].title, list,
                  `
                  <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${queryData.id}">
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                    <p>
                      <textarea name="description" placeholder="description">${description}</textarea>
                    </p>
                    <p>
                      ${template.authorSelect(authors, topic[0].author_id)}
                    </p>
                    <p>
                      <input type="submit">
                    </p>
                  </form>
                  `,
                  `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
                );
                response.writeHead(200);
                response.end(html);
              });
            }
          });
        }
      })
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        db.query(`UPDATE topic SET title = ? , description = ?, author_id = ? WHERE id = ?`,
        [post.title, post.description, post.author, post.id],
        function(error, result){
          //console.log(result);
          if(error){
            throw error
          } else {
            response.writeHead(302, {Location: `/?id=${post.id}`});
            response.end();
          }
        });
    });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var filteredId = path.parse(id).base;
          fs.unlink(`data/${filteredId}`, function(error){
            response.writeHead(302, {Location: `/`});
            response.end();
          })
      });
      request.on('end', function(){
        var post = qs.parse(body);
        db.query(`DELETE FROM topic WHERE id=?`,
        [post.id],
        function(error, result){
          if(error){
            throw error
          } else {
            response.writeHead(302, {Location: `/`});
            response.end();
          }
        })
      });

    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
