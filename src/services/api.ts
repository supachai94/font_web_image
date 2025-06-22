import axios from 'axios';
import { GetAllImagesResponse, GetImageByPathRequest, GetImageByPathResponse } from '../types/api';

const API_BASE_URL = 'http://localhost:8000';
// const API_BASE_URL = 'https://test-pic.tamada.work';

export const apiService = {
  // ดึงข้อมูลรูปภาพทั้งหมดจาก HN
  async getAllImagesByHN(hn: string): Promise<GetAllImagesResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/get-all-images-by-hn/${hn}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching images by HN:', error);
      throw error;
    }
  },

  // ดึงรูปภาพเป็น base64 จาก full_path
  async getImageByPath(fullPath: string): Promise<GetImageByPathResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/get-image-by-path/base64`, {
        full_path: fullPath
      } as GetImageByPathRequest);
      return response.data;
    } catch (error) {
      console.error('Error fetching image by path:', error);
      throw error;
    }
  }
}; 