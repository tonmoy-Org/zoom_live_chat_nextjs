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

  const { groupId } = req.query;

  try {
    await connectDB();

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (req.method === 'PATCH') {
      const { imageUrl, text } = req.body;

      const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        {
          'banner.imageUrl': imageUrl || null,
          'banner.text': text || '',
          'banner.updatedAt': new Date()
        },
        { new: true }
      );

      return res.status(200).json({ group: updatedGroup });
    }

    if (req.method === 'DELETE') {
      const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        {
          'banner.imageUrl': null,
          'banner.text': '',
          'banner.updatedAt': new Date()
        },
        { new: true }
      );

      return res.status(200).json({ group: updatedGroup });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error managing group banner:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}