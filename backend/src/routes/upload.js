const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const config = require('../config');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    // Check file type based on upload type
    const uploadType = req.params.type || 'image';
    
    if (uploadType === 'image') {
      if (config.upload.allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid image type. Allowed types: ' + config.upload.allowedImageTypes.join(', ')), false);
      }
    } else if (uploadType === 'video') {
      if (config.upload.allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid video type. Allowed types: ' + config.upload.allowedVideoTypes.join(', ')), false);
      }
    } else {
      cb(new Error('Invalid upload type'), false);
    }
  }
});

/**
 * @route   POST /api/upload/image
 * @desc    Upload image file
 * @access  Private
 */
router.post('/image', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `images/${req.user.id}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('balmuya-uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'File upload failed'
      });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('balmuya-uploads')
      .getPublicUrl(filePath);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: urlData.publicUrl,
        fileName: fileName,
        filePath: filePath,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/upload/video
 * @desc    Upload video file
 * @access  Private
 */
router.post('/video', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `videos/${req.user.id}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('balmuya-uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'File upload failed'
      });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('balmuya-uploads')
      .getPublicUrl(filePath);

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        url: urlData.publicUrl,
        fileName: fileName,
        filePath: filePath,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files
 * @access  Private
 */
router.post('/multiple', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    const uploadResults = [];

    for (const file of req.files) {
      try {
        // Generate unique filename
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `uploads/${req.user.id}/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabaseAdmin.storage
          .from('balmuya-uploads')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Supabase upload error:', error);
          uploadResults.push({
            originalName: file.originalname,
            success: false,
            error: 'Upload failed'
          });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from('balmuya-uploads')
          .getPublicUrl(filePath);

        uploadResults.push({
          originalName: file.originalname,
          success: true,
          url: urlData.publicUrl,
          fileName: fileName,
          filePath: filePath,
          size: file.size,
          mimeType: file.mimetype
        });

      } catch (fileError) {
        console.error('File upload error:', fileError);
        uploadResults.push({
          originalName: file.originalname,
          success: false,
          error: 'Upload failed'
        });
      }
    }

    const successCount = uploadResults.filter(result => result.success).length;
    const failureCount = uploadResults.length - successCount;

    res.json({
      success: true,
      message: `Uploaded ${successCount} files successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      data: {
        results: uploadResults,
        summary: {
          total: uploadResults.length,
          successful: successCount,
          failed: failureCount
        }
      }
    });

  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/upload/:filename
 * @desc    Delete uploaded file
 * @access  Private
 */
router.delete('/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const { filePath } = req.query;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'File path is required'
      });
    }

    // Delete from Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from('balmuya-uploads')
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'File deletion failed'
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/upload/user-files
 * @desc    Get user's uploaded files
 * @access  Private
 */
router.get('/user-files', authenticateToken, async (req, res) => {
  try {
    const { folder = 'images' } = req.query;

    // List files in user's folder
    const { data, error } = await supabaseAdmin.storage
      .from('balmuya-uploads')
      .list(`${folder}/${req.user.id}`, {
        limit: 100,
        offset: 0
      });

    if (error) {
      console.error('Supabase list error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to list files'
      });
    }

    // Get public URLs for each file
    const filesWithUrls = data.map(file => {
      const filePath = `${folder}/${req.user.id}/${file.name}`;
      const { data: urlData } = supabaseAdmin.storage
        .from('balmuya-uploads')
        .getPublicUrl(filePath);

      return {
        name: file.name,
        size: file.metadata?.size,
        lastModified: file.updated_at,
        url: urlData.publicUrl,
        path: filePath
      };
    });

    res.json({
      success: true,
      data: {
        files: filesWithUrls,
        folder: folder,
        count: filesWithUrls.length
      }
    });

  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is ' + (config.upload.maxFileSize / 1024 / 1024) + 'MB'
      });
    }
  }

  if (error.message.includes('Invalid')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  console.error('Upload middleware error:', error);
  res.status(500).json({
    success: false,
    message: 'Upload error'
  });
});

module.exports = router;
