import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Group from '@/lib/models/Group';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectDB();

    const { inviteCode } = req.query;

    const group = await Group.findOne({ inviteCode })
      .populate('members', 'name phone')
      .select('name description inviteCode members');

    if (!group) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    // Check if user is already a member
    const isAlreadyMember = group.members.some((member: any) => member._id.toString() === session.user.id);

    if (isAlreadyMember) {
      // If already a member, redirect to the group chat
      return res.status(200).json({ 
        group,
        alreadyMember: true,
        redirectTo: `/chat/${group._id}`
      });
    }

    res.status(200).json({ group, alreadyMember: false });
  } catch (error) {
    console.error('Error fetching group info:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}