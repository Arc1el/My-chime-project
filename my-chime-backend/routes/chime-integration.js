'use strict';
const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');

module.exports = async function (fastify, opts) {
  fastify.get(
    '/chime-integration/meeting-session',
    async function (request, reply) {

      // Initialize Chime instance
      const chime = new AWS.ChimeSDKMeetings({ region: 'us-east-1' });
      chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com');

      // Get a temporary security credentials with AssumeRole API
      const sts = new AWS.STS();
      const roleArn = 'arn:aws:iam::759320821027:user/chime-sts-user';
      const roleSessionName = 'chime-demo-session';
      const assumeRoleResult = await sts.assumeRole({
        RoleArn: roleArn,
        RoleSessionName: roleSessionName,
      }).promise();

      // Get Meetings list using REST API
      const meetingsEndpoint = chime.endpoint.href + '/meetings?max-results=100';
      const response = await fetch(meetingsEndpoint, {
        method: 'GET',
        headers: {
          'x-amz-chime-bearer': assumeRoleResult.Credentials.SessionToken,
        },
      });
      const meetingsResult = await response.json();


      // Can find a Meeting with a specific “external id” (aka, “room”)?
      const foundMeeting = Array.from(meetingsResult.Meetings).find(
        (it) => it.ExternalMeetingId === request.query.room
      );

      // If not, create a new Meeting info.
      const createdMeetingResponse =
        !foundMeeting &&
        (await chime
          .createMeeting({
            ClientRequestToken: uuid(),
            MediaRegion: 'ap-northeast-2',
            ExternalMeetingId: request.query.room,
          })
          .promise());

      // … or use the found meeting data.
      const meetingResponse = foundMeeting
        ? { Meeting: foundMeeting }
        : createdMeetingResponse;

      // Create Attendee info using the existing Meeting info.
      const attendeeResponse = await chime
        .createAttendee({
          MeetingId: meetingResponse.Meeting.MeetingId,
          ExternalUserId: uuid(), // Link the attendee to an identity managed by your application.
        })
        .promise();

      // Respond with these infos so the frontend can safely use it
      return {
        attendeeResponse,
        meetingResponse,
      };
    }
  );
};