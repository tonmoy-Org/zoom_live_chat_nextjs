import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Group from '@/lib/models/Group';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      const groups = await Group.find({})
        .populate('creator', 'name phone username isBlocked role')
        .populate('members', 'name phone username isBlocked role')
        .select('-__v');
      return res.status(200).json({ groups });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling groups:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}