
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";
import cors from "cors"
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";


const app = express();
const port = 4000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));
app.use(express.json());
app.use(cors());

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Org",
  password: "postcsg_13",
  port: 5432,
});
db.connect();

app.get("/", (req, res) => {
  res.send("");
});

app.get("/login", (req, res) => {
  res.send("");
});

app.get("/register", (req, res) => {
  res.send("");
});

app.post("/register", async (req, res) => {
  const {email,password}=req.body;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("exist");
    } else {
      //hashing the password and saving it in the database
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
         
          await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [email, hash]
          );
          res.send("success");
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  const {email,password}=req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;
      //verifying the password
      bcrypt.compare(password, storedHashedPassword, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
        } else {
          if (result) {
            res.send("Correct");
          } else {
            res.send("Incorrect");
          }
          
        }
      });
    } else {
      res.send("No");
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/dashboard",async(req,res)=>
    { 
     try
      {const result= await db.query("SELECT * FROM EMPLOYEE");
      console.log("result");
      const employee=result.rows;
      res.render("dashboard.ejs",{employee: employee});
    }
    catch(error)
    {
      console.error("Error:", error.message);
      res.status(500).send("Internal Server Error");
    }
    });
   app.post("/addnewemployee",async(req,res)=>
   {  const {name,department,place,role}=req.body;
      try{
        await db.query("Insert into  employee(name,department,place,role) values($1,$2,$3,$4)",[name,department,place,role]);
        res.send("Correct");
      }
      catch(error)
      {
        console.error("Error:", error.message);
        res.status(500).send("Internal Server Error");
      }
   });
    app.post("/leave",async(req,res)=>
    {
      try
      {const result= await db.query("SELECT * FROM leave");
      console.log("result");
      const leave=result.rows;
      res.render("leave.ejs",{leave: leave});
      a=document.getElementById("lConfirm");
      a.attachEvent('onclick', function() {  
           db.query("UPDATE leave set leave_status='Approved' where l_id=($1)",[document.getElementById("id").value]);
          });
    } 
    catch(error)
    {
      console.error("Error:", error.message);
      res.status(500).send("Internal Server Error");
    }
  });

    app.post("/reallocation",async(req,res)=>
    {
      try
      {const result= await db.query("SELECT * FROM reallocation");
      console.log("result");
      const reallocation=result.rows;
      res.render("reallocation.ejs",{reallocation: reallocation});
      b=document.getElementById("rConfirm");
      b.attachEvent('onclick', function() {  
           db.query("UPDATE reallocation set reallocation_status='Approved' where r_id=($1)",[document.getElementById("id").value]);
          });
    }
    catch(error)
    {
      console.error("Error:", error.message);
      res.status(500).send("Internal Server Error");
    }
  });

    app.post("/complaints",async(req,res)=>
    {
      try
      {const result= await db.query("SELECT * FROM reallocation");
      console.log("result");
      const reallocation=result.rows;
      res.render("dashboard.ejs",{reallocation: reallocation
      });
      a=document.getElementById("cConfirm");
      a.attachEvent('onclick', function() {  
           db.query("DELETE from complaints where l_id=($1)",[document.getElementById("id").value]);
          });
    }
    catch(error)
    {
      console.error("Error:", error.message);
      res.status(500).send("Internal Server Error");
    }
    });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
