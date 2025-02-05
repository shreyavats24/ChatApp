const jwt = require("jsonwebtoken");
const secret = "Shreya$123";
function makeToken(userObj,singleField = false )
{
    if(singleField)
    {
        const payload ={
            email:userObj.email
        };
        return jwt.sign(payload,secret,{ expiresIn: '1m' });
    }
    else
    {
        const payload={
            username:userObj.username,
            email:userObj.email,
            password:userObj.passcode,
            id:userObj.id,
            image:userObj.image,
            // is_online:userObj.is_online
            // time:userObj.time
        };
        return jwt.sign(payload,secret,{expiresIn:'1h'});
    }
}

function getUser(token)
{ 
    if(!token) return null;
    try{
        return jwt.verify(token,secret);
    }
    catch(err)
    {
        console.log(err);
        return null;
    }
}

module.exports={
    makeToken,
    getUser
}