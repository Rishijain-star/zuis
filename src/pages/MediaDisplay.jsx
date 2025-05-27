import React, { useState, useEffect, useRef } from 'react';
import axios from '../api/axiosConfig';
import { X } from 'lucide-react';

const BACKEND_BASE_URL = axios.defaults.baseURL;

export default function MediaDisplay({ media, label }) {
  const isWebUrl = media.mimetype === 'text/url' || media.url;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0 });
  const [error, setError] = useState(null);
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  if (!media || (!media.path && !media.url)) return null;

  function resolveMediaUrl(media) {
  const isWebUrl = media.mimetype === 'text/url' || !!media.url;

  const rawUrl = media.url || media.path;
  if (!rawUrl) return null;

  // YouTube handling
  const ytMatch = rawUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // If it's an external web URL (not hosted by backend), use as is
  if (isWebUrl) {
    return rawUrl;
  }

  // Else assume it's a media path on your backend
  return `${BACKEND_BASE_URL}${media.path}`;
}


const url = resolveMediaUrl(media);


  const handleOpenModal = () => {
    setIsModalOpen(true);
    setPosition({ x: window.innerWidth / 8, y: window.innerHeight / 8 });
    setSize({ width: 800, height: 600 });
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsDragging(false);
    setIsResizing(false);
    setError(null);
  };

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleCloseModal();
    }
  };

  const handleMouseDown = (e) => {
    if (contentRef.current?.contains(e.target) || e.target.closest('button') || e.target.closest('.resize-handle')) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      const modal = modalRef.current;
      if (modal) {
        const { width, height } = modal.getBoundingClientRect();
        const maxX = window.innerWidth - width;
        const maxY = window.innerHeight - height;
        setPosition({ x: Math.max(0, Math.min(newX, maxX)), y: Math.max(0, Math.min(newY, maxY)) });
      }
    } else if (isResizing) {
      const newWidth = Math.max(300, resizeStart.width + (e.clientX - dragStart.x));
      const newHeight = Math.max(200, resizeStart.height + (e.clientY - dragStart.y));
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setResizeStart({ width: size.width, height: size.height });
  };

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen, isDragging, isResizing, dragStart, position, resizeStart]);

  const renderMedia = () => {
    try {
      if (media.mimetype?.startsWith('image/')) {
        return <img src={url} alt={media.originalname || 'Image'} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={() => setError('Failed to load image')} />;
      } else if (media.mimetype?.startsWith('video/')) {
        return <video controls src={url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={() => setError('Failed to load video')} />;
      } else if (media.mimetype === 'text/url' || media.url) {
        return (
          <div className="flex flex-col w-full h-full">
            <iframe
              src={url}
              title={media.originalname || 'Web Content'}
              style={{ width: '100%', flex: '1 1 auto', border: 'none' }}
              sandbox="allow-scripts allow-same-origin"
              onError={() => setError('This website cannot be embedded. Click the link below to open it.')}
            />
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm p-2 mt-2"
              aria-label={`Visit external URL: ${url}`}
            >
              {url}
            </a>
          </div>
        );
      } else if (media.mimetype?.startsWith('application/pdf')) {
        return <embed src={url} type="application/pdf" style={{ width: '100%', height: '100%' }} onError={() => setError('Failed to load PDF')} />;
      } else if (media.mimetype?.startsWith('application/msword') || media.mimetype?.startsWith('application/vnd.openxmlformats-officedocument')) {
        return <a href={url} download className="text-blue-600 hover:underline">{media.originalname || 'Download Document'}</a>;
      } else {
        return <a href={url} download className="text-blue-600 hover:underline">{media.originalname || 'Download Media'}</a>;
      }
    } catch (err) {
      setError('Error rendering media');
      return null;
    }
  };

  return (
    <>
      <button onClick={handleOpenModal} className="text-blue-600 hover:underline text-sm ml-2">
        {label || 'View Media'}
      </button>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-4 relative cursor-move"
            style={{
              width: `${size.width}px`,
              height: `${size.height}px`,
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              left: `${position.x}px`,
              top: `${position.y}px`,
              position: 'absolute',
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="w-full p-2 bg-gray-200 flex justify-between items-center">
              <span>{media.originalname || media.url || 'Media'}</span>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700" aria-label="Close media viewer">
                <X size={20} />
              </button>
            </div>
            <div ref={contentRef} className="p-4 flex justify-center items-center" style={{ flex: 1, width: '100%' }} onMouseDown={(e) => e.stopPropagation()}>
              {error ? <p className="text-red-500">{error}</p> : renderMedia()}
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-gray-400 cursor-se-resize resize-handle" onMouseDown={handleResizeMouseDown} aria-label="Resize media viewer" />
          </div>
        </div>
      )}
    </>
  );
}
