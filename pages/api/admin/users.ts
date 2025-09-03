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

  try {
    await connectDB();

    if (req.method === 'GET') {
      const { search } = req.query;
      
      let query = {};
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        };
      }
      
      const users = await User.find({})
        .populate('joinedGroups.groupId', 'name')
        .select('-__v');
      return res.status(200).json({ users });
    }

    if (req.method === 'PATCH') {
      const { userId, action } = req.body;
      
      if (action === 'block') {
        await User.findByIdAndUpdate(userId, { isBlocked: true });
      } else if (action === 'unblock') {
        await User.findByIdAndUpdate(userId, { isBlocked: false });
      } else if (action === 'make_admin') {
        await User.findByIdAndUpdate(userId, { role: 'admin' });
      } else if (action === 'make_user') {
        await User.findByIdAndUpdate(userId, { role: 'user' });
      }

      return res.status(200).json({ message: 'User updated successfully' });
    }

    if (req.method === 'DELETE') {
      const { userId } = req.body;
      await User.findByIdAndDelete(userId);
      return res.status(200).json({ message: 'User deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}