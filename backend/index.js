require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/db');
const User = require('./models/User');
const { notFound, errorHandler } = require('./middleware/error');

// Route imports
const authRoute = require('./routes/AuthRoute');
const userRoute = require('./routes/UserRoute');
const profileRoute = require('./routes/ProfileRoute');
const roomRoute = require('./routes/RoomRoute');
const roommateRoute = require('./routes/RoommateRoute');
const matchRoute = require('./routes/MatchRoute');
const favoriteRoute = require('./routes/FavoriteRoute');
const roommateRequestRoute = require('./routes/RoommateRequestRoute');
const messageRoute = require('./routes/MessageRoute');
const notificationRoute = require('./routes/NotificationRoute');
const reportRoute = require('./routes/ReportRoute');
const adminRoute = require('./routes/AdminRoute');
const viewingRoute = require('./routes/ViewingRoute');
const uploadRoute = require('./routes/UploadRoute');
const mapRoute = require('./routes/MapRoute');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    if (!process.env.JWT_SECRET) return next(new Error('Authentication is not configured'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id');
    if (!user) return next(new Error('Authentication failed'));

    socket.data.userId = user._id.toString();
    return next();
  } catch {
    return next(new Error('Authentication failed'));
  }
});

// Set io instance to express app
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Roommate Finder API',
      version: '1.0.0',
      description: 'API Documentation for the Roommate Finder application',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./backend/routes/*.js', './routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/profiles', profileRoute);
app.use('/api/rooms', roomRoute);
app.use('/api/roommates', roommateRoute);
app.use('/api/matches', matchRoute);
app.use('/api/favorites', favoriteRoute);
app.use('/api/roommate-requests', roommateRequestRoute);
app.use('/api/conversations', messageRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/reports', reportRoute);
app.use('/api/admin', adminRoute);
app.use('/api/viewings', viewingRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/map', mapRoute);

// Basic route to verify
app.get('/', (req, res) => {
  res.json({ message: 'Roommate Finder API is running... Swagger docs available at /api-docs' });
});

// 404 & Global Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.join(socket.data.userId);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
