import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Group from '@/lib/models/Group';
import User from '@/lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { groupId } = req.query;

  try {
    await connectDB();

    if (req.method === 'DELETE') {
      const { userId } = req.body;
      
      // Remove user from group
      await Group.findByIdAndUpdate(groupId, {
        $pull: { 
          members: userId,
          admins: userId,
          allowedUsers: userId,
          restrictedUsers: userId
        }
      });

      // Remove group from user's groups
      await User.findByIdAndUpdate(userId, {
        $pull: { groups: groupId }
      });

      return res.status(200).json({ message: 'User removed from group successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error managing group members:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}