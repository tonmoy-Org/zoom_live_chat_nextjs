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

  try {
    await connectDB();

    const { inviteCode } = req.body;

    const group = await Group.findOne({ inviteCode }).populate('members', 'name phone username isBlocked role');

    if (!group) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    // Check if user is already a member
    if (group.members.some((member: any) => member._id.toString() === session.user.id)) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    // Add user to group
    group.members.push(session.user.id);
    await group.save();

    // Add group to user's groups
    await User.findByIdAndUpdate(session.user.id, {
      $push: { 
        groups: group._id,
        joinedGroups: {
          groupId: group._id,
          groupName: group.name,
          joinedAt: new Date()
        }
      }
    });

    res.status(200).json({ group });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}