import React, { useState, useEffect, useRef } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import OwnerLayout from '@/Layouts/OwnerLayout';

export default function Photos({ images = [], maxImages = 10 }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [modalData, setModalData] = useState(null);
    const fileInputRef = useRef(null);

    // Clean up preview URLs on unmount
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const remainingSlots = maxImages - images.length;
        
        if (files.length > remainingSlots) {
            alert(`You can only upload ${remainingSlots} more photo${remainingSlots > 1 ? 's' : ''}. Maximum ${maxImages} photos allowed.`);
            return;
        }

        setSelectedFiles(files);
        
        // Create preview URLs
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        const remainingSlots = maxImages - images.length;
        
        if (files.length > remainingSlots) {
            alert(`You can only upload ${remainingSlots} more photo${remainingSlots > 1 ? 's' : ''}. Maximum ${maxImages} photos allowed.`);
            return;
        }

        setSelectedFiles(files);
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    };

    const handleUpload = () => {
        if (selectedFiles.length === 0) return;

        setIsUploading(true);
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('images[]', file);
        });

        router.post('/owner/gym/photos', formData, {
            onSuccess: () => {
                setSelectedFiles([]);
                setPreviewUrls([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setIsUploading(false);
            },
            onError: () => {
                setIsUploading(false);
            },
            onFinish: () => {
                setIsUploading(false);
            }
        });
    };

    // Show delete confirmation modal
    const confirmDelete = (imageId) => {
        setModalData({ imageId });
        setModalAction('delete');
        setShowConfirmModal(true);
    };

    // Show set cover confirmation modal
    const confirmSetPrimary = (imageId) => {
        setModalData({ imageId });
        setModalAction('setPrimary');
        setShowConfirmModal(true);
    };

    // Execute the action after confirmation
    const executeAction = () => {
        setShowConfirmModal(false);
        
        if (modalAction === 'delete') {
            setIsProcessing(true);
            router.delete(`/owner/gym/photos/${modalData.imageId}`, {
                onFinish: () => setIsProcessing(false)
            });
        } else if (modalAction === 'setPrimary') {
            setIsProcessing(true);
            router.post(`/owner/gym/photos/${modalData.imageId}/primary`, {}, {
                onFinish: () => setIsProcessing(false)
            });
        }
    };

    const cancelUpload = () => {
        setSelectedFiles([]);
        setPreviewUrls([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const canUpload = images.length < maxImages;

    // Get modal content based on action
    const getModalContent = () => {
        if (modalAction === 'delete') {
            return {
                title: 'Delete Photo',
                message: 'Are you sure you want to delete this photo? This action cannot be undone.',
                icon: '🗑️',
                buttonText: 'Yes, Delete',
                buttonColor: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
            };
        } else if (modalAction === 'setPrimary') {
            return {
                title: 'Set Cover Photo',
                message: 'Are you sure you want to set this photo as the cover image? It will be displayed as the main photo for your gym.',
                icon: '⭐',
                buttonText: 'Yes, Set as Cover',
                buttonColor: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
            };
        }
        return null;
    };

    const modalContent = getModalContent();

    return (
        <>
            <Head title="Manage Photos" />
            
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                        📸 Manage Photos
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                        Gym <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Photos</span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                        Upload and manage photos for your gym listing. The first photo will be set as the cover image.
                        You can upload up to {maxImages} photos.
                    </p>
                </div>

                {/* Stats Bar */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📸</span>
                            <div>
                                <span className="text-xs text-slate-400">Total Photos</span>
                                <p className="text-lg font-bold text-white">{images.length} / {maxImages}</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-800"></div>
                        <div>
                            <span className="text-xs text-slate-400">Cover Photo</span>
                            <p className="text-sm font-semibold text-emerald-400">
                                {images.some(img => img.is_primary) ? '✅ Set' : '⚠️ Not Set'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                                style={{ width: `${(images.length / maxImages) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                            {images.length}/{maxImages}
                        </span>
                    </div>
                </div>

                {/* Upload Area */}
                {canUpload && (
                    <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10 mb-8">
                        <div 
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                                dragActive 
                                    ? 'border-amber-500 bg-amber-500/5' 
                                    : 'border-slate-700/50 hover:border-slate-600'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {previewUrls.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {previewUrls.map((url, index) => (
                                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700/50 group">
                                                <img 
                                                    src={url} 
                                                    alt={`Preview ${index + 1}`} 
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                                    <span className="text-xs text-white font-medium">#{index + 1}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-3">
                                        <button
                                            onClick={handleUpload}
                                            disabled={isUploading}
                                            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isUploading ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Uploading...
                                                </span>
                                            ) : (
                                                `Upload ${selectedFiles.length} Photo${selectedFiles.length > 1 ? 's' : ''}`
                                            )}
                                        </button>
                                        <button
                                            onClick={cancelUpload}
                                            className="text-sm font-semibold text-white/60 hover:text-white px-4 py-2.5 rounded-xl transition-all hover:bg-white/5"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-6xl">📤</div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Drop your photos here</p>
                                        <p className="text-xs text-slate-400 mt-1">or click to browse</p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="photo-upload"
                                    />
                                    <label
                                        htmlFor="photo-upload"
                                        className="inline-block bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-2.5 rounded-xl border border-white/10 transition-all cursor-pointer"
                                    >
                                        Choose Photos
                                    </label>
                                    <p className="text-[10px] text-slate-500">
                                        JPG, PNG, WEBP • Max 5MB each • {maxImages - images.length} slots remaining
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Photo Grid */}
                {images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {images.map((image) => (
                            <div key={image.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/50">
                                <img 
                                    src={image.url} 
                                    alt="Gym photo" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                                        {image.is_primary ? (
                                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                                                ⭐ Cover Photo
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => confirmSetPrimary(image.id)}
                                                disabled={isProcessing}
                                                className="block w-full text-center text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg py-1.5 transition-all disabled:opacity-50"
                                            >
                                                Set as Cover
                                            </button>
                                        )}
                                        <button
                                            onClick={() => confirmDelete(image.id)}
                                            disabled={isProcessing}
                                            className="block w-full text-center text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg py-1.5 transition-all disabled:opacity-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Badge - Primary */}
                                {image.is_primary && (
                                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-emerald-500/90 text-white text-[10px] font-bold">
                                        Cover
                                    </div>
                                )}

                                {/* Order Number */}
                                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/60 text-white text-[10px] font-mono">
                                    #{image.sort_order || 0}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl p-12 text-center backdrop-blur-xl bg-white/5 border-white/10">
                        <div className="text-6xl mb-4">🏋️</div>
                        <h3 className="text-xl font-bold text-white mb-2">No Photos Yet</h3>
                        <p className="text-sm text-slate-400 max-w-md mx-auto">
                            Upload photos of your gym to showcase your facilities, equipment, and atmosphere to potential members.
                        </p>
                        {canUpload && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-4 inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20"
                            >
                                Upload First Photo
                            </button>
                        )}
                    </div>
                )}

                {/* Tips Box */}
                <div className="mt-8 glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                    <div className="flex items-start gap-4">
                        <div className="text-2xl">💡</div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Tips for great photos</h3>
                            <ul className="mt-2 space-y-1 text-xs text-slate-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Use high-quality images (minimum 1200x800px)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Showcase your best equipment and facilities</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Include images of your gym atmosphere and community</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Set your best photo as the cover to attract more views</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && modalContent && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowConfirmModal(false)}
                    ></div>
                    
                    {/* Modal */}
                    <div className="relative max-w-md w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                modalAction === 'delete' 
                                    ? 'bg-red-500/10 border border-red-500/20' 
                                    : 'bg-emerald-500/10 border border-emerald-500/20'
                            }`}>
                                <span className={`text-3xl ${
                                    modalAction === 'delete' ? 'text-red-400' : 'text-emerald-400'
                                }`}>
                                    {modalContent.icon}
                                </span>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-bold text-white text-center mb-2">
                            {modalContent.title}
                        </h3>
                        <p className="text-sm text-slate-400 text-center mb-6">
                            {modalContent.message}
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeAction}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all duration-200 hover:scale-105 ${modalContent.buttonColor}`}
                            >
                                {modalContent.buttonText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Persistent Layout Setup
Photos.layout = (page) => <OwnerLayout>{page}</OwnerLayout>;