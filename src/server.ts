import { createServer } from 'http';
import { Server } from 'socket.io';

const port = process.env.PORT || 3021;
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: 'https://tododong.com',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('✅ 클라이언트 연결됨:', socket.id);

  socket.on('joinRoom', ({ gameId }) => {
    console.log(`User joined room: ${gameId}`);
    socket.join(gameId);
  });

  socket.on('newMessage', (data) => {
    io.to(data.gameId).emit('newMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ 클라이언트 연결 종료:', socket.id);
  });
});

httpServer.listen({ port, host: '0.0.0.0' }, () => {
  console.log(`🚀 Socket.IO 서버 실행 중: http://0.0.0.0:${port}`);
});
