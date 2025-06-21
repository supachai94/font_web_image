import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { GetAllImagesResponse, GetImageByPathResponse } from '../types/api';

interface ImageGalleryProps {
  hn: string;
}

interface LoadedImage {
  fullPath: string;
  base64: string;
  mimeType: string;
  filename: string;
  createdTime: string;
}

// Interface สำหรับกลุ่มรูปภาพ
interface ImageGroup {
  date: string;
  displayDate: string;
  images: LoadedImage[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ hn }) => {
  const [imagesData, setImagesData] = useState<GetAllImagesResponse | null>(null);
  const [loadedImages, setLoadedImages] = useState<LoadedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<LoadedImage | null>(null);
  // เปลี่ยนค่าเริ่มต้นเป็น empty string เพื่อจัดการสถานะเริ่มต้น
  const [selectedDate, setSelectedDate] = useState<string>(''); // '', 'all', หรือ date string
  const [imageGroups, setImageGroups] = useState<ImageGroup[]>([]);
  // เพิ่ม state สำหรับเก็บรูปภาพที่โหลดแล้ว
  const [loadedImageMap, setLoadedImageMap] = useState<{ [key: string]: LoadedImage }>({});
  const [loadingImages, setLoadingImages] = useState(false);

  // ฟังก์ชันจัดกลุ่มรูปภาพตามวันที่
  const groupImagesByDate = (images: LoadedImage[]): ImageGroup[] => {
    const groups: { [key: string]: LoadedImage[] } = {};
    
    images.forEach(image => {
      const date = new Date(image.createdTime);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(image);
    });

    // แปลงเป็น array และเรียงลำดับจากใหม่ไปเก่า
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a)) // เรียงจากใหม่ไปเก่า
      .map(dateKey => {
        const date = new Date(dateKey);
        const displayDate = date.toLocaleDateString('th-TH', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        return {
          date: dateKey,
          displayDate,
          images: groups[dateKey].sort((a, b) => 
            new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
          )
        };
      });
  };

  // ฟังก์ชันโหลดรูปภาพเฉพาะวันที่
  const loadImagesForDate = async (dateKey: string) => {
    if (!imagesData) return;

    const targetGroup = imageGroups.find(group => group.date === dateKey);
    if (!targetGroup) return;

    // เช็คว่ารูปภาพในวันที่นี้โหลดมาแล้วหรือยัง
    const unloadedImages = targetGroup.images.filter(image => !loadedImageMap[image.fullPath]);
    
    if (unloadedImages.length === 0) {
      // รูปภาพโหลดมาแล้วทั้งหมด
      return;
    }

    setLoadingImages(true);

    // โหลดรูปภาพที่ยังไม่มี
    for (const imageInfo of unloadedImages) {
      try {
        const imageData = await apiService.getImageByPath(imageInfo.fullPath);
        const loadedImage: LoadedImage = {
          fullPath: imageInfo.fullPath,
          base64: imageData.base64,
          mimeType: imageData.mime_type,
          filename: imageInfo.filename,
          createdTime: imageInfo.createdTime
        };

        setLoadedImageMap(prev => ({
          ...prev,
          [imageInfo.fullPath]: loadedImage
        }));
      } catch (err) {
        console.error(`Error loading image ${imageInfo.filename}:`, err);
      }
    }

    setLoadingImages(false);
  };

  // ฟังก์ชันโหลดรูปภาพทั้งหมด
  const loadAllImages = async () => {
    if (!imagesData || imagesData.images.length === 0) return;

    setLoadingImages(true);

    // โหลดรูปภาพทั้งหมดที่ยังไม่มี
    for (const imageInfo of imagesData.images) {
      if (!loadedImageMap[imageInfo.full_path]) {
        try {
          const imageData = await apiService.getImageByPath(imageInfo.full_path);
          const loadedImage: LoadedImage = {
            fullPath: imageInfo.full_path,
            base64: imageData.base64,
            mimeType: imageData.mime_type,
            filename: imageInfo.filename,
            createdTime: imageInfo.dates.created_time
          };

          setLoadedImageMap(prev => ({
            ...prev,
            [imageInfo.full_path]: loadedImage
          }));
        } catch (err) {
          console.error(`Error loading image ${imageInfo.filename}:`, err);
        }
      }
    }

    setLoadingImages(false);
  };

  // ฟังก์ชันดึงข้อมูลรูปภาพทั้งหมด
  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    setImagesData(null);
    setLoadedImageMap({}); // รีเซ็ตรูปภาพที่โหลดแล้ว
    setLoadedImages([]);
    setImageGroups([]);
    setSelectedDate(''); // รีเซ็ตวันที่ที่เลือกเป็นสถานะเริ่มต้น
    try {
      const data = await apiService.getAllImagesByHN(hn);
      setImagesData(data);
      
      // สร้าง placeholder สำหรับแต่ละรูป
      const placeholders = data.images.map(img => ({
        fullPath: img.full_path,
        base64: '',
        mimeType: '',
        filename: img.filename,
        createdTime: img.dates.created_time
      }));
      setLoadedImages(placeholders);

      // ถ้าไม่พบรูปภาพ ให้ตั้งค่าเป็น 'all'
      if (placeholders.length === 0) {
        setSelectedDate('all');
      }
    } catch (err) {
      setError('ไม่สามารถดึงข้อมูลรูปภาพได้');
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  // อัพเดท imageGroups เมื่อ loadedImages เปลี่ยน
  useEffect(() => {
    if (loadedImages.length > 0) {
      const groups = groupImagesByDate(loadedImages);
      setImageGroups(groups);
      // ตั้งค่าวันที่ล่าสุดเป็นค่าเริ่มต้น
      if (groups.length > 0 && selectedDate === '') {
        setSelectedDate(groups[0].date);
      }
    }
  }, [loadedImages]);

  // โหลดรูปภาพเมื่อเลือกวันที่
  useEffect(() => {
    if (!selectedDate) return; // ไม่ทำงานเมื่อ selectedDate เป็น ''

    if (selectedDate === 'all') {
      loadAllImages();
    } else {
      loadImagesForDate(selectedDate);
    }
  }, [selectedDate, imageGroups]);

  useEffect(() => {
    if (hn) {
      fetchImages();
    }
  }, [hn]);

  // ฟังก์ชันดึงรูปภาพที่เลือก
  const getSelectedImages = (): LoadedImage[] => {
    if (selectedDate === 'all') {
      return Object.values(loadedImageMap);
    }
    const selectedGroup = imageGroups.find(group => group.date === selectedDate);
    if (!selectedGroup) return [];
    
    return selectedGroup.images.map(image => 
      loadedImageMap[image.fullPath] || {
        ...image,
        base64: '',
        mimeType: ''
      }
    );
  };

  // ฟังก์ชันดึงชื่อวันที่ที่เลือก
  const getSelectedDateDisplay = (): string => {
    if (selectedDate === 'all') {
      return 'รูปภาพทั้งหมด';
    }
    const selectedGroup = imageGroups.find(group => group.date === selectedDate);
    return selectedGroup ? selectedGroup.displayDate : 'รูปภาพทั้งหมด';
  };

  if (loading && !imagesData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong className="font-bold">ข้อผิดพลาด: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!imagesData) {
    return null;
  }

  const selectedImages = getSelectedImages();

  return (
    <div className="space-y-6">
      {/* แสดงจำนวนรูปภาพทั้งหมด */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800">
          รหัสลูกค้า: {imagesData.hn}
        </h3>
        <p className="text-blue-600">
          พบรูปภาพทั้งหมด {imagesData.total_images} รูป
        </p>
      </div>

      {/* เมนูเลือกวันที่ */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">เลือกวันที่</h3>
        <div className="flex flex-wrap gap-2">
          {/* ปุ่มแสดงทั้งหมด */}
          <button
            onClick={() => setSelectedDate('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedDate === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            แสดงทั้งหมด ({loadedImages.length})
          </button>
          
          {/* ปุ่มเลือกวันที่ */}
          {imageGroups.map((group) => (
            <button
              key={group.date}
              onClick={() => setSelectedDate(group.date)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDate === group.date
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {group.displayDate} ({group.images.length})
            </button>
          ))}
        </div>
      </div>

      {/* แสดงรูปภาพที่เลือก */}
      <div className="space-y-4">
        {/* หัวข้อวันที่ที่เลือก */}
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-xl font-semibold text-gray-800">
            {getSelectedDateDisplay()}
          </h3>
          <p className="text-sm text-gray-600">
            {selectedImages.length} รูป
            {loadingImages && <span className="ml-2 text-blue-600">กำลังโหลด...</span>}
          </p>
        </div>

        {/* รูปภาพ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedImages.map((image, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                {image.base64 ? (
                  <img
                    src={`data:${image.mimeType};base64,${image.base64}`}
                    alt={image.filename}
                    className="w-full h-full object-cover cursor-zoom-in"
                    loading="lazy"
                    onClick={() => setModalImage(image)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
                    <span className="text-sm">กำลังโหลด...</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm text-gray-600 truncate" title={image.filename}>
                  {image.filename}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(image.createdTime).toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* แสดงข้อความเมื่อไม่มีรูปภาพ */}
        {selectedImages.length === 0 && !loadingImages && (
          <div className="text-center py-8 text-gray-500">
            ไม่มีรูปภาพในวันที่เลือก
          </div>
        )}
      </div>

      {/* Modal แสดงรูปขนาดใหญ่ */}
      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setModalImage(null)}>
          <div className="relative max-w-3xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-gray-200 focus:outline-none"
              onClick={() => setModalImage(null)}
              aria-label="ปิด"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={`data:${modalImage.mimeType};base64,${modalImage.base64}`}
              alt={modalImage.filename}
              className="w-full h-auto max-h-[80vh] rounded-lg object-contain bg-white"
            />
            <div className="text-center text-white mt-2">
              <div className="text-sm truncate">{modalImage.filename}</div>
              <div className="text-xs text-gray-300 mt-1">
                {new Date(modalImage.createdTime).toLocaleString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ปุ่มโหลดใหม่ */}
      <div className="flex justify-center">
        <button
          onClick={fetchImages}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'กำลังโหลด...' : 'โหลดใหม่'}
        </button>
      </div>
    </div>
  );
}; 