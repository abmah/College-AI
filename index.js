const express = require('express');
const WebSocket = require('ws');
const { NlpManager } = require('node-nlp');

const app = express();
const wss = new WebSocket.Server({ port: 8080 });
const manager = new NlpManager({ languages: ['en'], forceNER: true });


(async () => {
  await manager.load('./model.nlp');
})();


const clients = [];
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  clients.push(ws);

  ws.on('message', async (message) => {
    console.log(`Received message: ${message}`);

    const response = await manager.process('en', Buffer.from(message, 'hex').toString());

    clients.forEach((client) => {
      client.send(JSON.stringify({ message: response.answer }));
    });

    console.log(response.answer);
  });

  // Handle WebSocket disconnections
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    const index = clients.indexOf(ws);
    if (index > -1) {
      clients.splice(index, 1);
    }
  });
});
// Start the Express server
app.listen(3000, () => {
  console.log('Express server listening on port 3000');
});
