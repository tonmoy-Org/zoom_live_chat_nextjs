import { Server } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types/socket';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server(res.socket.server as any);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('New client connected');

      socket.on('join-group', (groupId: string) => {
        socket.join(groupId);
        console.log(`User joined group: ${groupId}`);
      });

      socket.on('leave-group', (groupId: string) => {
        socket.leave(groupId);
        console.log(`User left group: ${groupId}`);
      });

      socket.on('send-message', (data) => {
        socket.to(data.groupId).emit('new-message', data.message);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
  res.end();
};

export default SocketHandler;