const express = require('express');
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/chats
 * @desc    Get all user chats
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [chats, totalChats] = await Promise.all([
      prisma.chat.findMany({
        where: {
          OR: [
            { participant1Id: req.user.id },
            { participant2Id: req.user.id }
          ]
        },
        select: {
          id: true,
          status: true,
          lastMessageAt: true,
          createdAt: true,
          participant1: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              storeName: true
            }
          },
          participant2: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              storeName: true
            }
          },
          messages: {
            select: {
              id: true,
              content: true,
              isRead: true,
              createdAt: true,
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.chat.count({
        where: {
          OR: [
            { participant1Id: req.user.id },
            { participant2Id: req.user.id }
          ]
        }
      })
    ]);

    // Format chats with other participant info
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participant1.id === req.user.id 
        ? chat.participant2 
        : chat.participant1;
      
      const lastMessage = chat.messages[0] || null;

      return {
        id: chat.id,
        status: chat.status,
        lastMessageAt: chat.lastMessageAt,
        createdAt: chat.createdAt,
        otherParticipant: {
          id: otherParticipant.id,
          name: `${otherParticipant.firstName} ${otherParticipant.lastName}`,
          avatar: otherParticipant.avatar,
          storeName: otherParticipant.storeName
        },
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          isRead: lastMessage.isRead,
          createdAt: lastMessage.createdAt,
          sender: {
            id: lastMessage.sender.id,
            name: `${lastMessage.sender.firstName} ${lastMessage.sender.lastName}`
          }
        } : null
      };
    });

    res.json({
      success: true,
      data: {
        chats: formattedChats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalChats,
          totalPages: Math.ceil(totalChats / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/chats
 * @desc    Create a new chat
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    if (participantId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create chat with yourself'
      });
    }

    // Check if participant exists
    const participant = await prisma.user.findUnique({
      where: { id: participantId },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Check if chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        OR: [
          { participant1Id: req.user.id, participant2Id: participantId },
          { participant1Id: participantId, participant2Id: req.user.id }
        ]
      }
    });

    if (existingChat) {
      return res.status(409).json({
        success: false,
        message: 'Chat already exists',
        data: { chatId: existingChat.id }
      });
    }

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        participant1Id: req.user.id,
        participant2Id: participantId
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        participant1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        participant2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: {
        id: chat.id,
        status: chat.status,
        createdAt: chat.createdAt,
        participants: [chat.participant1, chat.participant2]
      }
    });

  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/chats/:id/messages
 * @desc    Get chat messages
 * @access  Private
 */
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if user has access to this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id,
        OR: [
          { participant1Id: req.user.id },
          { participant2Id: req.user.id }
        ]
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    // Get messages
    const [messages, totalMessages] = await Promise.all([
      prisma.message.findMany({
        where: { chatId: id },
        select: {
          id: true,
          content: true,
          isRead: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.message.count({
        where: { chatId: id }
      })
    ]);

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        chatId: id,
        receiverId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalMessages,
          totalPages: Math.ceil(totalMessages / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/chats/:id/messages
 * @desc    Send a message
 * @access  Private
 */
router.post('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Check if user has access to this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id,
        OR: [
          { participant1Id: req.user.id },
          { participant2Id: req.user.id }
        ]
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    // Determine receiver
    const receiverId = chat.participant1Id === req.user.id 
      ? chat.participant2Id 
      : chat.participant1Id;

    // Create message
    const message = await prisma.message.create({
      data: {
        chatId: id,
        senderId: req.user.id,
        receiverId,
        content: content.trim()
      },
      select: {
        id: true,
        content: true,
        isRead: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Update chat last message time
    await prisma.chat.update({
      where: { id },
      data: { lastMessageAt: new Date() }
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/chats/:id/read
 * @desc    Mark chat as read
 * @access  Private
 */
router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has access to this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id,
        OR: [
          { participant1Id: req.user.id },
          { participant2Id: req.user.id }
        ]
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    // Mark all messages in this chat as read for the current user
    await prisma.message.updateMany({
      where: {
        chatId: id,
        receiverId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'Chat marked as read'
    });

  } catch (error) {
    console.error('Mark chat as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/chats/unread-count
 * @desc    Get unread message count
 * @access  Private
 */
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: req.user.id,
        isRead: false
      }
    });

    res.json({
      success: true,
      data: { unreadCount }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/chats/:id/status
 * @desc    Update chat status
 * @access  Private
 */
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'ARCHIVED', 'BLOCKED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Check if user has access to this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id,
        OR: [
          { participant1Id: req.user.id },
          { participant2Id: req.user.id }
        ]
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    // Update chat status
    const updatedChat = await prisma.chat.update({
      where: { id },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Chat status updated successfully',
      data: {
        id: updatedChat.id,
        status: updatedChat.status
      }
    });

  } catch (error) {
    console.error('Update chat status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
