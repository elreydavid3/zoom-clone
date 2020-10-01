
const socket = io("/");

const videoGrid = document.getElementById("video-grid");
console.log(videoGrid);
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
});

//functionality where user sees his/her own video
let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    //allow access to video
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      console.log("user connected.,..........");
      setTimeout(function () {
        connectToNewUser(userId, stream);
      }, 5000);
    });

    //get message using jquery
let text = $('input')
//to get user message when after clicking enter button
//if the input pressing enter exist, you emit(send) value of the input
//then clear input
$('html').keydown((e) =>{
  if(e.which == 13 && text.val().length !== 0) {
    socket.emit('message', text.val());
    text.val('')
  }
})

socket.on('createMessage', message => {
  //append messages to ul tags in html (ejs) file
  console.log('create message', message)
  $('ul').append(`<li class="message"><b>user</b><br/>${message}</li>`)
  scrollToBottom()
})
  });

peer.on("open", (id) => {
  //this specific person has joined the room and we pass in id
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  //call user, send him your stream
  const call = peer.call(userId, stream);
  //create a new video element for other user
  //so basically when you receive other users stream you're going to add that video stream
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peer[userId] = call;
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  //after loading all the data for this specific stream play video
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  //put the video in html element on front end
  videoGrid.append(video);
};

const scrollToBottom = () => {
  let d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

//mute our video
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}


const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}