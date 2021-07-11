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
import { Modal } from 'react-bootstrap';
import CallEndIcon from '@material-ui/icons/CallEnd';
import SendIcon from '@material-ui/icons/Send';
//import { Button } from 'react-bootstrap';

import 'font-awesome/css/font-awesome.min.css';


const socket = io.connect('https://lava-chat.herokuapp.com/')
function App() {
	
	//Video

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
		//const {name, message} = state
		const { message} = state
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


	// temp code
	/*function enableMute() { 
		myVideo.muted = true;
	}	*/

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
			trickle: false,
			stream: stream
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
			trickle: false,
			stream: stream
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


// TRIAL ID/Name details IMPLEMENTATION

	const [show, setShow] = useState(false);
  
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);





// rendering chat
	/*const enterPressed = (event) => {
		var code = event.keyCode || event.which;
		if(code === 13) { //13 is the enter keycode
			//Do stuff in here
			{renderChat()}
		} 
	}
	const textChange = (event) => {
		this.setState({
		  name: event.target.value,
		})
	  } */

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
                            
                            <button><SendIcon color="primary"></SendIcon></button>
						</form>
						
					</div>
			</div>

		</div>
		</>
	)
}

export default App
