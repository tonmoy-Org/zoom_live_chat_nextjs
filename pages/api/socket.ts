import { NextApiRequest } from 'next';
import { Server } from 'socket.io';
import { NextApiResponseServerIO } from '@/types/socket';

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
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

      socket.on('message-edited', (data) => {
        socket.to(data.groupId).emit('message-edited', data.message);
      });

      socket.on('message-deleted', (data) => {
        socket.to(data.groupId).emit('message-deleted', data.messageId);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
  res.end();
}