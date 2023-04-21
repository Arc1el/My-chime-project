import logo from './logo.svg';
import './App.css';
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { forwardRef, useEffect, useState, useRef } from "react";
import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
} from "amazon-chime-sdk-js";
import axios from "axios";
const logger = new ConsoleLogger("Logger", LogLevel.INFO);
const deviceController = new DefaultDeviceController(logger);


function App() {
  const [meetingSession, setMeetingSession] = useState(null);
  const [hasStartedMediaInputs, setStartedMediaInputs] = useState(false);

  const handleJoin = (joining) => {
    createMeetingSession(joining).then((it) => setMeetingSession(it));
  };

  useEffect(() => {
    if (!meetingSession) {
      return;
    }
    const setupInput = async ({ audioId, videoId } = {}) => {
      if (!audioId || !videoId) {
        throw new Error("No video nor audio input detected.");
      }

      if (audioId) {
        const audioInputDevices =
          await meetingSession.audioVideo.listAudioInputDevices();
        if (audioInputDevices.length) {
          await meetingSession.audioVideo.startAudioInput(audioId);
        }
      }

      if (videoId) {
        const videoInputDevices =
          await meetingSession.audioVideo.listVideoInputDevices();
        if (videoInputDevices.length) {
          const defaultVideoId = videoInputDevices[0].deviceId;
          console.warn("starting video input");
          await meetingSession.audioVideo.startVideoInput(
            videoId === "default" ? defaultVideoId : videoId
          );
          setStartedMediaInputs(true);
        }
      }
    };

    setupInput({ audioId: "default", videoId: "default" }).then(() => {
      const observer = {
        audioInputMuteStateChanged: (device, muted) => {
          console.warn(
            "Device",
            device,
            muted ? "is muted in hardware" : "is not muted"
          );
        },
      };
      meetingSession.audioVideo.addDeviceChangeObserver(observer);

      meetingSession.audioVideo.start();
    });
    
  }, [meetingSession]);

  return (
    <Box
      width="100%"
      paddingBottom="50px"
      paddingTop="50px"
      overflow="auto"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <MainHeader />
      <MainJoiningMeeting onJoin={handleJoin} />
      {meetingSession && hasStartedMediaInputs && (
        <>
          <Controls meetingSession={meetingSession} />
          <VideoLocalOutput meetingSession={meetingSession} />
          <VideoRemoteOutput meetingSession={meetingSession} />
        </>
      )}
    </Box>
  );
}

async function createMeetingSession({ room }) {
  const params = new URLSearchParams([["room", room]]);
  const response = await axios.get("/chime-integration/meeting-session", {
    params,
  });
  console.log(response.data);

  const meetingResponse = response.data.meeting_response;
  const attendeeResponse = response.data.attendee_response;

  // const { meetingResponse, attendeeResponse } = response.data;

  const configuration = new MeetingSessionConfiguration(
    meetingResponse,
    attendeeResponse
  );

  const meetingSession = new DefaultMeetingSession(
    configuration,
    logger,
    deviceController
  );

  return meetingSession;
}

function MainHeader() {
  return (
    <Container maxWidth="xs">
      <Box component="header" textAlign="center">
        <Typography component="h1" variant="h4">
          <img src="SmileShark_Logo_horizontal.png" width="100%"></img>
        </Typography>
      </Box>
    </Container>
  );
}

function MainJoiningMeeting({ onJoin }) {
  const handleSubmit = (event) => {
    event.preventDefault();

    const joining = {
      room: event.target.room.value,
    };
    onJoin(joining);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Typography component="p" variant="body1" marginTop="0px" fontSize="12px" align="right">
        시작하거나 회의실에 JOIN 해주세요.
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          name="room"
          label="회의실이름"
          placeholder="공란으로 두지 마세요"
          maxLength="64"
          minLength="2"
          margin="normal"
          fullWidth
          required
        />
        <Button type="submit"
         variant="contained" 
         fullWidth
         style={{
          marginTop: "5px",
          borderRadius: 5,
          backgroundColor: "#265e9a",
          width: "100%",
          fontSize: "10px",
          boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 2px 2px rgba(0,0,0,0.23)"
        }}
         >
          회의 시작
        </Button>
      </Box>
    </Container>
  );
}

function Controls({ meetingSession }) {
  return (
    <Container component="main" maxWidth="xs">
      <Box component="section" textAlign="center" maxWidth="xs" marginBottom="5px">
        <Button
          type="button"
          style={{
            borderRadius: 5,
            backgroundColor: "#265e9a",
            width: "100%",
            fontSize: "10px",
            color: "white",
            boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 2px 2px rgba(0,0,0,0.23)",
            marginTop: "10px"
          }}
          onClick={() => meetingSession.audioVideo.stop()}
        >
          회의 종료
        </Button>
      </Box>
    </Container>
  );
}

function VideoLocalOutput({ meetingSession }) {
  const videoRef = useRef(null);
   useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    const videoElement = videoRef.current;

    const observer = {
      videoTileDidUpdate: (tileState) => {
        if (!tileState.boundAttendeeId || !tileState.localTile) {
          return;
        }
        meetingSession.audioVideo.bindVideoElement(
          tileState.tileId,
          videoElement
        );
      },
    };
    meetingSession.audioVideo.addObserver(observer);

    meetingSession.audioVideo.startLocalVideoTile();
  }, [meetingSession]);
  return (
    <Box component="section" textAlign="center">
      
      <PeerBox enabled>
        <Video ref={videoRef} />
      </PeerBox>
    </Box>
  );
}

function VideoRemoteOutput({ meetingSession }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    const videoElement = videoRef.current;

    const observer = {
      videoTileDidUpdate: (tileState) => {
        if (
          !tileState.boundAttendeeId ||
          tileState.localTile ||
          tileState.isContent
        ) {
          return;
        }
        meetingSession.audioVideo.bindVideoElement(
          tileState.tileId,
          videoElement
        );
      },
    };
    meetingSession.audioVideo.addObserver(observer);
  }, [meetingSession]); 
  return (
    <Box component="section" textAlign="center">
      <PeerBox enabled>
        <Video ref={videoRef} width="100%"/>
      </PeerBox>
    </Box>
  );
}

const PeerBox = ({ enabled, ...props }) => (
  <Box
    display={enabled ? 'inline-block' : 'none'}
    width="400px"
    height="200px"
    backgroundColor="black"
    margin="10px"
    borderRadius="5px"
    boxShadow="0 10px 20px rgba(0,0,0,0.19), 0 2px 2px rgba(0,0,0,0.23)"
    {...props}
  />
);

const Video = forwardRef((props, ref) => (
  <video
    ref={ref}
    width="100%"
    height="100%"
    style={{ objectFit: 'cover', borderRadius: "5px" }}
    {...props}
  />
));

export default App;
