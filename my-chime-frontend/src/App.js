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
  // 세션 생성
  const [meetingSession, setMeetingSession] = useState(null);
  const [hasStartedMediaInputs, setStartedMediaInputs] = useState(false);

  // join핸들러. 미팅세션 만들고-> 미팅세션을 세팅
  const handleJoin = (joining) => {
    createMeetingSession(joining).then((it) => setMeetingSession(it));
  };

  // 리액트컴포넌트가 렌더링 될때마다 실행되는 후크(hooks). 비동기처리에 사용
  useEffect(() => {
    //미팅세션이 없는경우
    if (!meetingSession) {
      return;
    }

    // 미팅세션이 존재하는경우 audioId, videoId를 활용해서 세팅하는 함수
    const setupInput = async ({ audioId, videoId } = {}) => {
      if (!audioId || !videoId) {
        throw new Error("No video nor audio input detected.");
      }
      // 오디오
      if (audioId) {
        const audioInputDevices =
          await meetingSession.audioVideo.listAudioInputDevices();
        if (audioInputDevices.length) {
          await meetingSession.audioVideo.startAudioInput(audioId);
        }
      }
      // 비디오
      if (videoId) {
        const videoInputDevices =
          await meetingSession.audioVideo.listVideoInputDevices();
        if (videoInputDevices.length) {
          const defaultVideoId = videoInputDevices[0].deviceId;
          console.warn("starting video input");
          await meetingSession.audioVideo.startVideoInput(
            videoId === "default" ? defaultVideoId : videoId
          );
          // 스테이트 변경
          setStartedMediaInputs(true);
        }
      }
    };

    // 인풋 설정하기
    setupInput({ audioId: "default", videoId: "default" }).then(() => {
      // 옵저버
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

  // 컨트롤 패널 리턴 (동적으로 출력)
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
  // useEffect 종료
}

// useEffect 이전에 실행되는 미팅세션 만드는 함수
async function createMeetingSession({ room }) {
  // 파라미터 생성하고
  const params = new URLSearchParams([["room", room]]);
  // 파라미터를 담아 서 get 요청
  const response = await axios.get("/chime-integration/meeting-session", {
    params,
  });
  // response.data는 미팅세션에 대한 데이터를 담고 있음
  console.log(response.data);

  // 바디에서 리스폰스를 분리해서 따로 정의
  const meetingResponse = response.data.meeting_response;
  const attendeeResponse = response.data.attendee_response;

  // 리스폰스를 전달하여 configureation 생성
  const configuration = new MeetingSessionConfiguration(
    meetingResponse,
    attendeeResponse
  );

  // 디폴트 미팅세션에 생성한 configuration, logger, deviceController할당하여 미팅세션 생성
  const meetingSession = new DefaultMeetingSession(
    configuration,
    logger,
    deviceController
  );

  // 미팅세션을 반환
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

// join하는 경우 실행되는 함수 -> 무조건 실행
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
var store_s3_flag = 0;
async function storeS3request(meetingSession) {
  store_s3_flag += 1;
  store_s3_flag = store_s3_flag % 2;
  console.log("s3 meeting id", meetingSession._configuration.meetingId);
  const params = {
    meetingId : meetingSession._configuration.meetingId,
    s3_flag : store_s3_flag
  }
  const response = await axios.post("/store_s3", params);

  // print response
  console.log(response.data);
}

function Controls({ meetingSession }) {
  return (
    <Container component="main" maxWidth="xs">
      <Box component="section" textAlign="center" maxWidth="xs" marginBottom="5px">
        <Button
          type="button"
          style={{
            borderRadius: 5,
            backgroundColor: "#8B0000",
            width: "50%",
            fontSize: "10px",
            color: "white",
            boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 2px 2px rgba(0,0,0,0.23)",
            marginTop: "10px"
          }}
          onClick={() => meetingSession.audioVideo.stop()}
        >
          회의 종료
        </Button>
        <Button
          type="button"
          style={{
            borderRadius: 5,
            backgroundColor: "#006400",
            fontSize: "10px",
            "width": "50%",
            color: "white",
            boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 2px 2px rgba(0,0,0,0.23)",
            marginTop: "10px"
          }}
          onClick={() => storeS3request(meetingSession)}
        >
          S3에 비디오 저장
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
