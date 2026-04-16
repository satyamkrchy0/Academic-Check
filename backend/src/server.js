require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = require('./app');
const { connectMongo, prisma } = require('./config/db');

const port = Number(process.env.PORT || 5000);

async function startServer() {
  await connectMongo();
  await prisma.$connect();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN || '*'
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = payload;
      socket.join(payload.sub);
      return next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    socket.emit('connection:ok', { message: `Connected as ${socket.user.email}` });
  });

  app.set('io', io);

  server.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
