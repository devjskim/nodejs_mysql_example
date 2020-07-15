var db = require('./db');
var template = require('./template');
var url = require('url');
var qs = require('querystring');

exports.author = function(request, response){
    db.query(`SELECT * FROM topic`, function(error, topics){
        //console.log(topics);
        db.query(`SELECT * FROM author`, function(error2, authors){
            var title = 'Author';
            var description = 'Hello, Node.js';
            var list = template.list(topics);
            var html = template.HTML(title, list,
            `${template.authorTable(authors,)}
            <style>
            table{
                border-collapse: collapse;
            }
            td{
                border:1px solid black;
            }
            </style>`,
            `<a href="/author/create">create</a>`
            );
            response.writeHead(200);
            response.end(html);
        })
    });
}

exports.create=function(request, response){
    db.query(`SELECT * FROM topic`, function(error,topics){
      db.query('SELECT * FROM author', function(error2, authors){
        var title = 'Create';
        var list = template.list(topics);
        var html = template.HTML(title, list,
          `
          ${template.authorTable(authors)}
            <style>
            table{
                border-collapse: collapse;
            }
            td{
                border:1px solid black;
            }
            </style>
          <form action="/author_create" method="post">
            <p><input type="text" name="name" placeholder="name"></p>
            <p>
              <textarea name="profile" placeholder="profile"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
          `<a href="/author/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  }

  exports.author_create = function(request, response){
    var body = '';
    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        var post = qs.parse(body);
        //console.log(post);
        db.query(`
          INSERT INTO author (name, profile) 
            VALUES(?, ?)`,
          [post.name, post.profile], 
          function(error, result){
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/author`});
            response.end();
          }
        )
    });
  }

  exports.update = function(request, response){
    db.query(`SELECT * FROM topic`, function(error, topics){
        var _url = request.url;
        var queryData = url.parse(_url, true).query;
        db.query(`SELECT * FROM author`, function(error2, authors){
            db.query(`SELECT * FROM author where id =?`,[queryData.id], function(error3, author){
                var title = 'Author';
                var list = template.list(topics);
                var html = template.HTML(title, list,
                `
                ${template.authorTable(authors)}
                <style>
                table{
                    border-collapse: collapse;
                }
                td{
                    border:1px solid black;
                }
                </style>
                <form action="/author_update" method="post">
                    <input type="hidden" name="id" value="${queryData.id}">
                    <p><input type="text" name="name" placeholder="title" value="${author[0].name}"></p>
                    <p>
                    <textarea name="profile" placeholder="profile">${author[0].profile}</textarea>
                    </p>
                    <p>
                    <input type="submit">
                    </p>
                </form>
                `,
                `<a href="/author/create">create</a> <a href="/author/update?id=${queryData.id}">update</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    });
}
    
exports.update_author = function(request, response){
    var body = '';
    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        var post = qs.parse(body);
        db.query(`UPDATE author SET name = ? , profile = ? WHERE id = ?`,
        [post.name, post.profile, post.id],
        function(error, result){
        //console.log(result);
        if(error){
            throw error
        } else {
            response.writeHead(302, {Location: `/author`});
            response.end();
        }
        });
    });
}

exports.delete_author = function(request, response){
    var body = '';
    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      db.query(`DELETE FROM author WHERE id=?`,
      [post.id],
      function(error, result){
        if(error){
          throw error
        } else {
          response.writeHead(302, {Location: `/author`});
          response.end();
        }
      })
    });
  }