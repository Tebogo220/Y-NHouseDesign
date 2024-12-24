const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Added CORS
const basicAuth = require('express-basic-auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Create an uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Store files in the uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage });

// Basic authentication setup (replace with real credentials)
app.use(
  basicAuth({
    users: { admin: 'mjorompa@Y&NHouseDesign12972' }, // Replace with environment variables in production
    challenge: true,
    realm: 'Admin Area',
  })
);

// Serve static files (uploaded images)
app.use('/uploads', express.static(uploadDir));

// Route to get all uploaded images (for gallery)
app.get('/get-images', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir).map((file) => ({
      id: file,
      url: `/uploads/${file}`,
    }));
    res.json(files);
  } catch (error) {
    console.error('Error fetching images:', error.message);
    res.status(500).json({ message: 'Error fetching images', error: error.message });
  }
});

// Route to upload an image (Admin only)
app.post('/upload', upload.single('picture'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('File uploaded:', req.file); // Debug log
    res.json({ message: 'File uploaded successfully', file: req.file });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Route to delete an image (Admin only)
app.delete('/delete/:id', (req, res) => {
  const filePath = path.join(uploadDir, req.params.id);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Delete the file
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});