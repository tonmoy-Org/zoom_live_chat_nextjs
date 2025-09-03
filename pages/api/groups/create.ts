import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Group from '@/lib/models/Group';
import User from '@/lib/models/User';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectDB();

    const { name, description } = req.body;
    const inviteCode = uuidv4().slice(0, 8);

    const group = await Group.create({
      name,
      description,
      inviteCode,
      creator: session.user.id,
      members: [session.user.id],
      admins: [session.user.id],
    });

    await User.findByIdAndUpdate(session.user.id, {
      $push: { groups: group._id }
    });

    res.status(201).json({ group });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}