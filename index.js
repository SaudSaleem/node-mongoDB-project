require("dotenv").config();
const mongoose = require("mongoose");
//collection == tables && documents  == rows
//in mogoose we define shape of documnets known as schema
mongoose
  .connect("mongodb://127.0.0.1:27017/playground")
  .then((s) => console.log("Connected to mongo DB"))
  .catch((error) => console.log("Error connecting to Mongo DB...", error));
//define document schema
const courseScehma = new mongoose.Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 15 },
  author: String,
  // tags: [String],
  //CUSTOM VALIDATOR
  tags: {
    //async: true
    // validate:{
    //     validator: function(v, callback){
    //      setTimeout(()=>{
    //       const result = v && v.length > 0
    //        },2000)
    //        callback(result)
    //     },
    //     message:"A course must have 1 length"
    // }
    type: Array,
    validate: {
      validator: function (v) {
        v && v.length > 0;
      },
      message: "A course must have 1 length",
    },
  },
  date: { type: Date, default: Date.now() },
  isPublished: Boolean,
  price: {
    type: Number,
    required: function () {
      return this.isPublished;
    },
    min: 5,
    max: 200,
    get: (v) => Math.round(v),
    set: (v) => Math.round(v),
  },
  category: {
    type: String,
    enum: ["web", "mobile", "netwrk"],
    lowercase: true,
    //upercase: true
    //trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner", //it will create relation with Owner documents
  },
});
//we have to model this schema
const Course = mongoose.model("Course", courseScehma);

async function createCourse() {
  //create new course (just like Course.create() in sequilze)
  const course = new Course({
    name: "Node course",
    author: "Saud Saleem",
    tags: ["node", "mongo"],
    isPublished: true,
    category: "WEB",
    price: 30.67,
    owner: "620fd86c537f35796ef06745",
  });
  //if we skip name property we will get validation error
  //validation can also be used as follow
  // course.vaidate()
  await course.save();
  console.log("document is save");
}
//createCourse()

async function getCourse() {
  //Get new course (just like Course.findAll() in sequilze)
  let _course = await Course.find()
    .limit(3)
    .sort({ name: 1 })
    .select({ name: 1, tags: 1 });
  //.count this will count return num of documents,,,remove select when using count

  //pagination
  // let pageNo = 2
  // let pageSize = 10
  //let _course =  await Course.find()
  // .skip((pageNo - 1) * pageSize)
  // .limit(pageSize)
  // .limit(3)
  // .sort({name:1})
  // .select({name:1, tags:1})

  //to fetch only that courses which meet follwing filters
  //let _course =  await Course.find({author:'mosh',isPublished:true})

  //,OPERATORS eq, ne, gt, gte, lt, lte, in, nin
  //Course.find({price: {$gte: 10, $lte: 20}})
  //Course.find({price: {$in: [10,20,30]}})

  //Logical operator
  //Course.find().or([{author:'saud'},{isPublished:true}])
  //Course.find().and([{author:'saud'},{isPublished:true}])

  //Regular expression
  //find courses where author name start with 'saud'
  //await Course.find({author:/^saud/})
  //find courses where author name end with 'saud'
  //await Course.find({author:/saud$/i})
  //find courses where author name contains  'saud'
  //await Course.find({author:/.*saud.*/i})
  console.log("get courses", _course);
}
getCourse();

//update course
async function updateCourse(id) {
  //QUERY FIRST APPRAOCH
  const course = await Course.findById(id);
  if (!course) return;

  course.isPublished = false;
  course.author = "saleem";

  let result = course.save();

  // const course = Course.update({_id:id},{
  //     $set: {
  //    author : mosh,
  //   isPublished = true
  //     }
  // })
}
updateCourse("620f7476f904d55784070188");

async function removeCourse() {
  await Course.deleteOne({ _id: id });
}

//RELATIONS IN MONGO
const ownerScehma = new mongoose.Schema({
  ownerName: {
    type: String,
    required: true,
  },
  ownerNationality: {
    type: String,
    required: true,
  },
});
let Owner = mongoose.model("Owner", ownerScehma);

async function createOwner() {
  let newlyCreatedOwner = new Owner({
    ownerName: "awais saleem",
    ownerNationality: "British",
  });
  newlyCreatedOwner.save();
}
//createOwner();

async function getCourseOwner() {
  const result = await Course.find().populate("owner");
  console.log("get course with owner", result);
}
//getCourseOwner();

//EMBEDDING DOCUMENTS (parent documents has child document in one of its field)
//child document
const childScehma = new mongoose.Schema({
  childName: {
    type: String,
    required: true,
  },
  childNationality: {
    type: String,
    required: true,
  },
});
let Child = mongoose.model("Child", childScehma);

//parent document
const parentScehma = new mongoose.Schema({
  parentName: {
    type: String,
    required: true,
  },
  child: {
    type: childScehma,
  },
});
let Parent = mongoose.model("Parent", parentScehma);

async function createEmbeddedDocumnet() {
  let newlyCreatedOwner = new Parent({
    parentName: "M. Saleem",
    child: new Child({
      childName: "Abu Baker",
      childNationality: "American",
    }),
  });
  newlyCreatedOwner.save();
}
//createEmbeddedDocumnet();

async function getEmbeddedDocumnet() {
  const result = await Parent.find();
  console.log("get parent with child", result);
}
// getEmbeddedDocumnet();
//update child document (by giving parent id)
async function updateChildDocumnet(id) {
  let parent = await Parent.findById(id);
  parent.child.name = "some new name";
  parent.save();
  // we can update with follwing way also
  // let parent = await Parent.update({_id: id},{
  //     $set: {
  //         'child.name' : "some new name"
  //     }
  // })
  console.log("updated child", parent);
}
// updateChildDocumnet();

//to remove field (child documnet) from parent documnet use 'unset'
async function removeFieldFromDocumnet(id) {
  let parent = await Parent.updateOne(
    { _id: id },
    {
      $unset: {
        child: "",
      },
    }
  );
}


//USING ARRAY AS SUB-DOCUMENT
const childScehmaArr = new mongoose.Schema({
    childName: {
      type: String,
      required: true,
    },
    childNationality: {
      type: String,
      required: true,
    },
  });
  let ChildArr = mongoose.model("ChildArr", childScehmaArr);
  
  //parent document
  const parentScehmaArr = new mongoose.Schema({
    parentName: {
      type: String,
      required: true,
    },
    child: {
      type: [childScehma], //array of sub documents
    },
  });
  let ParentArr = mongoose.model("ParentArr", parentScehmaArr);
  
  async function createEmbeddedDocumnetArr() {
    let newlyCreatedOwner = new ParentArr({
      parentName: "M. Saleem",
      child: [new Child({
        childName: "Abu Baker",
        childNationality: "American",
      })],
    });
    newlyCreatedOwner.save();
  }
  //createEmbeddedDocumnetArr();
  //add another child in already created parentArr
  async function addChildArr(id){
      let newlyAddedChild = await ParentArr.findById(id)
      newlyAddedChild.child.push(new Child({
        childName: "Zain Saleem",
        childNationality: "Arabic",
      }))
      newlyAddedChild.save()
  }
  //addChildArr('62120171aa5808aa4354ba37')

  async function removeChildArr(parentId,childId){
      let parentArr = await ParentArr.findById(parentId)
      let child = parentArr.child.id(childId)
      child.remove()
      parentArr.save()
  }
  //removeChildArr('62120171aa5808aa4354ba37','62120171aa5808aa4354ba36')




const startUpDebugger = require("debug")("app:startup"); //it will return startup debugger which will run on startup workspace
//set DEBUG workspace in .env file
const dbDebugger = require("debug")("app:db"); //it will return db debugger which will run on db workspace

const config = require("config"); //this config package manages app configurations like mail server etc by current environmant
//like development or production
startUpDebugger("Name", config.get("name")); //these functions returns diffrent values depending upon current environment
console.log("Mail server", config.get("mail.host"));
//console.log("Mail PASSWORD",config.get('mail.password'))

const helmet = require("helmet");
const morgan = require("morgan");

const indexRoute = require("./routes/index");
const express = require("express");
const app = express();
//BUILD IN MIDDLEWARES
app.use(express.json()); //to parse JSON request into request.body
app.use(express.urlencoded({ extended: true })); //to parse incoming url encoded (name=saud&id=1) into req.body. (extended true means it can also handle array and complex objects present req)
app.use(express.static("public")); //to serve statuc files like images/css files etc
//THIRD PARTY MIDDLEWARE
app.use(helmet());

//set templating engine
app.set("view engine", "pug"); //using this statement express will internally load Pug package, we dont have to manually require this package
app.set("views", "./views"); //from where views will be serve

app.use("/", indexRoute);

if (app.get("env") === "development") app.use(morgan("tiny"));
app.get("/", (req, res) => {
  res.send("hello world");
});
//render HTML
app.get("/html", (req, res) => {
  res.render("index", { title: "My Express App", message: "Hello from Pug" });
});

console.log(app.get("env"));
const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`listing on port ${port}`);
});


//we can also attach methods to mongo model
// User.method.generateAuthToken = function(){some logic to generate jwt tokwn}
//SOME USEFUL METHODS OF LOADASH
// _ = require("loadash")
//pick method: it is used to extract spicific proprties from an object
// _.pick(obj, ['name', 'email'])

//Bycrpt
//use bycrypt.genSalt(10) to generate salt

//we can set token in response header
//prefic custom header with x-
//res.header('x-auth-token',token).send(obj)

//we can fetch token from request header like this
//req.header('x-auth-token')

//always use try catch to handle errors
//use npm express-async-errors to handle errors

//LOGGING ERROR
//use npm winston to log error messages on console or in files
//use npm winston-mongodb to log messages on mongodb

//Log error which occur outside express routes
//use process.on('uncaughtException',function(error){handle or log error})
//OR use winston.handleExceptions(new winston.transport.File{filename:xyz})
//this will only work for errors which occur in synchrnos code

//for handling uncaught promise rejection (for async code errors)
//use process.on('unhandledRejection',function(error){handle or log error})

//create error middleware and use that middleware at the end of all routes, so if error occur in
//that routes or in routes handler then it will be caught at at this error middlware
// app.use(error)
//shape of middleware
//function(error, req, res, next){ // }

//use next(error) in catch, so error will throw/reached to above defined error middleware