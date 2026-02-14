export const getSoundCloudEmbedUrl = (url: string): string => {
    if (!url) return '';

    // 1. Limpieza básica y eliminación de caracteres invisibles/especiales que vienen de copy-paste
    let cleanUrl = url.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');

    // 2. Si ya es una URL de previsualización (iframe src o similar), extraemos el parámetro 'url'
    if (cleanUrl.includes('w.soundcloud.com/player/')) {
        try {
            const urlObj = new URL(cleanUrl);
            const internalUrl = urlObj.searchParams.get('url');
            if (internalUrl) cleanUrl = internalUrl;
        } catch (e) {
            // Si falla el parseo, lo dejamos como está por si es una URL parcial
        }
    }

    // 3. Si ya es una URL de API directa, la dejamos pasar
    if (cleanUrl.includes('api.soundcloud.com/')) return cleanUrl;

    // 4. Limpieza inteligente de parámetros de seguimiento (trackers)
    // Pero PRESERVAMOS parámetros críticos como 'secret_token' para pistas privadas
    try {
        if (cleanUrl.includes('?')) {
            const [baseUrl, queryString] = cleanUrl.split('?');
            const params = new URLSearchParams(queryString);

            // Parámetros conocidos por causar ruidos o que son innecesarios para el widget
            const toRemove = ['si', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'in', 'ref'];
            toRemove.forEach(p => params.delete(p));

            const newQuery = params.toString();
            cleanUrl = newQuery ? `${baseUrl}?${newQuery}` : baseUrl;
        }
    } catch (e) {
        // Fallback: si algo falla con URLSearchParams, dejamos la URL como está (más seguro que romperla)
    }

    // 5. Construcción del widget oficial
    // Usamos visual=true por defecto, pero se puede ajustar si se prefiere el modo compacto
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(cleanUrl)}&color=%23eab308&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
};

/**
 * Intenta obtener una miniatura para SoundCloud (generalmente por defecto si no se tiene API)
 */
export const getSoundCloudThumbnail = (url: string): string => {
    // Para SoundCloud sin API, es difícil obtener la carátula dinámicamente sin un proxy o el widget.
    // Usaremos un icono o imagen por defecto para el audio.
    return '/images/audio-placeholder.webp';
};
