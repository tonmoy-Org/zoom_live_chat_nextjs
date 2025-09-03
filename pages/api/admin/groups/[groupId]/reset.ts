import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Message from '@/lib/models/Message';
import Group from '@/lib/models/Group';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { groupId } = req.query;

  try {
    await connectDB();

    // Verify group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Delete all messages in the group
    await Message.deleteMany({ group: groupId });

    res.status(200).json({ message: 'Chat history reset successfully' });
  } catch (error) {
    console.error('Error resetting chat:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}