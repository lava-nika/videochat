const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server, {
	cors: {
		//origin: "http://localhost:3000",
		origin: "*",
		methods: [ "GET", "POST" ]
	}
})

// Deployment changes
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.send('Running');
});

// Create a connection between 2 people through socket id's
io.on("connection", (socket) => {

	//for video call
	socket.emit("me", socket.id)

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	})

	// to call a user by their id; data.userToCall - will pass in from front end
	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	})

	//answering the call
	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	})
	
	 // For chat application
	socket.on('message', ({ name, message }) => {
		io.emit('message', { name, message })
	})
})

// To get the server running
//server.listen(5000, () => console.log("server is running on port 5000"))
server.listen(PORT, () => console.log("server is running on port ${PORT}"))