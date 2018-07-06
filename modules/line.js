const {Client} = require('@line/bot-sdk');
const {token, secret, userId} = require('../mysettings/line');
const client = new Client({
  channelAccessToken: token,
  channelSecret: secret
});

exports.pushMessage = (message) => {
  client.pushMessage(userId, {type: 'text', text: message});
};
