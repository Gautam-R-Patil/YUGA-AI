import React, { useState, useEffect, useRef } from "react";
import { Pen, Eraser, Square, Circle, Type, Download, Trash2, Undo, Redo } from "lucide-react";

interface WhiteboardProps {
  isVisible: boolean;
  currentTopic: string;
  keyPoints: string[];
  onClose: () => void;
}

interface DrawingElement {
  type: 'line' | 'rectangle' | 'circle' | 'text';
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  strokeWidth: number;
}

export const SmartWhiteboard: React.FC<WhiteboardProps> = ({
  isVisible,
  currentTopic,
  keyPoints,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'text'>('pen');
  const [color, setColor] = useState('#2563eb');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [history, setHistory] = useState<DrawingElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Auto-generate content based on topic
  useEffect(() => {
    if (isVisible && currentTopic) {
      generateAutoContent();
    }
  }, [isVisible, currentTopic, keyPoints]);

  const generateAutoContent = () => {
    const autoElements: DrawingElement[] = [];
    
    // Add title
    autoElements.push({
      type: 'text',
      x: 50,
      y: 50,
      text: currentTopic,
      color: '#1f2937',
      strokeWidth: 2
    });

    // Add key points
    keyPoints.forEach((point, index) => {
      autoElements.push({
        type: 'text',
        x: 70,
        y: 120 + (index * 40),
        text: `• ${point}`,
        color: '#374151',
        strokeWidth: 1
      });
    });

    // Add visual elements based on topic
    if (currentTopic.toLowerCase().includes('machine learning')) {
      // Draw a simple neural network diagram
      autoElements.push({
        type: 'circle',
        x: 500,
        y: 150,
        width: 30,
        height: 30,
        color: '#3b82f6',
        strokeWidth: 2
      });
      autoElements.push({
        type: 'circle',
        x: 600,
        y: 120,
        width: 30,
        height: 30,
        color: '#3b82f6',
        strokeWidth: 2
      });
      autoElements.push({
        type: 'circle',
        x: 600,
        y: 180,
        width: 30,
        height: 30,
        color: '#3b82f6',
        strokeWidth: 2
      });
      autoElements.push({
        type: 'circle',
        x: 700,
        y: 150,
        width: 30,
        height: 30,
        color: '#10b981',
        strokeWidth: 2
      });
    }

    setElements(autoElements);
    saveToHistory(autoElements);
  };

  const saveToHistory = (newElements: DrawingElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    
    if (tool === 'pen') {
      const newElement: DrawingElement = {
        type: 'line',
        points: [x, y],
        color,
        strokeWidth
      };
      setElements(prev => [...prev, newElement]);
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === 'pen') {
      setElements(prev => {
        const newElements = [...prev];
        const lastElement = newElements[newElements.length - 1];
        if (lastElement && lastElement.type === 'line' && lastElement.points) {
          lastElement.points.push(x, y);
        }
        return newElements;
      });
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory(elements);
    }
  };

  const clearCanvas = () => {
    setElements([]);
    saveToHistory([]);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const downloadCanvas = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `${currentTopic.replace(/\s+/g, '_')}_notes.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw elements
    elements.forEach(element => {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      switch (element.type) {
        case 'line':
          if (element.points && element.points.length >= 4) {
            ctx.beginPath();
            ctx.moveTo(element.points[0], element.points[1]);
            for (let i = 2; i < element.points.length; i += 2) {
              ctx.lineTo(element.points[i], element.points[i + 1]);
            }
            ctx.stroke();
          }
          break;
        case 'rectangle':
          if (element.x && element.y && element.width && element.height) {
            ctx.strokeRect(element.x, element.y, element.width, element.height);
          }
          break;
        case 'circle':
          if (element.x && element.y && element.width) {
            ctx.beginPath();
            ctx.arc(element.x + element.width/2, element.y + element.width/2, element.width/2, 0, 2 * Math.PI);
            ctx.stroke();
          }
          break;
        case 'text':
          if (element.x && element.y && element.text) {
            ctx.fillStyle = element.color;
            ctx.font = `${element.strokeWidth === 2 ? '24px' : '16px'} Arial`;
            ctx.fillText(element.text, element.x, element.y);
          }
          break;
      }
    });
  }, [elements]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Smart Whiteboard</h3>
            <p className="text-sm text-gray-600">{currentTopic}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            {/* Tools */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTool('pen')}
                className={`p-2 rounded-lg transition-colors ${
                  tool === 'pen' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Pen className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`p-2 rounded-lg transition-colors ${
                  tool === 'eraser' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Eraser className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTool('rectangle')}
                className={`p-2 rounded-lg transition-colors ${
                  tool === 'rectangle' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Square className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTool('circle')}
                className={`p-2 rounded-lg transition-colors ${
                  tool === 'circle' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Circle className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTool('text')}
                className={`p-2 rounded-lg transition-colors ${
                  tool === 'text' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Type className="w-5 h-5" />
              </button>
            </div>

            {/* Color picker */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Color:</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300"
              />
            </div>

            {/* Stroke width */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Size:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Redo className="w-5 h-5" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={downloadCanvas}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-4">
          <canvas
            ref={canvasRef}
            width={1000}
            height={600}
            className="w-full h-full border border-gray-300 rounded-lg bg-white cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
};
