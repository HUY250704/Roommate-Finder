require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const connectDB = require('./config/db');

// Route imports
const userRoute = require('./routes/UserRoute');
const profileRoute = require('./routes/ProfileRoute');
const roomRoute = require('./routes/RoomRoute');
const matchRoute = require('./routes/MatchRoute');
const favoriteRoute = require('./routes/FavoriteRoute');
const roommateRequestRoute = require('./routes/RoommateRequestRoute');
const messageRoute = require('./routes/MessageRoute');
const notificationRoute = require('./routes/NotificationRoute');
const reportRoute = require('./routes/ReportRoute');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Set io instance to express app
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

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
app.use('/api/users', userRoute);
app.use('/api/profiles', profileRoute);
app.use('/api/rooms', roomRoute);
app.use('/api/matches', matchRoute);
app.use('/api/favorites', favoriteRoute);
app.use('/api/requests', roommateRequestRoute);
app.use('/api/chats', messageRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/reports', reportRoute);

// Basic route to verify
app.get('/', (req, res) => {
  res.json({ message: 'Roommate Finder API is running... Swagger docs available at /api-docs' });
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

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
