const mongoose = require("mongoose");
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const path = require("path");
const cookieParser = require("cookie-parser");
const socketIo = require("socket.io");
const io = socketIo(server);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(path.resolve("./public")));
app.use(cookieParser());

const userRoute = require("./routes/userRoute");
const userModel = require("./models/userModel");
const chatModel = require("./models/chatModel");
const { getUser, makeToken } = require("./Controllers/token");
// const http = require("http").Server(app);
app.use("/", userRoute);
const newUsers = [];
io.on("connection", async function (socket) {
    console.log("user connected!!");

    let user = getUser(socket.handshake.auth.token);
    console.log(user);
    let socketId = socket.id;
    let userId = user.id;
    let existingUser = newUsers.find(u => u.userId === userId);
    if (existingUser) {
        existingUser.socketId = socketId; // Update socketId if the user exists
    } else {
        newUsers.push({ socketId, userId }); // Add new user
    }

    if (!user) {
        socket.disconnect();
    }
    if (user.id) {
        // find user by id nd update online status
        const data = await userModel.findByIdAndUpdate({ _id: user.id }, { $set: { is_online: '1' } }, { new: true });
        let id = data._id.toString();
        // console.log("Id",id);
        socket.broadcast.emit('onlineUser', id);
    }

    // sent msg to selected receiver
    socket.on('chatMessage', (data) => {
        console.log("newUsers:", newUsers);
        let recipient = newUsers.find(u => u.userId === data.receiverId);
        console.log(recipient);
        if (recipient) {
            let msg = data.message;
            let sender_id = user.id;
            let receiver_id = recipient.userId;

            socket.to(recipient.socketId).emit('message', { msg, sender_id, receiver_id });
        }
    })

    // load existing chats
    socket.on('existing-chat', async (data) => {
        console.log("in existing chats");
        var chats = await chatModel.find({
            $or: [
                { sender_id: data.senderId, receiver_id: data.receiverId },
                { sender_id: data.receiverId, receiver_id: data.senderId }
            ]
        });
        socket.emit('loadChats',{chats:chats});
    })

    
    socket.on("disconnect", async function (reason) {
        console.log("user disconnected because ", reason);
        let user = await getUser(socket.handshake.auth.token);
        if (user && user.id) {
            try {
                const data = await userModel.findByIdAndUpdate({ _id: user.id }, { $set: { is_online: '0' } })
                let id = data._id.toString();
                // console.log("Id",id);
                socket.broadcast.emit('offlineUser', id);
            } catch (error) {
                console.log(error.message);
            }
        }
    })
})

server.listen("3000", () => {
    console.log("server is running at 3000");
})