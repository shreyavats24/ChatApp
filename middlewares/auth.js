const {getUser}= require("../Controllers/token");
const islogin = async function (req,res,next){
    try {
        const user = getUser(req.cookies.mycookie)
        if(user){
            // res.redirect("/dashboard");
            next();
        }
        else{
            res.redirect("/");
        }    
    } catch (error) {
        console.log(error.message);
    }
}
const islogout = async function (req,res,next){
    try {
        const user = getUser(req.cookies.mycookie)
        if(user){
            res.redirect("/dashboard");
        }
        else{
        next();
        }
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    islogin,islogout
}