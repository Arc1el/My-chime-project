var express = require('express');
const AWS = require('aws-sdk');
const { 
  ChimeSDKMediaPipelinesClient, 
  CreateMediaCapturePipelineCommand, 
  DeleteMediaCapturePipelineCommand,
  CreateMediaConcatenationPipelineCommand
} = require("@aws-sdk/client-chime-sdk-media-pipelines");
const { v4: uuidv4 } = require('uuid');
const asyncify = require('asyncify-express');

// 비동기 처리를 위해 asyncify로 라우터 전체를 래핑
var router = asyncify(express.Router());
var meetings = {};
var pipelines = {};

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
    res.send({ attendee_response, meeting_response });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error."
    });
  }
});

router.post('/store_s3', async function(req, res, next) {
    // 리전설정
    console.log(req.body);
    const meeting_id = req.body.meetingId;
    const record_flag = req.body.s3_flag;
    var record_start = record_flag;

    if(record_start){
      try{
        const client = new ChimeSDKMediaPipelinesClient({region: 'us-east-1'});
        const input = { 
          SourceType: "ChimeSdkMeeting", 
          SourceArn: "arn:aws:chime::759320821027:meeting:" + meeting_id, 
          SinkType: "S3Bucket", 
          SinkArn: "arn:aws:s3:::chime-record-hmkim/records-" + meeting_id, 
          ChimeSdkMeetingConfiguration: {
            "ArtifactsConfiguration": {
              "Audio": {
                  "MuxType": "AudioWithActiveSpeakerVideo"
              },
              "Video": {
                  "State": "Enabled",
                  "MuxType": "VideoOnly"
              },
              "Content": {
                  "State": "Enabled",
                  "MuxType": "ContentOnly"
              }
            }
          }
        };
        const command = new CreateMediaCapturePipelineCommand(input);
        const response = await client.send(command);
        console.log("create response : ", response);
        console.log("MediaPipelineId : ", response.MediaCapturePipeline.MediaPipelineId);
        const media_pipeline_id = response.MediaCapturePipeline.MediaPipelineId;
        const media_pipeline_arn = response.MediaCapturePipeline.MediaPipelineArn;
        pipelines[meeting_id] = media_pipeline_id;
        console.log("pipelines : ", pipelines);
        

        const concat_input = { 
          Sources: [
            { 
              Type: "MediaCapturePipeline", 
              MediaCapturePipelineSourceConfiguration: { 
                MediaPipelineArn: media_pipeline_arn,
                ChimeSdkMeetingConfiguration: { 
                  ArtifactsConfiguration: { 
                    Audio: { 
                      State: "Enabled",
                    },
                    Video: {
                      State: "Enabled", 
                    },
                    Content: { 
                      State: "Enabled", 
                    },
                    DataChannel: { 
                      State: "Disabled", 
                    },
                    TranscriptionMessages: { 
                      State: "Disabled", 
                    },
                    MeetingEvents: { 
                      State: "Disabled", 
                    },
                    CompositedVideo: { 
                      State: "Disabled", 
                    },
                  },
                },
              },
            },
          ],
          Sinks: [  
            { 
              Type: "S3Bucket", 
              S3BucketSinkConfiguration: { 
                Destination: "arn:aws:s3:::chime-concat-hmkim", 
              },
            },
          ],
        };
        const concat_command = new CreateMediaConcatenationPipelineCommand(concat_input);
        const concat_response = await client.send(concat_command);

        console.log("concat_response : ", concat_response);
        res.sendStatus(200);
      }catch(e){
        console.log(e);
        res.sendStatus(500);
      }
    }else {
      try{
        var mediapipeline_id = pipelines[meeting_id];
        console.log("delete the mediapipeline : ", mediapipeline_id);
        
        const client = new ChimeSDKMediaPipelinesClient({region: 'us-east-1'});
        const input = { 
          MediaPipelineId: mediapipeline_id, 
        };
        const command = new DeleteMediaCapturePipelineCommand(input);
        const response = await client.send(command);
        console.log("delete response : ", response);

        res.sendStatus(200);
      }catch(e){
        console.log(e);
        res.sendStatus(500);
      }
    }
    
});

module.exports = router;
