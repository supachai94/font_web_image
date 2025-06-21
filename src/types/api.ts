export interface ImageInfo {
  filename: string;
  branch_code: string;
  full_path: string;
  size: number;
  url: string;
  dates: {
    created_time: string;
    modified_time: string;
    accessed_time: string;
  };
}

export interface GetAllImagesResponse {
  hn: string;
  total_images: number;
  images: ImageInfo[];
}

export interface GetImageByPathRequest {
  full_path: string;
}

export interface GetImageByPathResponse {
  full_path: string;
  filename: string;
  branch_code: string;
  size: number;
  base64: string;
  mime_type: string;
} 