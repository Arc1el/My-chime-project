var express = require('express');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const asyncify = require('asyncify-express');

// 비동기 처리를 위해 asyncify로 라우터 전체를 래핑
var router = asyncify(express.Router());
meetings = {};

// 차임 미팅 세션 요청
router.get('/chime-integration/meeting-session', async function(req, res, next) {
  try {
    // 리전설정
    const meetings_control_region = "us-east-1"
    const meetings_media_region = "us-east-1"
    const chime_endpoint = "https://meetings-chime." + meetings_control_region + ".amazonaws.com"

    // ChimeSDKMMEetings 사용하여 객체 생성
    const chime = new AWS.ChimeSDKMeetings({ region: meetings_control_region });
    
    // 엔드포인트 설정
    chime.endpoint = new AWS.Endpoint(chime_endpoint);

    // 미팅 리스폰스 생성. but 이미 존재하는 미팅인경우를 파악해야함
    var meeting_resonse = "";
    if(req.query.room in meetings){
      console.log("meeting is exist");
      meeting_resonse = meetings[req.query.room];
    } else {
      console.log("meeting is not exist");
      console.log("make new meeting");
      // 새로운 미팅 생성
      meeting_response = await chime.createMeeting({
        ClientRequestToken : uuidv4(),
        MediaRegion :  meetings_media_region,
        ExternalMeetingId : req.query.room
      }).promise();
      meetings[req.query.room] = meeting_response;
    }

    // 미팅 리스트 출력
    console.log("meetings : ", meetings);

    // 참가자 리스폰스 생성
    const attendee_response = await chime.createAttendee({
      MeetingId : meeting_response.Meeting.MeetingId,
      ExternalUserId : uuidv4()
    }).promise();

    console.log("attendee response : ", attendee_response);

    // front에 미팅리스폰스, 참가자 리스폰스 send
    startRecording();
    res.send({ attendee_response, meeting_response });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error."
    });
  }
});

module.exports = router;
