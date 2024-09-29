import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function Board() {
  const [canvases, setCanvases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCanvases = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/presentations");
        const data = await response.json();

        if (response.ok) {
          setCanvases(data);
        } else {
          console.error("Error fetching canvases:", data.message);
        }
      } catch (error) {
        console.error("Error fetching canvases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCanvases();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleAddCanvas = () => {
    console.log("Add canvas");
  };

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    navigate("/");
  };

  const handleCanvasClick = (presentationId) => {
    navigate(`/canvas?presentationId=${presentationId}`);
  };

  return (
    <div className="bg-gradient-to-r from-rose-100 to-teal-100 h-screen w-screen flex justify-center items-center relative">
      <h1 className="absolute top-4 left-4 text-3xl font-bold text-gray-800">
        Draw It!
      </h1>

      {canvases.length > 0 ? (
        <div className="grid grid-cols-4 gap-6">
          {canvases.map((canvas, index) => (
            <div
              key={index}
              className="hover:cursor-pointer bg-white rounded-md border border-gray-300 p-4 w-[286px] h-[236px] flex items-center justify-center"
              onClick={() => handleCanvasClick(canvas.id)} // Assuming each canvas has a unique id
            >
              {canvas.title}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600">
            No canvases found. Create the first canvas!
          </p>
          <button className="mt-4 p-2 bg-blue-500 text-white rounded-md" onClick={handleAddCanvas}>
            Create Canvas
          </button>
        </div>
      )}

      <button
        onClick={handleAddCanvas}
        className="fixed bottom-10 right-10 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600"
      >
        <FontAwesomeIcon icon={faPlus} size="lg" />
      </button>

      <button
        onClick={handleLogout}
        className="fixed bottom-10 left-10 bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600"
      >
        <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
      </button>
    </div>
  );
}

export default Board;