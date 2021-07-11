import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import TextField from "@material-ui/core/TextField"
import AssignmentIcon from "@material-ui/icons/Assignment"
import PhoneIcon from "@material-ui/icons/Phone"
import React, { useEffect, useRef, useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import Peer from "simple-peer"
import io from "socket.io-client"
import "./App.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faMicrophone } from '@fortawesome/free-solid-svg-icons'
import { faVideo } from '@fortawesome/free-solid-svg-icons'
import e from "cors"
import { text } from "@fortawesome/fontawesome-svg-core"
//import { Modal } from 'react-bootstrap';
import CallEndIcon from '@material-ui/icons/CallEnd';
import SendIcon from '@material-ui/icons/Send';

// const socket = io.connect('https://localhost3000')
// "proxy": "https://localhost5000/", - in package.json of frontend
const socket = io('https://lava-chat.herokuapp.com/');
function App() {

	// Video

	const [ me, setMe ] = useState("")
	const [ stream, setStream ] = useState()
	const [ receivingCall, setReceivingCall ] = useState(false)
	const [ caller, setCaller ] = useState("")
	const [ callerSignal, setCallerSignal ] = useState()
	const [ callAccepted, setCallAccepted ] = useState(false)
	const [ idToCall, setIdToCall ] = useState("")
	const [ callEnded, setCallEnded] = useState(false)
	const [ name, setName ] = useState("")
	const myVideo = useRef()
	const userVideo = useRef()
	const connectionRef= useRef()

	// var wrtc = require('wrtc')

	// Chat
	const [state, setState] = useState({message: '', name: ''})
	const [chat, setChat] = useState([])

	useEffect(() => {
		socket.on('message', ({name, message}) => {
			setChat([...chat, {name, message}])
		})
	})



	const onTextChange = e => {
		setState({...state, [e.target.name]: e.target.value})
	}

	const onMessageSubmit = (e) => {
		// prevents page refresh from happening
		e.preventDefault()
        // const {name, message} = state
		const { message } = state
		socket.emit('message', {name, message})
		setState({message: '', name })
	}

	const renderChat = () => {
		return chat.map(({name, message}, index) => (
			<div key={index}>
				<h3>
					{name}: <span>{message}</span>
				</h3>
			</div>
		))
	}



	// Video contd

	useEffect(() => {
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			setStream(stream)
				myVideo.current.srcObject = stream
		})



	socket.on("me", (id) => {
			setMe(id)
		})

		socket.on("callUser", (data) => {
			setReceivingCall(true)
			setCaller(data.from)
			setName(data.name)
			setCallerSignal(data.signal)
		})
	}, [])

	const callUser = (id) => {
		const peer = new Peer({
			initiator: true,
			/*secure: true,
			host: 'https://lava-chat.herokuapp.com/',
			path: '/peerjs',
			port: '443', */

			/* config: {
				iceServers: [{
					urls: "turn:numb.viagenie.ca",
					username: "muazkh",
					credential: "webrtc@live.com"
				}, {
					urls: [
						    "stun:stun.l.google.com:19302",
							"stun:global.stun.twilio.com:3478?transport=udp"
					]
				}]
			}, */
			//wrtc: wrtc,


		    config: {
				iceServers: [
					{
						
						username:"89ddbf36-ccdc-11e8-b472-8624bbdc6721",
						urls:["stun:w1.xirsys.com","turn:w1.xirsys.com:80?transport=udp","turn:w1.xirsys.com:3478?transport=udp","turn:w1.xirsys.com:80?transport=tcp","turn:w1.xirsys.com:3478?transport=tcp","turns:w1.xirsys.com:443?transport=tcp","turns:w1.xirsys.com:5349?transport=tcp"],
						credential:"89ddbfb8-ccdc-11e8-8a3d-a2ce2294350d"
						
						/*urls: [
							//"stun:66.102.1.127:19302", "stun:[2a00:1450:400c:c06::7f]:19302"
							"stun:sp-turn1.xirsys.com:443", "turn:sp-turn1.xirsys.com:443?transport=tcp"
						]*/
						
					},
					/*{
						urls: [
							"turn:74.125.140.127:19305?transport=udp",
							"turn:[2a00:1450:400c:c08::7f]:19305?transport=udp",
							"turn:74.125.140.127:19305?transport=tcp",
							"turn:[2a00:1450:400c:c08::7f]:19305?transport=tcp"
						],
						username: "ClrQztwFEgZjifbTqu4YqvGggqMKllCjBQ",
						credential: "plCgCU1ooXMn60Xoaaugcc6Ow+c="
					}*/
				]
			},

			trickle: false,
			stream: stream,
		})
		peer.on("signal", (data) => {
			socket.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: name
			})
		})
		peer.on("stream", (stream) => {
			
				userVideo.current.srcObject = stream
			
		})
		socket.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer
	}

	const answerCall =() =>  {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
            
			/* config: {
				iceServers: [{
					urls: "turn:numb.viagenie.ca",
					username: "muazkh",
					credential: "webrtc@live.com"
				}, {
					urls: [
						    "stun:stun.l.google.com:19302",
							"stun:global.stun.twilio.com:3478?transport=udp"
					]
				}]
			}, */


			config: {
				iceServers: [
					{
						
						username:"89ddbf36-ccdc-11e8-b472-8624bbdc6721",
						urls:["stun:w1.xirsys.com","turn:w1.xirsys.com:80?transport=udp","turn:w1.xirsys.com:3478?transport=udp","turn:w1.xirsys.com:80?transport=tcp","turn:w1.xirsys.com:3478?transport=tcp","turns:w1.xirsys.com:443?transport=tcp","turns:w1.xirsys.com:5349?transport=tcp"],
						credential:"89ddbfb8-ccdc-11e8-8a3d-a2ce2294350d"
						
						/*urls: [
							//"stun:66.102.1.127:19302", "stun:[2a00:1450:400c:c06::7f]:19302"
							"stun:sp-turn1.xirsys.com:443", "turn:sp-turn1.xirsys.com:443?transport=tcp"
						]*/
						
					},
					/*{
						urls: [
							"turn:74.125.140.127:19305?transport=udp",
							"turn:[2a00:1450:400c:c08::7f]:19305?transport=udp",
							"turn:74.125.140.127:19305?transport=tcp",
							"turn:[2a00:1450:400c:c08::7f]:19305?transport=tcp"
						],
						username: "ClrQztwFEgZjifbTqu4YqvGggqMKllCjBQ",
						credential: "plCgCU1ooXMn60Xoaaugcc6Ow+c="

					}*/
				]
			},


			trickle: false,
			stream: stream,
			
		})
		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (stream) => {
			userVideo.current.srcObject = stream
		})

		peer.signal(callerSignal)
		connectionRef.current = peer
	}

	const leaveCall = () => {
		setCallEnded(true)
		connectionRef.current.destroy()
	}

    // Mute/unmute

	let isAudio = true

	let isVideo = true

	const toggleAudio = () => {

		isAudio = !isAudio
		stream.getAudioTracks()[0].enabled = isAudio

	}

	const toggleVideo = () => {

		isVideo = !isVideo
		stream.getVideoTracks()[0].enabled = isVideo

	}

	return (
	    <>
			
		<div className="container">
			<div className="video-container" class="container__left">
				<div className="video" class="container__videos">
					<div id="video-grid">
					    {stream &&  <video playsInline muted ref={myVideo} autoPlay style={{ width: "325px" }} />}
				    </div>
				</div>

				
				<div className="video" class="container__videos">
					{callAccepted && !callEnded ?
					<video playsInline ref={userVideo} autoPlay style={{ width: "325px"}} />:

					null}
				</div>
                <div>
				    {receivingCall && !callAccepted ? (
					    	<div className="caller">
						    <h2>{name} is calling...</h2>
						    <Button variant="contained" color="primary" onClick={answerCall}>
							    Answer
						    </Button>
					    </div>
				    ) : null}
                </div>
				<div class="container__controls">
					<div class="container__controls__block">
						<div class="container__controls__button">
						    <FontAwesomeIcon icon={faMicrophone} onClick={toggleAudio} />
							<span class="mic" onClick={toggleAudio}>Mute</span>
						</div>
						<div class="container__controls__button">
						    <FontAwesomeIcon onClick={toggleVideo} icon={faVideo} />
							<span class="camera" onClick={toggleVideo}>Camera</span>
						</div>
						
						<div class="container__controls__button">
						    
							{callAccepted && !callEnded ? (
                                    <CallEndIcon aria-label="callEnd" fontSize="large" color="secondary"
									onClick={leaveCall}/>	
					        ) : (
						    <IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
							    <PhoneIcon fontSize="large" color="primary"/>
						    </IconButton>
					        )}
					        
						</div>
					</div>

				</div>

			</div>
			<div className="myId">
				<TextField
					id="filled-basic"
					label="Name"
					variant="filled"
					value={name}
					onChange={(e) => setName(e.target.value)}
					style={{ marginBottom: "20px" }}
				/>
				<CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
					<Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
						Copy ID
					</Button>
				</CopyToClipboard>

				<TextField
					id="filled-basic"
					label="ID to call"
					variant="filled"
					value={idToCall}
					onChange={(e) => setIdToCall(e.target.value)}
				/>
				
			</div>
			
			<div className="" class="container__right">
				    <div class="container__header">
						<h2>Chat</h2>
					</div>
					<div class="container__chat_window">
					    <ul class="messages" className="render-chat">
							{renderChat()}
						</ul>
					</div>
					
					<div class="message_container">
						
						<form onSubmit = {onMessageSubmit}>
					        <input
							id="chat_message" type="text" placeholder="Type message here..."
							name="message" 
							onChange={e => onTextChange(e)} 
						    value={state.message} 
							/*id="outlined-multiline-static"*/
							/*variant="outlined"*/
							label="Message"
							/>
                            
                            <button><SendIcon color="primary" style ></SendIcon></button>
						</form>
						
					</div>
			</div>

		</div>
	    </>
	)
}

export default App