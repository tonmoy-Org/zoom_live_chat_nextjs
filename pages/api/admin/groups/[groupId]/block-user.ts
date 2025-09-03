import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { groupId } = req.query;

  try {
    await connectDB();

    if (req.method === 'POST') {
      const { userId, action } = req.body;
      
      if (action === 'block') {
        await User.findByIdAndUpdate(userId, { isBlocked: true });
      } else if (action === 'unblock') {
        await User.findByIdAndUpdate(userId, { isBlocked: false });
      }

      return res.status(200).json({ message: 'User updated successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}