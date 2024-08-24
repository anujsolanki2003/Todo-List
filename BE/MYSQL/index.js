const express = require("express");
const app = express();

const mysql = require("mysql2");

app.use(express.json());

// mysql database connection

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sol@4217",
    database: "vv_intern"
});

con.connect((err) => {
  if (err) throw new err();
  console.log("My SQL database connected");

//   con.query("create database vv_intern", (err, result) => {  // database created
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("Database created");
//       console.log(result);
      
//     }
//   });

// create table
//    con.query('create table intern (id INT PRIMARY KEY AUTO_INCREMENT ,name VARCHAR(50), email VARCHAR(50), password VARCHAR(50))',(err, result)=>{
//     if (err) {
//               console.log(err);
//             } else {
//               console.log("Table created");
//               console.log(result);
              
//             }
//    })
//

//
const sql = "INSERT INTO intern (name, email, password) VALUES ?";
const values = [
  ['Anuj', 'anuj@gmail.com','1234'],
  ['Amit', 'amit@gmail.com','3412'],
  ['shashi', 'shashi@gmail.com','5678'],
  ['abhishek', 'abhi@gmail.com','148438'],
  ['lakhan', 'lakhan@gmail.com','32476'],
  ['sudhanshu', 'sudhanshu@gmail.com','8594'],
 
];
con.query(sql, [values], (err, result)=> {
  if (err) throw err;
  console.log("Number of records inserted: " + result.affectedRows);
});
});

app.listen(2500, () => console.log("server running at 2500 port"));

// const express = require("express");
// const app=express();

// const mysql= require("mysql2") 

// app.use(express.json())



// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'sol@4217',
//     database: 'todo'
//   });

//   connection.connect(err => {
//     if (err) throw err;
//     console.log('Connected to the MySQL database.');
//   });
  
  
//    // get data from db
//   app.get('/users', (req, res) => {
//     const query = 'SELECT * FROM user;';
//     connection.query(query, (err, results) => {
//       if (err) throw err;
//       res.json(results);
//       console.log(results);
      
//     });
//   });
   
//   //create new user
//   app.post('/user', (req, res) => {
//     const { name, age, email,password } = req.body;
//     const query = 'INSERT INTO user (name, age,email,password) VALUES (?, ?,?,?)';
//     connection.query(query, [name,age, email,password], (err, results) => {
//       if (err) throw err;
//       res.status(201).send(`User added with ID: ${results.insertId}`);
//       console.log(results);
//     });
//   });

//   // Update
// app.put('/users/:id', (req, res) => {
//     const { id } = req.params;
//     const { name, email } = req.body;
//     const query = 'UPDATE user SET name = ?, email = ? WHERE id = ?';
//     connection.query(query, [name, email, id], (err, results) => {
//       if (err) throw err;
//       console.log(results);
//       res.send(`User with ID: ${id} updated`);
//     });
//   });

//   // Delete
// app.delete('/users/:id', (req, res) => {
//     const { id } = req.params;
//     const query = 'DELETE FROM user WHERE id = ?';
//     connection.query(query, [id], (err, results) => {
//       if (err) throw err;
//       console.log(results);
//       res.send(`User with ID: ${id} deleted`);
//     });
//   });

// app.listen(2000,()=>console.log('server running at 2000 port'))
