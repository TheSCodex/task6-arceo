const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const connection = require('./src/db.js');
const presentationRoutes = require('./src/routes/presentationRoutes');
const slideRoutes = require('./src/routes/slideRoutes');
const userRoutes = require('./src/routes/userRoutes');
const socketController = require('./src/controllers/socketController');
const User = require('./src/models/User');
const Presentation = require('./src/models/Presentation');
const Slide = require('./src/models/Slide');
const UserPresentation = require('./src/models/UserPresentation');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  },
});
app.use(cors());
app.use(bodyParser.json());

app.use('/api/presentations', presentationRoutes);
app.use('/api/slides', slideRoutes);
app.use('/api/users', userRoutes);

socketController.handleSocketEvents(io);

User.associate({ UserPresentation });
UserPresentation.associate({ User, Presentation });
Presentation.associate({ UserPresentation, Slide });
Slide.associate({ Presentation });

connection.sync().then(() => {
  console.log('Database & tables created!');
  server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
  });
}).catch(error => {
  console.error('Error syncing database:', error);
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});
