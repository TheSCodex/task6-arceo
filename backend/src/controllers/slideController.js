const Slide = require('../models/Slide');

exports.getSlidesByPresentationId = async (req, res) => {
  const { presentationId } = req.params;

  try {
    const slides = await Slide.findAll({
      where: {
        presentationId: presentationId,
      },
    });

    if (slides.length === 0) {
      return res.status(404).json({ message: 'No slides found for this presentation.' });
    }

    return res.status(200).json(slides);
  } catch (error) {
    console.error("Error fetching slides:", error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Create a new slide for a presentation
exports.createSlide = async (req, res) => {
  const { presentationId, content } = req.body;
  try {
    const slide = await Slide.create({ presentationId, content });
    return res.status(201).json(slide);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating slide', error });
  }
};

// Update a slide's content
exports.updateSlide = async (req, res) => {
  const { slideId, content } = req.body;
  try {
    const slide = await Slide.findByPk(slideId);
    if (slide) {
      slide.content = content;
      await slide.save();
      return res.json(slide);
    } else {
      return res.status(404).json({ message: 'Slide not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error updating slide', error });
  }
};
