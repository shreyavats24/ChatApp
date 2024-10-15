const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const chatModel = require("../models/chatModel");
const { makeToken, getUser } = require("./token");
let errorMsg;
const registerLoad = async function (req, res) {
    try {
        res.render("register");
    } catch (error) {
        console.log(error.message);
    }
}
const register = async function (req, res) {
    try {
        let password = await bcrypt.hash(req.body.password, 10);
        const user = new userModel({
            username: req.body.name,
            email: req.body.email,
            password: password,
            image: "images/" + req.file.filename
        })
        await user.save();
        res.render("register", { message: "registeration success" })
    } catch (error) {
        console.log(error.message)
    }
}

const loadLogin = async function (req, res) {
    try {
        res.render("login", { message: errorMsg });
        errorMsg = undefined;
    } catch (error) {
        console.log(error.message);
    }
}

const loginMethod = async function (req, res) {
    try {
        const userdata = await userModel.findOne({ email: req.body.email });
        if (userdata) {
            const matched = await bcrypt.compare(req.body.password, userdata.password);
            if (matched) {
                const userdata = await userModel.findOneAndUpdate({ email: req.body.email }, {
                    is_online: '1'
                });
                const token = await makeToken(userdata);
                res.cookie('mycookie', token);

                res.redirect("/dashboard");
            }
            else {
                res.redirect("/");
                errorMsg = "email or password is invalid!!!";
            }
        }
        else {
            res.redirect("/");
            errorMsg = "email or password is invalid!!!";
        }

    } catch (error) {
        console.log(error.message);
    }
}
const logout = async function (req, res) {
    try {
        const user = await getUser(req.cookies.mycookie);
        if (user) {
            const data = await userModel.findOneAndUpdate({ email: user.email }, {
                is_online: '0'
            }, { new: true })
            res.clearCookie('mycookie');
            res.redirect("/");
        }
    } catch (error) {
        console.log(error.message);
    }
}
const loadDashboard = async function (req, res) {
    try {
        const user = await getUser(req.cookies.mycookie);
        if (user) {
            const users = await userModel.find({ _id: { $nin: user.id } });
            res.render("dashboard", { user: user, users: users })
        }
        else {
            res.redirect("/");
            errorMsg = "please login first!!";
        }
    } catch (error) {
        console.log(error.message);
    }
}

const saveChat = async function (req, res) {
    try {
        const user = getUser(req.cookies.mycookie);
        var chat = new chatModel({
            sender_id: user.id,
            receiver_id: req.body.receiverId,
            message: req.body.message
        })
        await chat.save();
        res.status(200).send({ success: true, msg: 'chat post', time: chat.updatedAt })

    } catch (error) {
        console.log(error.message);
        res.status(400).send({ success: false, msg: error.message })
    }
}
const getProfile = async (req, res) => {
    const data = getUser(req.cookies.mycookie);
    if (data) {
        try {
            const user = await userModel.findOne({ email: data.email });
            let date = new Date(user.createdAt);
            let dateOnly = date.toISOString().split('T')[0];
            res.render("profile", { user: user,member:dateOnly});
        } catch (error) {
            console.log("error loading profile:",error.message);
        }
    }
    else {
        res.redirect("/");
        errorMsg = "Please login First!!";
    }
}
module.exports = {
    registerLoad, register, loadLogin, loginMethod, logout, loadDashboard, saveChat, getProfile
}