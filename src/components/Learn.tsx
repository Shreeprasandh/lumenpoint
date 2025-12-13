import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Map, Image as ImageIcon, Send, X, Grid3X3, Download } from 'lucide-react';
import { fetchRecentVideos, fetchAllVideos, getAssetPath } from '../services/youtube';
import { generateAIResponse, getInitialSuggestions } from '../services/ai';

interface VideoCard {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  videoId: string;
  publishedAt: string;
}

const Learn: React.FC = () => {
  const [videos, setVideos] = useState<VideoCard[]>([]);
  const [allVideos, setAllVideos] = useState<VideoCard[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoCard | null>(null);
  const [activeTab, setActiveTab] = useState<'visuals' | 'ai'>('visuals');
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'user' | 'ai' | 'suggestion'; text: string; isClickable?: boolean }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const recentVideos = await fetchRecentVideos();
        setVideos(recentVideos);
        setLoading(false);
      } catch (error) {
        console.error('Error loading videos:', error);
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  useEffect(() => {
    if (selectedVideo) {
      // Load initial AI suggestions when a video is selected
      const suggestions = getInitialSuggestions(selectedVideo.title);
      const formattedSuggestions = suggestions.map(suggestion => ({
        type: 'suggestion' as const,
        text: suggestion,
        isClickable: true
      }));
      setChatMessages(formattedSuggestions);
    }
  }, [selectedVideo]);

  const handleViewAllVideos = async () => {
    if (allVideos.length === 0) {
      try {
        const videos = await fetchAllVideos();
        setAllVideos(videos);
      } catch (error) {
        console.error('Error loading all videos:', error);
      }
    }
    setShowAllVideos(true);
  };

  const handleSendMessage = async () => {
    if (chatInput.trim() && selectedVideo) {
      const userMessage = { type: 'user' as const, text: chatInput };
      setChatMessages(prev => [...prev, userMessage]);
      setChatInput('');

      try {
        const aiResponse = await generateAIResponse(chatInput, selectedVideo.title);
        setChatMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
      } catch (error) {
        console.error('Error generating AI response:', error);
        setChatMessages(prev => [...prev, { type: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = async (suggestionText: string) => {
    if (selectedVideo) {
      // Add the suggestion as a user message
      const userMessage = { type: 'user' as const, text: suggestionText };
      setChatMessages(prev => [...prev, userMessage]);

      try {
        const aiResponse = await generateAIResponse(suggestionText, selectedVideo.title);
        setChatMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
      } catch (error) {
        console.error('Error generating AI response:', error);
        setChatMessages(prev => [...prev, { type: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
      }
    }
  };

  if (loading) {
    return (
      <motion.section
        className="py-32 bg-[#FAF6F2]"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-[#683B2B]">Loading videos...</div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="py-32 bg-[#FAF6F2]"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-serif text-[#683B2B] mb-16 text-center">
          Learn / Latest Points
        </h2>

        {/* Video Cards Row */}
        <div className="mb-8">
          <div className="flex space-x-6 justify-center">
            {videos.map((card) => (
              <motion.div
                key={card.id}
                className="bg-[#DED1BD] rounded-xl p-4 cursor-pointer w-[260px] shadow-sm"
                whileHover={{ scale: 1.03 }}
                onClick={() => setSelectedVideo(card)}
              >
                <div className="relative">
                  <img
                    src={card.thumbnail}
                    alt={card.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Play className="text-white" size={48} />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-sm px-2 py-1 rounded">
                    {card.duration}
                  </div>
                </div>
                <h3 className="text-lg font-serif text-[#683B2B] line-clamp-1">{card.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mb-16">
          <button
            onClick={handleViewAllVideos}
            className="inline-flex items-center gap-2 bg-[#683B2B] text-white px-4 py-2 rounded-lg hover:bg-[#B08401] transition-colors duration-300 font-medium"
          >
            <Grid3X3 size={20} />
            View All Videos
          </button>
        </div>

        {/* Active Video Stage */}
        <AnimatePresence>
          {selectedVideo && (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Video Player */}
              <div className="lg:col-span-2">
                <div className="bg-[#DED1BD] rounded-xl p-4 shadow-lg">
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
                      title={selectedVideo.title}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>

              {/* Knowledge Dock */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex space-x-4 mb-6">
                  <button
                    className={`pb-2 font-medium uppercase text-sm tracking-wide ${
                      activeTab === 'visuals'
                        ? 'text-[#683B2B] border-b-2 border-[#683B2B]'
                        : 'text-[#683B2B] opacity-60'
                    }`}
                    onClick={() => setActiveTab('visuals')}
                  >
                    Visuals
                  </button>
                  <button
                    className={`pb-2 font-medium uppercase text-sm tracking-wide ${
                      activeTab === 'ai'
                        ? 'text-[#683B2B] border-b-2 border-[#683B2B]'
                        : 'text-[#683B2B] opacity-60'
                    }`}
                    onClick={() => setActiveTab('ai')}
                  >
                    Ask AI
                  </button>
                </div>

                {activeTab === 'visuals' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="bg-[#DED1BD] p-4 rounded-lg cursor-pointer flex-1"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          const mindmapPath = getAssetPath('mindmap', selectedVideo.title);
                          window.open(mindmapPath, '_blank');
                        }}
                      >
                        <Map className="mb-2" size={24} />
                        <h4 className="font-serif text-[#683B2B]">Mind Map</h4>
                      </motion.div>
                      <button
                        onClick={() => {
                          const mindmapPath = getAssetPath('mindmap', selectedVideo.title);
                          const link = document.createElement('a');
                          link.href = mindmapPath;
                          link.download = `mindmap-${selectedVideo.title}.png`;
                          link.click();
                        }}
                        className="bg-[#683B2B] text-white p-3 rounded-lg hover:bg-[#B08401] transition-colors duration-300"
                        title="Download Mind Map"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="bg-[#DED1BD] p-4 rounded-lg cursor-pointer flex-1"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          const infographicPath = getAssetPath('thumbnail', selectedVideo.title);
                          window.open(infographicPath, '_blank');
                        }}
                      >
                        <ImageIcon className="mb-2" size={24} />
                        <h4 className="font-serif text-[#683B2B]">Infographic</h4>
                      </motion.div>
                      <button
                        onClick={() => {
                          const infographicPath = getAssetPath('thumbnail', selectedVideo.title);
                          const link = document.createElement('a');
                          link.href = infographicPath;
                          link.download = `infographic-${selectedVideo.title}.jpeg`;
                          link.click();
                        }}
                        className="bg-[#683B2B] text-white p-3 rounded-lg hover:bg-[#B08401] transition-colors duration-300"
                        title="Download Infographic"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div className="flex flex-col h-96">
                    <div className="flex-1 bg-[#FAF6F2] rounded-lg p-4 mb-4 overflow-y-auto shadow-inner">
                      {chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`mb-3 p-3 rounded-xl ${
                            msg.type === 'user'
                              ? 'bg-[#DED1BD] text-[#683B2B] ml-8'
                              : msg.type === 'suggestion'
                              ? 'bg-[#B08401] text-white mr-8 cursor-pointer hover:bg-[#8B6B00] transition-colors duration-200'
                              : 'bg-white text-[#683B2B] mr-8 border border-[#B08401] shadow-sm'
                          }`}
                          onClick={msg.type === 'suggestion' ? () => handleSuggestionClick(msg.text) : undefined}
                        >
                          {msg.type === 'suggestion' ? `💡 ${msg.text}` : msg.text}
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about this video..."
                        className="flex-1 px-4 py-2 border-2 border-[#683B2B] rounded-l-lg focus:border-[#B08401] outline-none"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-4 py-2 bg-[#683B2B] text-white rounded-r-lg hover:bg-[#B08401] transition-colors duration-300"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All Videos Modal */}
        <AnimatePresence>
          {showAllVideos && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllVideos(false)}
            >
              <motion.div
                className="bg-white rounded-xl p-6 max-w-6xl w-full max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-serif text-[#683B2B]">All Videos</h3>
                  <button
                    onClick={() => setShowAllVideos(false)}
                    className="text-[#683B2B] hover:text-[#B08401]"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allVideos.map((video) => (
                    <motion.div
                      key={video.id}
                      className="bg-[#DED1BD] rounded-lg p-4 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSelectedVideo(video);
                        setShowAllVideos(false);
                      }}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                      <h4 className="font-serif text-[#683B2B] text-sm line-clamp-2">{video.title}</h4>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImage(null)}
            >
              <motion.div
                className="relative max-w-4xl max-h-full p-4"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={lightboxImage}
                  alt="Visual content"
                  className="w-full h-auto rounded-xl"
                />
                <button
                  onClick={() => setLightboxImage(null)}
                  className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2"
                >
                  <X size={24} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default Learn;
