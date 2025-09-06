import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Group from '@/lib/models/Group';
import User from '@/lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { groupId } = req.query;

  try {
    await connectDB();

    // Remove user from group
    await Group.findByIdAndUpdate(groupId, {
      $pull: {
        members: session.user.id,
        admins: session.user.id,
        allowedUsers: session.user.id,
        restrictedUsers: session.user.id
      }
    });

    // Remove group from user's groups
    await User.findByIdAndUpdate(session.user.id, {
      $pull: {
        groups: groupId,
        joinedGroups: { groupId: groupId }
      }
    });

    res.status(200).json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}