const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Import Routes
const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const categoryRoutes = require('./routes/categoryRoutes');
// const subCategoryRoutes = require('./routes/SubCategoryRoutes');
const dealRoutes = require('./routes/dealRoutes');
const groupRoutes = require('./routes/groupRoutes');
const groupMemberRoutes = require('./routes/groupMemberRoutes');

connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Set Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: [
        "'self'",
        "data:",
      ],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://embed.tawk.to"],
      connectSrc: ["'self'", "https://api.tawk.to"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["https://embed.tawk.to"]
    }
  })
);

app.use("/api/auth", authRoutes);
// app.use("/api/category", categoryRoutes);
// app.use("/api/sub-category", subCategoryRoutes);
// app.use("/api/user", userRoutes);
app.use("/api/deal", dealRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/groupMember", groupMemberRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


