var express = require('express');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const asyncify = require('asyncify-express');

var router = asyncify(express.Router());

// 차임 미팅 세션 요청
router.get('/chime-integration/meeting-session', async function(req, res, next) {
  const chime = new AWS.Chime({ region: 'us-east-1' });
  chime.endpoint = new AWS.Endpoint('https://chime.us-east-1.amazonaws.com');

  try {
    // 존재하는 미팅 리스트 찾기
    const meeting_list = await chime.listMeetings().promise();
    const find_meeting = Array.from(meeting_list.Meetings).find(
      (it) => it.ExternalMeetingId === req.query.room
    );
    console.log(find_meeting);

    const meetingsResult = await chime.listMeetings().promise();

    // Can find a Meeting with a specific “external id” (aka, “room”)?
    const foundMeeting = Array.from(meetingsResult.Meetings).find(
      (it) => it.ExternalMeetingId === req.query.room
    );

    // 존재하는 미팅 리스트가 없다면 새로 미팅 만들기
    const created_meeting_response = !find_meeting &&
    await chime.createMeeting({
      ClientRequestToken : uuidv4(),
      MediaRegion : 'ap-northeast-2',
      ExternalMeetingId : req.query.room
    }).promise();

    // 존재하는 미팅 리스트가 있다면 그대로 사용하기
    const meeting_response = find_meeting ? 
    { Meeting : find_meeting } : created_meeting_response;

    console.log("meeting response : ", meeting_response);

    // 참가자 리스폰스 리턴하기
    const attendee_response = await chime.createAttendee({
      MeetingId : meeting_response.Meeting.MeetingId,
      ExternalUserId : uuidv4()
    }).promise();

    console.log("attendee response : ", attendee_response);

    res.send({ attendee_response, meeting_response });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error."
    });
  }
});

module.exports = router;
