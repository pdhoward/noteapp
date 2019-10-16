require('dotenv').config()
const express = require("express");
const MongoClient = require("mongodb").MongoClient
const ObjectId = require('mongodb').ObjectId;
const logger = require("morgan");
const path = require("path");

const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

// Serve up static assets (heroku)
if (process.env.NODE_ENV === "production") {
  uri = process.env.ATLAS_URI;
} else {  
  // localhost
  uri = process.env.LOCAL_URI
}

let db = ""
let dbName = "notetaker"

MongoClient.connect(uri, { useNewUrlParser: true,                            
                           useUnifiedTopology: true }, 
    (err, client) => 
      {
        if (err) {    
          console.log(err) 
          return
        }        
      console.log("Connected successfully to server") 
      db = client.db(dbName)   
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "./public/index.html"));
});

app.post("/submit", (req, res) => {
  console.log(req.body);
  const collection = db.collection('notes')

  collection.insertOne(req.body, (error, data) => {
    console.log(`this is from submit`)
    console.log(data.ops[0])
    if (error) {
      res.send(error);
    } else {
      res.send(data.ops[0]);
    }
  });
});

app.get("/all", (req, res) => {
  const collection = db.collection('notes')
  collection.find({}).toArray((error, data) => {
    console.log(data)
    if (error) {
      res.send(error);
    } else {
      res.json(data);
    }
  })
})

app.get("/find/:id", (req, res) => {
  const collection = db.collection('notes')  
  collection.findOne(
    {
      _id: ObjectId(req.params.id)
    },
    (error, data) => {
      if (error) {
        res.send(error);
      } else {
        res.send(data);
      }
    }
  );
});

app.post("/update/:id", (req, res) => {
  const collection = db.collection('notes')
  collection.updateOne(
    {
      _id: ObjectId(req.params.id)
    },
    {
      $set: {
        title: req.body.title,
        note: req.body.note,
        modified: Date.now()
      }
    },
    (error, data) => {
      if (error) {
        res.send(error);
      } else {
        res.send(data);
      }
    }
  );
});

app.delete("/delete/:id", (req, res) => {
  const collection = db.collection('notes')
  collection.remove(
    {
      _id: ObjectID(req.params.id)
    },
    (error, data) => {
      if (error) {
        res.send(error);
      } else {
        res.send(data);
      }
    }
  );
});

app.delete("/clearall", (req, res) => {
  db.notes.remove({}, (error, response) => {
    if (error) {
      res.send(error);
    } else {
      res.send(response);
    }
  });
});

app.listen(3000, () => {
  console.log("App running on port 3000!");
});
