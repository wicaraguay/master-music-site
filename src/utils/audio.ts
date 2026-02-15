/**
 * Extrae la URL original de un track de SoundCloud (limpia o desde un embed)
 */
export const getSoundCloudOriginalUrl = (url: string): string => {
    if (!url) return '';

    // 1. Limpieza básica y eliminación de caracteres invisibles/especiales
    let cleanUrl = url.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');

    // 2. Si es una URL de previsualización (iframe src), extraemos el parámetro 'url'
    if (cleanUrl.includes('w.soundcloud.com/player/')) {
        try {
            const urlObj = new URL(cleanUrl);
            const internalUrl = urlObj.searchParams.get('url');
            if (internalUrl) cleanUrl = internalUrl;
        } catch (e) {
            // Silently fail and keep as is
        }
    }

    // 3. Limpieza de parámetros de seguimiento (trackers)
    // PRESERVAMOS parámetros críticos como 'secret_token' para pistas privadas
    try {
        if (cleanUrl.includes('?')) {
            const [baseUrl, queryString] = cleanUrl.split('?');
            const params = new URLSearchParams(queryString);

            // Parámetros conocidos por causar ruidos o que son innecesarios
            const toRemove = ['si', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'in', 'ref'];
            toRemove.forEach(p => params.delete(p));

            const newQuery = params.toString();
            cleanUrl = newQuery ? `${baseUrl}?${newQuery}` : baseUrl;
        }
    } catch (e) {
        // Fallback: si algo falla, dejamos la URL como está
    }

    return cleanUrl;
};

export const getSoundCloudEmbedUrl = (url: string): string => {
    if (!url) return '';

    // Primero obtenemos la URL del track limpia
    const originalUrl = getSoundCloudOriginalUrl(url);

    // Si ya es una URL de API directa, la dejamos pasar
    if (originalUrl.includes('api.soundcloud.com/')) return originalUrl;

    // Construcción del widget oficial
    // Usamos visual=false para el modo clásico (onda visible y arte cuadrado)
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(originalUrl)}&color=%23eab308&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
};

/**
 * Intenta obtener una miniatura para SoundCloud (generalmente por defecto si no se tiene API)
 */
export const getSoundCloudThumbnail = (url: string): string => {
    // Para SoundCloud sin API, es difícil obtener la carátula dinámicamente sin un proxy o el widget.
    // Usaremos un icono o imagen por defecto para el audio.
    return '/images/audio-placeholder.webp';
};
