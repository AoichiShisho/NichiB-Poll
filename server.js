const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs-extra');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser()); // ←追加

// ルート設定
const adminRouter = require('./routes/admin');
const userRouter = require('./routes/user');
app.use('/', adminRouter);
app.use('/', userRouter);

io.on('connection', (socket) => {
  socket.on('vote', async (pollId) => {
    const data = await fs.readJson(path.join(__dirname, 'data/polls.json'));
    const poll = data[pollId];
    if (poll) {
      io.emit('updateResults', poll.results);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

