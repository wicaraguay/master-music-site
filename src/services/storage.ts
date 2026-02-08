import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Upload a file to Firebase Storage
 * @param file - File object to upload
 * @param path - Storage path (e.g., 'images/blog/', 'images/gallery/')
 * @returns Promise with download URL
 */
export const uploadToStorage = async (file: File, path: string): Promise<string> => {
    try {
        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}_${sanitizedName}`;
        const fullPath = `${path}${fileName}`;

        // Create storage reference
        const storageRef = ref(storage, fullPath);

        // Upload file
        const snapshot = await uploadBytes(storageRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file');
    }
};

/**
 * Delete a file from Firebase Storage
 * @param url - Full download URL of the file
 */
export const deleteFromStorage = async (url: string): Promise<void> => {
    try {
        // Extract path from URL
        const baseUrl = 'https://firebasestorage.googleapis.com';
        if (!url.startsWith(baseUrl)) {
            console.warn('Not a Firebase Storage URL, skipping delete');
            return;
        }

        // Parse the storage path from URL
        const pathStart = url.indexOf('/o/') + 3;
        const pathEnd = url.indexOf('?');
        const encodedPath = url.substring(pathStart, pathEnd);
        const filePath = decodeURIComponent(encodedPath);

        const storageRef = ref(storage, filePath);
        await deleteObject(storageRef);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw new Error('Failed to delete file');
    }
};

/**
 * Upload multiple files
 * @param files - Array of File objects
 * @param path - Storage path
 * @returns Promise with array of download URLs
 */
export const uploadMultipleToStorage = async (files: File[], path: string): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadToStorage(file, path));
    return Promise.all(uploadPromises);
};
