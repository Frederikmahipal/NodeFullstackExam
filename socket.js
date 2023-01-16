module.exports = (server) => {
    const io = require('socket.io')(server);
    let onlineUsers = 0;
    io.on("connection", socket => {
        onlineUsers++;
        io.emit("onlineUsers", onlineUsers);
        console.log("A user connected");
        socket.on("disconnect", () => {
            onlineUsers--;
            io.emit("onlineUsers", onlineUsers);
            console.log("A user disconnected");
        });
        
        socket.on("fetchOnlineUsers", () => {
            socket.emit("onlineUsers", onlineUsers);
        });
    
    });
    return io;
}

