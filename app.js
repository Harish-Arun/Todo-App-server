var express=require('express')
const app=express()
const cors=require('cors')
const bodyParser=require('body-parser');
const crypto=require('crypto');



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
    desc: String
})
var Todo=mongoose.model("Todo",todoSchema,"Todo");



function hashpwd(pwd){
    return crypto.createHash('sha256').update(pwd).digest('base64').toString();
}

app.use(cors());
app.use(bodyParser.json());


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
            res.status(200).json({"status":"success"});
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
        res.status(201).json({"status":"success"});
    }
    catch(err){
        res.status(400).json({"status":"failed"});
    }
});

app.get('/tasks', async (req,res)=>{
    try{
        const todos= await Todo.find();
        res.status(200).json(todos);
    }
    catch(err){
        res.status(400);
    }
});

app.post('/tasks', async (req,res)=>{
    try{
        console.log(req.body);
        await Todo.create(req.body);
        const todos= await Todo.find();
        res.status(200).json(todos);
    }
    catch(err){
        res.status(400);
    }
});

app.delete('/removetask',async (req,res)=>{
    try{
        console.log(req.body);
        await Todo.deleteOne(req.body);
        const todos= await Todo.find();
        res.status(200).json(todos);
    }
    catch(err){
        res.status(400);
    }
});

app.listen();

