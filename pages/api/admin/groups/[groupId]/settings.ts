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
      const {
        isMessagingEnabled,
        messagingMode,
        restrictedUsers,
        allowedUsers
      } = req.body;

      const updateData: any = {};

      if (typeof isMessagingEnabled === 'boolean') {
        updateData.isMessagingEnabled = isMessagingEnabled;
      }

      if (messagingMode) {
        updateData.messagingMode = messagingMode;
      }

      if (restrictedUsers) {
        updateData.restrictedUsers = restrictedUsers;
      }

      if (allowedUsers) {
        updateData.allowedUsers = allowedUsers;
      }

      const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        updateData,
        { new: true }
      ).populate('members restrictedUsers allowedUsers', 'name phone username isBlocked role');

      return res.status(200).json({ group: updatedGroup });
    }

    if (req.method === 'GET') {
      const populatedGroup = await Group.findById(groupId)
        .populate('members restrictedUsers allowedUsers', 'name phone username isBlocked role');

      return res.status(200).json({ group: populatedGroup });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling group settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}