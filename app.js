var express=require('express')
const app=express()
const cors=require('cors')
const bodyParser=require('body-parser');
const crypto=require('crypto');

const cookieParser=require("cookie-parser");
const sessions=require("express-session");

const host='localhost';
const port=5000;

var mongoose=require('mongoose');
mongoose.Promise=global.Promise;
mongoose.connect("mongodb+srv://harisharun:harisharun@todoapp.dr7nhgm.mongodb.net/");

var userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String
})
var User=mongoose.model("User",userSchema,"User");

var todoSchema = new mongoose.Schema({
    task: String,
    due: String,
    desc: String,
    user: String
})
var Todo=mongoose.model("Todo",todoSchema,"Todo");



function hashpwd(pwd){
    return crypto.createHash('sha256').update(pwd).digest('base64').toString();
}

app.use(cors());
app.use(bodyParser.json());

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));
app.use(cookieParser());
var session;


app.post('/auth/login',async (req,res)=>{
    try{
        let hashpassword=hashpwd(req.body.password);
        let logger={
            email: req.body.email,
            password: hashpassword
        };
        const person=await User.findOne({email:logger.email});
        console.log(person);
        if(person.password==logger.password){
            session=req.session;
            session.user=logger.email;
            res.status(200).json({"status":"success","user":session.user});
        }
        else{
            res.status(401).json({"status":"failed"});
        }
    }
    catch(err){
        res.status(400).json({"status":"failed"});
    }
});
app.post('/auth/register',async (req,res)=>{
    try{
        let hashpassword=hashpwd(req.body.password);
        let person={
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: hashpassword
        };
        await User.create(person);
        console.log(person);
        session=req.session;
        session.user=person.email;
        res.status(201).json({"status":"success","user":session.user});
    }
    catch(err){
        res.status(400).json({"status":"failed"});
    }
});

app.get('/tasks', async (req,res)=>{
    try{
        const todos= await Todo.find({user:session.user});
        res.status(200).json(todos);
    }
    catch(err){
        res.status(400);
    }
});

app.post('/tasks', async (req,res)=>{
    try{
        let data={...req.body,user:session.user};
        console.log(data);
        await Todo.create(data);
        const todos= await Todo.find({user:session.user});
        res.status(200).json(todos);
    }
    catch(err){
        res.status(400);
    }
});

app.get("/logout",(req,res)=>{
    req.session.destroy();
    console.log("Sessoion ended");
    res.status(200).json({"status":"success"});

})

app.delete('/removetask',async (req,res)=>{
    try{
        console.log(req.body);
        await Todo.deleteOne(req.body);
        const todos= await Todo.find({user:session.user});
        res.status(200).json(todos);
    }
    catch(err){
        res.status(400);
    }
});

app.listen(port,host,function(){
    console.log("runs in http://" + host+":"+port);
    console.log(__dirname);
});

