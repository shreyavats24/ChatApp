// var mongoose = require("mongoose");
const path= require("path");
const express =require("express");
const user_route = express();
const bodyParser=require("body-parser");
const multer = require("multer");
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));
user_route.set("view engine",'ejs');
user_route.use(express.static("public"));
const auth = require("../middlewares/auth");
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,"../public/images"))
    },
    filename:function(req,file,cb){
        const name = Date.now() + "-" + file.originalname;
        cb(null,name);
    }
})
const upload = multer({storage:storage}); 
const userController = require("../Controllers/userControllers");
user_route.get("/home",(req,res)=>{
    res.render("homepage")
})
//load page
user_route.get("/register",auth.islogout,userController.registerLoad)
//post data
user_route.post("/register",upload.single('image'),userController.register);
user_route.get("/",auth.islogout,userController.loadLogin);
user_route.post("/",userController.loginMethod);
user_route.get("/logout",auth.islogin,userController.logout);
user_route.get("/dashboard",auth.islogin,userController.loadDashboard);
user_route.post("/saveChat",userController.saveChat)
user_route.get("/profile",auth.islogin,userController.getProfile)

user_route.get("*",function(req,res){
    res.redirect("/home");
})

module.exports= user_route