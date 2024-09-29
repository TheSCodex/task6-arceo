const Presentation = require('../models/Presentation');
const User = require('../models/User');
const UserPresentation = require('../models/UserPresentation');
const Slide = require('../models/Slide');

exports.handleSocketEvents = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinPresentation', async (presentationId, nickname) => {
      console.log(`User ${nickname} is trying to join presentation ${presentationId}`);
      if (!nickname) {
        console.log('Nickname is missing');
        socket.emit('error', 'Nickname is required to join the presentation');
        return;
      }

      try {
        const presentation = await Presentation.findByPk(presentationId);
        if (presentation) {
          socket.join(presentationId);
          console.log(`User ${nickname} joined presentation ${presentationId}`);
          
          const [user, created] = await User.findOrCreate({
            where: { nickname },
          });
          console.log(`User ${user.nickname} created: ${created}`);

          await UserPresentation.findOrCreate({
            where: { userId: user.id, presentationId },
            defaults: { role: 'viewer' },
          });
          console.log(`User ${user.nickname} added to presentation ${presentationId}`);

          const userPresentations = await UserPresentation.findAll({
            where: { presentationId },
            include: [{ model: User, as: 'User' }],
          });

          const users = userPresentations.map(up => ({
            id: up.userId,
            nickname: up.User.nickname,
            role: up.role,
          }));

          console.log(`Current users in presentation ${presentationId}:`, users);
          io.to(presentationId).emit('userJoined', nickname, users);

          // Fetch and send current slides to the user who joined
          const slides = await Slide.findAll({ where: { presentationId } });
          socket.emit('currentSlides', slides);
        } else {
          console.log(`Presentation ${presentationId} not found`);
          socket.emit('error', 'Presentation not found');
        }
      } catch (error) {
        console.error('Error joining presentation:', error);
        socket.emit('error', 'Failed to join presentation');
      }
    });

    socket.on('updateSlide', async (presentationId, slideId, content) => {
      console.log(`Updating slide ${slideId} in presentation ${presentationId}`);
      try {
        const result = await Slide.update({ content }, { where: { id: slideId } });
        console.log(`Slide ${slideId} updated:`, result);

        const slides = await Slide.findAll({ where: { presentationId } });
        io.to(presentationId).emit('slideUpdated', slides);
      } catch (error) {
        console.error('Error updating slide:', error);
        socket.emit('error', 'Failed to update slide');
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });
};
