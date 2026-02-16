/**
 * Extrae el ID del video de una URL de YouTube.
 */
export const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;

    try {
        if (url.includes('youtu.be/')) {
            return url.split('youtu.be/')[1].split(/[?#]/)[0];
        } else if (url.includes('youtube.com/watch')) {
            const urlObj = new URL(url);
            return urlObj.searchParams.get('v');
        } else if (url.includes('youtube.com/shorts/')) {
            return url.split('shorts/')[1].split(/[?#]/)[0];
        } else if (url.includes('youtube.com/embed/')) {
            return url.split('embed/')[1].split(/[?#]/)[0];
        }
    } catch (e) {
        console.error('Error al extraer ID de YouTube:', e);
    }
    return null;
};

/**
 * Convierte una URL estándar de YouTube en una URL de tipo 'embed'.
 */
export const getYouTubeEmbedUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('/embed/')) return url;

    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

/**
 * Obtiene la URL de la miniatura de un vídeo de YouTube.
 */
export const getYouTubeThumbnailUrl = (url: string): string => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
        // Usamos hqdefault.jpg para asegurar que exista (maxresdefault a veces falla en videos viejos)
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return '';
};

/**
 * Extrae el ID del video de una URL de Rutube.
 */
export const getRutubeVideoId = (url: string): string | null => {
    if (!url) return null;

    try {
        // Formatos: 
        // rutube.ru/video/ID/
        // rutube.ru/play/embed/ID
        const rutubeRegex = /(?:rutube\.ru\/(?:video|play\/embed)\/)([a-zA-Z0-9]+)/;
        const match = url.match(rutubeRegex);
        return match ? match[1] : null;
    } catch (e) {
        console.error('Error al extraer ID de Rutube:', e);
    }
    return null;
};

/**
 * Convierte una URL estándar de Rutube en una URL de tipo 'embed'.
 */
export const getRutubeEmbedUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('/play/embed/')) return url;

    const videoId = getRutubeVideoId(url);
    return videoId ? `https://rutube.ru/play/embed/${videoId}` : url;
};

/**
 * Obtiene la URL de la miniatura de un vídeo de Rutube.
 */
export const getRutubeThumbnailUrl = (url: string): string => {
    const videoId = getRutubeVideoId(url);
    if (videoId) {
        // Usamos el endpoint oficial de Rutube que redirige a la imagen de previsualización
        return `https://rutube.ru/api/video/${videoId}/thumbnail/?redirect=1`;
    }
    return '';
};

/**
 * Función genérica para obtener la URL de embed detectando la plataforma.
 */
export const getVideoEmbedUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('rutube.ru')) {
        return getRutubeEmbedUrl(url);
    }
    return getYouTubeEmbedUrl(url);
};

/**
 * Función genérica para obtener la miniatura detectando la plataforma.
 */
export const getVideoThumbnailUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('rutube.ru')) {
        return getRutubeThumbnailUrl(url);
    }
    return getYouTubeThumbnailUrl(url);
};
