'use client';

import React, { useRef, useEffect, useState } from 'react';

interface DrawingCanvasProps {
  isDrawing: boolean;
  currentPlayer: string;
  onDrawingChange: (data: any) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ 
  isDrawing, 
  currentPlayer, 
  onDrawingChange 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingState, setIsDrawingState] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#da5047');
  const [selectedBrushSize, setSelectedBrushSize] = useState(5);
  const [selectedTool, setSelectedTool] = useState('brush');

  const colors = [
    { name: 'Spider Red', value: '#da5047', symbol: '🕷️' },
    { name: 'Spider Blue', value: '#0648a9', symbol: '🕸️' },
    { name: 'Spider Black', value: '#030104', symbol: '⚫' },
    { name: 'Spider Grey', value: '#abadbf', symbol: '⚪' },
    { name: 'White', value: '#ffffff', symbol: '🤍' },
    { name: 'Green', value: '#00ff00', symbol: '💚' },
    { name: 'Yellow', value: '#ffff00', symbol: '💛' },
    { name: 'Purple', value: '#800080', symbol: '💜' },
    { name: 'Orange', value: '#ff6600', symbol: '🧡' },
    { name: 'Pink', value: '#ff69b4', symbol: '💗' },
    { name: 'Cyan', value: '#00ffff', symbol: '💎' },
    { name: 'Gold', value: '#ffd700', symbol: '✨' },
  ];

  const brushSizes = [
    { name: 'Thin', value: 2, symbol: '—' },
    { name: 'Medium', value: 5, symbol: '▬' },
    { name: 'Thick', value: 10, symbol: '▰' },
    { name: 'Extra Thick', value: 15, symbol: '⬛' },
  ];

  const tools = [
    { name: 'Brush', value: 'brush', icon: '🖌️' },
    { name: 'Eraser', value: 'eraser', icon: '🧽' },
    { name: 'Spray', value: 'spray', icon: '💨' },
    { name: 'Marker', value: 'marker', icon: '🖍️' },
    { name: 'Highlighter', value: 'highlighter', icon: '✨' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawingState(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Send drawing start data
    onDrawingChange({
      type: 'start',
      x,
      y,
      color: selectedColor,
      brushSize: selectedBrushSize,
      tool: selectedTool
    });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingState) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = selectedTool === 'eraser' ? '#ffffff' : selectedColor;
    ctx.lineWidth = selectedBrushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Send drawing data
    onDrawingChange({
      type: 'draw',
      x,
      y,
      color: selectedColor,
      brushSize: selectedBrushSize,
      tool: selectedTool
    });
  };

  const stopDrawing = () => {
    setIsDrawingState(false);
    
    // Send drawing end data
    onDrawingChange({
      type: 'end'
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Send clear data
    onDrawingChange({
      type: 'clear'
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Drawing Tools */}
      <div className="bg-spider-black/80 backdrop-blur-sm border border-spider-red/30 rounded-xl p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Tool Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-spider-grey text-sm font-speedy">Tools:</span>
            {tools.map((tool) => (
              <button
                key={tool.value}
                onClick={() => setSelectedTool(tool.value)}
                className={`px-3 py-1 rounded-lg text-sm font-speedy transition-all duration-300 ${
                  selectedTool === tool.value
                    ? 'bg-spider-red text-white spider-glow'
                    : 'bg-spider-navy/50 text-spider-grey hover:bg-spider-navy/70'
                }`}
              >
                {tool.icon} {tool.name}
              </button>
            ))}
          </div>

          {/* Color Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-spider-grey text-sm font-speedy">Colors:</span>
            <div className="flex space-x-1">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center text-lg ${
                    selectedColor === color.value
                      ? 'border-white scale-110 spider-glow'
                      : 'border-gray-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {color.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div className="flex items-center space-x-2">
            <span className="text-spider-grey text-sm font-speedy">Size:</span>
            <select
              value={selectedBrushSize}
              onChange={(e) => setSelectedBrushSize(Number(e.target.value))}
              className="bg-spider-navy/50 border border-spider-grey/30 rounded text-white text-sm px-2 py-1 focus:border-spider-red focus:outline-none"
            >
              {brushSizes.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.symbol} {size.name} ({size.value}px)
                </option>
              ))}
            </select>
          </div>

          {/* Clear Button */}
          <button
            onClick={clearCanvas}
            className="px-4 py-1 bg-spider-red text-white rounded text-sm font-speedy hover:bg-spider-dark-red transition-colors spider-glow"
          >
            🧽 Clear Canvas
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 bg-white rounded-xl border-2 border-spider-grey/30 overflow-hidden relative">
        {!isDrawing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <div className="text-4xl mb-2">⏳</div>
              <p className="text-lg font-speedy">Waiting for {currentPlayer} to draw...</p>
            </div>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`w-full h-full cursor-${isDrawing ? 'crosshair' : 'not-allowed'}`}
          style={{ backgroundColor: '#ffffff' }}
        />
      </div>

      {/* Current Tool Info */}
      <div className="mt-2 text-center">
        <div className="text-spider-grey text-sm font-speedy">
          {isDrawing ? (
            <>
              🎨 Drawing with {selectedTool} • Color: {colors.find(c => c.value === selectedColor)?.name} • Size: {selectedBrushSize}px
            </>
          ) : (
            <>👀 Watching {currentPlayer} draw...</>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawingCanvas;
