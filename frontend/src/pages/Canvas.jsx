import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import * as fabric from "fabric";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faMousePointer,
  faTextHeight,
  faEraser,
  faSquare,
  faCircle,
  faTriangleCircleSquare,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { io } from "socket.io-client";

function Canvas() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const presentationId = queryParams.get("presentationId");

  const [canvases, setCanvases] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);
  const socketRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const user = JSON.parse(localStorage.getItem("authUser"));
  let nickname = user ? user.nickname : null;

  useEffect(() => {
    if (!presentationId) {
      console.error("Presentation ID is missing.");
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io("http://localhost:8080", {
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => {
        socketRef.current.emit("joinPresentation", presentationId, nickname);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socketRef.current.on("currentSlides", (slides) => {
        setCanvases(slides);
        if (slides.length > 0) {
          setActiveSlideIndex(0);
        }
      });

      socketRef.current.on("slideUpdated", (slides) => {
        setCanvases(slides);
      });
    }

    fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
      height: 550,
      width: 900,
      backgroundColor: "white",
    });

    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [presentationId, nickname]);

  useEffect(() => {
    if (fabricCanvas.current && canvases.length > 0 && activeSlideIndex >= 0) {
      const content = canvases[activeSlideIndex]?.content;

      if (content) {
        fabricCanvas.current.clear();
        fabricCanvas.current.loadFromJSON(
          content,
          () => {
            fabricCanvas.current.renderAll();

            fabricCanvas.current.getObjects().forEach((obj) => {
              obj.scaleToWidth(fabricCanvas.current.width);
              obj.scaleToHeight(fabricCanvas.current.height);
            });

            fabricCanvas.current.setZoom(1);

            fabricCanvas.current.renderAll();
            console.log("Canvas loaded and rendered with scaling.");
          },
          (o, object) => {
            console.log("Object loaded:", object);
          }
        );
      }
    }
  }, [activeSlideIndex, canvases]);

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSetCanvases = debounce(setCanvases, 300);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("slideUpdated", (slides) => {
        console.log("Slides updated:", slides);
        debouncedSetCanvases(slides);
      });
    }
  }, [debouncedSetCanvases]);

  const handleUpdateSlide = (slideId, content) => {
    console.log("Updating slide:", slideId, "with content:", content);
    if (socketRef.current) {
      socketRef.current.emit("updateSlide", presentationId, slideId, content);
    }
  };

  const setCanvasSize = () => {
    if (fabricCanvas.current) {
      fabricCanvas.current.setHeight(550);
      fabricCanvas.current.setWidth(900);
    }
  };

  const handleAddCanvas = async () => {
    const content = fabricCanvas.current.toJSON();
    console.log("Adding new slide with content:", content);
    try {
      const response = await fetch(`http://localhost:8080/api/slides`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ presentationId, content }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const slide = await response.json();
      console.log("New slide added:", slide);
      setCanvases((prev) => [...prev, slide]);
      handleUpdateSlide(slide.id, content);
    } catch (error) {
      console.error("Error creating slide:", error);
    }
  };

  const handleSlideClick = (index) => {
    setActiveSlideIndex(index);
  };

  const handleSelectTool = () => {
    if (fabricCanvas.current) {
      fabricCanvas.current.isDrawingMode = false;
      fabricCanvas.current.selection = true;
    }
  };

  const handleDraw = () => {
    if (fabricCanvas.current) {
      fabricCanvas.current.isDrawingMode = true;
      const pencilBrush = new fabric.PencilBrush(fabricCanvas.current);
      pencilBrush.color = "black";
      pencilBrush.width = 5;
      fabricCanvas.current.freeDrawingBrush = pencilBrush;

      fabricCanvas.current.on("path:created", () => {
        const updatedContent = fabricCanvas.current.toJSON();
        console.log(
          "Updating slide after drawing with content:",
          updatedContent
        );
        handleUpdateSlide(canvases[activeSlideIndex].id, updatedContent);
      });
    }
  };

  const handleEraser = () => {
    if (fabricCanvas.current) {
      fabricCanvas.current.isDrawingMode = true;
      const eraserBrush = new fabric.PencilBrush(fabricCanvas.current);
      eraserBrush.width = 20;
      eraserBrush.color = "white";
      fabricCanvas.current.freeDrawingBrush = eraserBrush;

      fabricCanvas.current.on("path:created", () => {
        const updatedContent = fabricCanvas.current.toJSON();
        console.log(
          "Updating slide after erasing with content:",
          updatedContent
        );
        handleUpdateSlide(canvases[activeSlideIndex].id, updatedContent);
      });
    }
  };

  const handleText = () => {
    const text = new fabric.Textbox("Double-click to edit", {
      left: 50,
      top: 50,
      fontSize: 20,
    });
    fabricCanvas.current.add(text);
    handleUpdateSlide(
      canvases[activeSlideIndex].id,
      fabricCanvas.current.toJSON()
    );
  };

  const handleSquare = () => {
    const square = new fabric.Rect({
      left: 50,
      top: 50,
      fill: "transparent",
      stroke: "black",
      strokeWidth: 2,
      width: 50,
      height: 50,
    });
    fabricCanvas.current.add(square);
    handleUpdateSlide(
      canvases[activeSlideIndex].id,
      fabricCanvas.current.toJSON()
    );
  };

  const handleCircle = () => {
    const circle = new fabric.Circle({
      left: 50,
      top: 50,
      radius: 25,
      fill: "transparent",
      stroke: "black",
      strokeWidth: 2,
    });
    fabricCanvas.current.add(circle);
    handleUpdateSlide(
      canvases[activeSlideIndex].id,
      fabricCanvas.current.toJSON()
    );
  };

  const handleTriangle = () => {
    const triangle = new fabric.Path("M 0 0 L 50 100 L -50 100 Z", {
      left: 50,
      top: 50,
      fill: "transparent",
      stroke: "black",
      strokeWidth: 2,
      width: 50,
      height: 50,
    });
    fabricCanvas.current.add(triangle);
    handleUpdateSlide(
      canvases[activeSlideIndex].id,
      fabricCanvas.current.toJSON()
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-rose-100 to-teal-100 p-4">
      <div className="w-1/4 border-gray-300 p-4 flex flex-col">
        {canvases.length > 0 ? (
          <div className="flex flex-col gap-4">
            {canvases.map((canvas, index) => (
              <div
                key={index}
                className={`hover:cursor-pointer bg-white rounded-md border border-gray-300 p-2 h-32 ${
                  activeSlideIndex === index ? "bg-blue-100" : ""
                }`}
                onClick={() => handleSlideClick(index)}
              >
                {canvas.title}
              </div>
            ))}
            <button
              className="mt-4 p-2 bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-600"
              onClick={handleAddCanvas}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600">
              No slides available. Create a slide!
            </p>
            <button
              className="mt-4 p-2 bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-600"
              onClick={handleAddCanvas}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        )}
      </div>

      <div className="w-3/4 p-4 flex flex-col items-center">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex justify-around mb-2">
            <button
              onClick={handleSelectTool}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Select"
            >
              <FontAwesomeIcon icon={faMousePointer} />
            </button>
            <button
              onMouseDown={handleDraw}
              onMouseUp={() => setIsDrawing(false)}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Draw"
            >
              <FontAwesomeIcon icon={faPencilAlt} />
            </button>
            <button
              onMouseDown={handleEraser}
              onMouseUp={() => setIsDrawing(false)}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Eraser"
            >
              <FontAwesomeIcon icon={faEraser} />
            </button>
            <button
              onClick={handleText}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Text"
            >
              <FontAwesomeIcon icon={faTextHeight} />
            </button>
            <button
              onClick={handleSquare}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Square"
            >
              <FontAwesomeIcon icon={faSquare} />
            </button>
            <button
              onClick={handleCircle}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Circle"
            >
              <FontAwesomeIcon icon={faCircle} />
            </button>
            <button
              onClick={handleTriangle}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="Triangle"
            >
              <FontAwesomeIcon icon={faTriangleCircleSquare} />
            </button>
          </div>
          <canvas
            style={{
              zIndex: 100,
              display: "block",
              opacity: 1,
            }}
            ref={canvasRef}
          />
        </div>
      </div>
    </div>
  );
}

export default Canvas;
