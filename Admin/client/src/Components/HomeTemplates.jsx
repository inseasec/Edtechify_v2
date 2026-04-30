import React, { useState, useEffect,useRef } from 'react';
import { Check, Play, Clock, Calendar, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import api from '@/lib/api';

const HomeTemplates = ({ onVideoSelect }) => {
    const baseUrl = window._CONFIG_.VITE_API_BASE_URL;
    const [bannerVideos, setBannerVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [previewVideo, setPreviewVideo] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const videosPerPage = 6;
    const selectedVideoRef = useRef(null);

    useEffect(() => {
        fetchBannerVideos();
    }, []);


    const fetchBannerVideos = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/organizations/getAll/TemplateVideos`);
            if (response.status === 200) {
                const videos = response.data.map((video) => ({
                    id: video.name,
                    url: `${baseUrl}${video.url}`,
                }));
                setBannerVideos(videos);
            }

        } catch (error) {
            console.error('Error fetching banner videos:', error);
        } finally {
            setLoading(false);
        }
    };
    const getFileFromUrl = async (url, id) => {
        const response = await fetch(url);
        const blob = await response.blob();

        return new File(
            [blob],
            `template-video-${id}.mp4`,
            { type: blob.type || "video/mp4" }
        );
    };

    const handleSelectVideo = async (video) => {
        try {
            if (selectedVideoRef.current?.id === video.id) {

                selectedVideoRef.current = null;
                setSelectedVideo(null);

                setBannerVideos(prev =>
                    prev.map(v => ({ ...v, selected: false }))
                );

                if (onVideoSelect) {
                    onVideoSelect(null);
                }

                return;
            }

            selectedVideoRef.current = video;
            setSelectedVideo(video);

            setBannerVideos(prev =>
                prev.map(v => ({
                    ...v,
                    selected: v.id === video.id
                }))
            );

            if (!onVideoSelect) return;

            const file = await getFileFromUrl(video.url, video.id);

            if (selectedVideoRef.current?.id === video.id) {
                onVideoSelect(file);
            }

        } catch (error) {
            console.error("Video selection failed:", error);
        }
    };

    // Handle video preview
    const handlePreviewVideo = (video, e) => {
        e.stopPropagation();
        setPreviewVideo(video);
        setShowPreviewModal(true);
    };

    // Get current videos for pagination
    const indexOfLastVideo = currentPage * videosPerPage;
    const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
    const currentVideos = bannerVideos.slice(indexOfFirstVideo, indexOfLastVideo);
    const totalPages = Math.ceil(bannerVideos.length / videosPerPage);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-xl text-gray-600 font-medium">Loading banner videos...</p>
                    <p className="text-sm text-gray-400 mt-2">Please wait while we fetch your videos</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-black text-orange-500">Homepage Banner Templates</p>
                        </div>
                        {/* <div className="flex items-center gap-3">
                            <button
                                onClick={fetchBannerVideos}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {bannerVideos.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="relative w-40 h-40 mx-auto mb-6">
                            <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
                            <svg className="w-40 h-40 text-blue-300 p-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Banner Videos Found</h3>
                    </div>
                ) : (
                    <>
                        {/* Videos Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentVideos.map((video) => (
                                <div
                                    key={video.id}
                                    className={`group bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${video.selected ? 'ring-4 ring-blue-500 shadow-blue-200' : ''
                                        }`}
                                    onClick={() => handleSelectVideo(video)}
                                >
                                    {/* Video Thumbnail */}
                                    <div className="relative h-52 bg-gray-900">
                                        <video
                                            src={video.url}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => handlePreviewVideo(video, e)}
                                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                            >
                                                <Play size={24} className="text-blue-600" />
                                            </button>
                                        </div>

                                        {/* Selection Indicator */}
                                        {video.selected && (
                                            <div className="absolute top-3 right-3 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
                                                <Check size={18} />
                                            </div>
                                        )}
                                    </div>
                                    {/* <div className="p-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectVideo(video);
                                            }}
                                            className="mt-4 w-full p-2 rounded-lg text-[white] bg-orange-300 rounded-md  font-medium"
                                        >
                                            Upload
                                        </button>
                                    </div> */}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg ${currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === i + 1
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg ${currentPage === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            {showPreviewModal && previewVideo && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="relative bg-black rounded-xl overflow-hidden w-[90%] max-w-4xl shadow-2xl">

                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setShowPreviewModal(false);
                                setPreviewVideo(null);
                            }}
                            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center z-10"
                        >
                            <X size={20} />
                        </button>

                        {/* Video Player */}
                        <video
                            src={previewVideo.url}
                            controls
                            autoPlay
                            className="w-full h-[70vh] object-contain bg-black"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeTemplates;