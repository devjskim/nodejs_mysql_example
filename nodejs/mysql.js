var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'qhdks332',
  database : 'opentutorials'
});
 
connection.connect();
 
connection.query('SELECT * FROM author', function (error, results, fields) {
  if (error) console.log(error);
  console.log('The solution is: ', results);
});

connection.end();