import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Message from '@/lib/models/Message';
import Group from '@/lib/models/Group';
import User from '@/lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { groupId } = req.query;

  try {
    await connectDB();

    // Verify user is member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(session.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.method === 'GET') {
      const messages = await Message.find({ group: groupId })
        .populate('sender', 'name phone username isBlocked role')
        .sort({ createdAt: 1 });

      return res.status(200).json({ messages, group });
    }

    if (req.method === 'POST') {
      const { content, messageType, imageUrl } = req.body;

      // Check if user is blocked
      const user = await User.findById(session.user.id);
      if (user.isBlocked) {
        return res.status(403).json({ message: 'You are blocked from sending messages' });
      }

      // Check for spam (same message repeated)
      if (messageType === 'text' && content) {
        const existingMessage = user.messageHistory.find((msg: any) => msg.content === content);
        
        if (existingMessage) {
          if (existingMessage.count >= 3) {
            return res.status(429).json({ message: 'Cannot send the same message more than 3 times' });
          }
          existingMessage.count += 1;
          existingMessage.lastSent = new Date();
        } else {
          user.messageHistory.push({ content, count: 1, lastSent: new Date() });
        }
        
        // Clean old message history (older than 24 hours)
        user.messageHistory = user.messageHistory.filter((msg: any) => 
          new Date().getTime() - new Date(msg.lastSent).getTime() < 24 * 60 * 60 * 1000
        );
        
        await user.save();
      }

      // Check if messaging is enabled for the group
      if (!group.isMessagingEnabled) {
        return res.status(403).json({ message: 'Messaging is disabled for this group' });
      }

      // Check messaging permissions based on mode
      const userId = session.user.id;
      const isAdmin = group.admins.includes(userId);
      
      if (!isAdmin) {
        if (group.messagingMode === 'restricted' && group.restrictedUsers.includes(userId)) {
          return res.status(403).json({ message: 'You are restricted from sending messages in this group' });
        }
        
        if (group.messagingMode === 'allowed_only' && !group.allowedUsers.includes(userId)) {
          return res.status(403).json({ message: 'You are not allowed to send messages in this group' });
        }
      }

      const message = await Message.create({
        content,
        sender: session.user.id,
        group: groupId,
        messageType: messageType || 'text',
        imageUrl: imageUrl || null,
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name phone username isBlocked role');

      return res.status(201).json({ message: populatedMessage });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}