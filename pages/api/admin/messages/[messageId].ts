import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Message from '@/lib/models/Message';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { messageId } = req.query;

  try {
    await connectDB();

    if (req.method === 'PATCH') {
      const { content, imageUrl, messageType } = req.body;

      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        {
          content,
          imageUrl,
          messageType,
          isEdited: true,
          editedAt: new Date(),
        },
        { new: true }
      ).populate('sender', 'name phone username isBlocked role');

      if (!updatedMessage) {
        return res.status(404).json({ message: 'Message not found' });
      }

      return res.status(200).json({ message: updatedMessage });
    }

    if (req.method === 'DELETE') {
      const deletedMessage = await Message.findByIdAndDelete(messageId);

      if (!deletedMessage) {
        return res.status(404).json({ message: 'Message not found' });
      }

      return res.status(200).json({ message: 'Message deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error managing message:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
