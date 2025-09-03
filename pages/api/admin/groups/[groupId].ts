import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Group from '@/lib/models/Group';
import Message from '@/lib/models/Message';
import User from '@/lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { groupId } = req.query;

  try {
    await connectDB();

    if (req.method === 'PATCH') {
      const { name, description } = req.body;
      
      const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        { name, description },
        { new: true }
      ).populate('creator members', 'name phone username isBlocked role');

      if (!updatedGroup) {
        return res.status(404).json({ message: 'Group not found' });
      }

      return res.status(200).json({ group: updatedGroup });
    }

    if (req.method === 'DELETE') {
      // Delete all messages in the group
      await Message.deleteMany({ group: groupId });
      
      // Remove group from all users
      await User.updateMany(
        { groups: groupId },
        { $pull: { groups: groupId } }
      );
      
      // Delete the group
      await Group.findByIdAndDelete(groupId);

      return res.status(200).json({ message: 'Group deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error managing group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}