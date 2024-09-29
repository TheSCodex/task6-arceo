const Presentation = require("../models/Presentation");
const Slide = require("../models/Slide");

exports.createPresentation = async (req, res) => {
  const { title, userId } = req.body;
  try {
    const presentation = await Presentation.create({ title, userId });

    const slides = await Promise.all([
      Slide.create({
        content: "",
        presentationId: presentation.id,
      }),
      Slide.create({
        content: "",
        presentationId: presentation.id,
      }),
      Slide.create({
        content: "",
        presentationId: presentation.id,
      }),
    ]);

    return res.status(201).json({ presentation, slides });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating presentation", error });
  }
};

exports.getAllPresentations = async (req, res) => {
  try {
    const presentations = await Presentation.findAll();
    return res.json(presentations);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching presentations", error });
  }
};
