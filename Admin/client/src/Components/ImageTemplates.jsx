import React, { useState, useEffect, useRef } from 'react';
import { Check, Image as ImageIcon, Calendar, Eye, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import api from '@/lib/api';

const ImageTemplates = ({ onImageSelect }) => {
    const baseUrl = window._CONFIG_.VITE_API_BASE_URL;
    const [bannerImages, setBannerImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [previewImage, setPreviewImage] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const imagesPerPage = 6;
    const selectedImageRef = useRef(null);

    // Fetch banner images from API
    useEffect(() => {
        fetchBannerImages();
    }, []);

    const fetchBannerImages = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/organizations/getAllHome/template-image`);
            if (response.status === 200) {
                const images = response.data.map((image) => ({
                    id: image.name,
                    url: `${baseUrl}${image.url}`,

                   
                }));
                
                setBannerImages(images);
        
            }
        } catch (error) {
            console.error('Error fetching banner images:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFileFromUrl = async (url, id) => {
        const response = await fetch(url);
        const blob = await response.blob();

        const extension = url.split('.').pop()?.split('?')[0] || 'jpg';

        return new File(
            [blob],
            `template-image-${id}.${extension}`,
            { type: blob.type || `image/${extension}` }
        );
    };

    const handleSelectImage = async (image) => {
        try {
            if (selectedImageRef.current?.id === image.id) {
                selectedImageRef.current = null;
                setSelectedImage(null);

                setBannerImages(prev =>
                    prev.map(img => ({ ...img, selected: false }))
                );

                if (onImageSelect) {
                    onImageSelect(null);
                }
                return;
            }
            selectedImageRef.current = image;
            setSelectedImage(image);

            setBannerImages(prev =>
                prev.map(img => ({
                    ...img,
                    selected: img.id === image.id
                }))
            );

            if (!onImageSelect) return;

            const file = await getFileFromUrl(image.url, image.id);

            if (selectedImageRef.current?.id === image.id) {
                onImageSelect(file);
            }
        } catch (error) {
            console.error("Image selection failed:", error);
        }
    };

    const handlePreviewImage = (image, e) => {
        e.stopPropagation();
        setPreviewImage(image);
        setShowPreviewModal(true);
    };

    const indexOfLastImage = currentPage * imagesPerPage;
    const indexOfFirstImage = indexOfLastImage - imagesPerPage;
    const currentImages = bannerImages.slice(indexOfFirstImage, indexOfLastImage);
    const totalPages = Math.ceil(bannerImages.length / imagesPerPage);



    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-xl text-gray-600 font-medium">Loading banner images...</p>
                    <p className="text-sm text-gray-400 mt-2">Please wait while we fetch your images</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-purple-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-orange-600">Home Page Banner Templates</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {bannerImages.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="relative w-40 h-40 mx-auto mb-6">
                            <div className="absolute inset-0 bg-purple-100 rounded-full animate-pulse"></div>
                            <ImageIcon className="w-40 h-40 text-purple-300 p-8" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Banner Images Found</h3>
                    </div>
                ) : (
                    <>
                        {/* Images Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentImages.map((image) => (
                                <div
                                    key={image.id}
                                    className={`group bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${image.selected ? 'ring-4 ring-purple-500 shadow-purple-200' : ''
                                        }`}
                                    onClick={() => handleSelectImage(image)}
                                >
                                    {/* Image Thumbnail */}
                                    <div className="relative h-52 bg-gray-900">
                                        <img
                                            src={image.url}
                                            alt={image.name}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => handlePreviewImage(image, e)}
                                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                            >
                                                <ZoomIn size={24} className="text-purple-600" />
                                            </button>
                                        </div>

                                        {/* Selection Indicator */}
                                        {image.selected && (
                                            <div className="absolute top-3 right-3 bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
                                                <Check size={18} />
                                            </div>
                                        )}
                                    </div>
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
                                            ? 'bg-purple-600 text-white'
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

            {/* Preview Modal */}
            {showPreviewModal && previewImage && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="relative bg-black rounded-xl overflow-hidden w-[90%] max-w-4xl shadow-2xl">
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setShowPreviewModal(false);
                                setPreviewImage(null);
                            }}
                            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center z-10"
                        >
                            <X size={20} />
                        </button>
                        {/* Image Preview */}
                        <img
                            src={previewImage.url}
                            alt={previewImage.name}
                            className="w-full h-[70vh] object-contain bg-black"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageTemplates;