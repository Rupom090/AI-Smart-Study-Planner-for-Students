import axios, { AxiosProgressEvent } from 'axios';

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export interface UploadedFileResponse {
    id: string;
    filename: string;
    original_name: string;
    url: string;
    size: number;
    formatted_size: string;
    mime_type: string;
    file_type: string;
    metadata: Record<string, any>;
    created_at: string;
}

export interface UploadResponse {
    success: boolean;
    message: string;
    data: {
        file: UploadedFileResponse;
    };
}

export interface MultiUploadResponse {
    success: boolean;
    message: string;
    data: {
        uploaded: UploadedFileResponse[];
        failed: Array<{
            file_index: number;
            filename: string;
            error: string;
        }>;
        total: number;
        successful: number;
    };
}

export interface FileListResponse {
    success: boolean;
    data: {
        files: UploadedFileResponse[];
        pagination: {
            total: number;
            per_page: number;
            current_page: number;
            last_page: number;
        };
    };
}

class FileUploadService {
    private static readonly API_URL = '/api/v1/files';

    /**
     * Upload a single file
     */
    static async uploadFile(
        file: File,
        onProgress?: (progress: UploadProgress) => void,
        useCloudinary: boolean = true
    ): Promise<UploadedFileResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('use_cloudinary', useCloudinary ? '1' : '0');

        try {
            const response = await axios.post<UploadResponse>(
                `${this.API_URL}/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                        if (onProgress && progressEvent.total) {
                            const percentage = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            onProgress({
                                loaded: progressEvent.loaded,
                                total: progressEvent.total,
                                percentage,
                            });
                        }
                    },
                }
            );

            return response.data.data.file;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || 'File upload failed'
            );
        }
    }

    /**
     * Upload multiple files
     */
    static async uploadMultipleFiles(
        files: File[],
        onProgress?: (progress: UploadProgress) => void,
        useCloudinary: boolean = true
    ): Promise<MultiUploadResponse['data']> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files[]', file);
        });
        formData.append('use_cloudinary', useCloudinary ? '1' : '0');

        try {
            const response = await axios.post<MultiUploadResponse>(
                `${this.API_URL}/upload-multiple`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                        if (onProgress && progressEvent.total) {
                            const percentage = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            onProgress({
                                loaded: progressEvent.loaded,
                                total: progressEvent.total,
                                percentage,
                            });
                        }
                    },
                }
            );

            return response.data.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || 'Files upload failed'
            );
        }
    }

    /**
     * Get user's files
     */
    static async getFiles(
        page: number = 1,
        perPage: number = 15,
        fileType?: string
    ): Promise<FileListResponse['data']> {
        try {
            const params: any = { page, per_page: perPage };
            if (fileType) {
                params.file_type = fileType;
            }

            const response = await axios.get<FileListResponse>(this.API_URL, {
                params,
            });

            return response.data.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || 'Failed to fetch files'
            );
        }
    }

    /**
     * Get a specific file
     */
    static async getFile(id: string): Promise<UploadedFileResponse> {
        try {
            const response = await axios.get(`${this.API_URL}/${id}`);
            return response.data.data.file;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || 'Failed to fetch file'
            );
        }
    }

    /**
     * Delete a file
     */
    static async deleteFile(id: string): Promise<void> {
        try {
            await axios.delete(`${this.API_URL}/${id}`);
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || 'Failed to delete file'
            );
        }
    }

    /**
     * Validate file before upload
     */
    static validateFile(file: File): { valid: boolean; error?: string } {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
        ];

        if (file.size > maxSize) {
            return { valid: false, error: 'File size exceeds 10MB limit' };
        }

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Invalid file type. Allowed: JPG, PNG, GIF, WEBP, PDF',
            };
        }

        return { valid: true };
    }

    /**
     * Format file size
     */
    static formatFileSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size > 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    /**
     * Get file type from mime type
     */
    static getFileType(mimeType: string): string {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType === 'application/pdf') return 'document';
        return 'file';
    }
}

export default FileUploadService;
