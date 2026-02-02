/**
 * Gera uma chave de idempotência usando SHA-256 a partir de valores concatenados
 * @param values - Valores a serem concatenados e hasheados
 * @returns String hash SHA-256 em formato hexadecimal
 */
export const generateIdempotencyKey = async (...values: string[]): Promise<string> => {
    const concatenatedString = values.join('|');
    
    // Use Web Crypto API for frontend compatibility
    const encoder = new TextEncoder();
    const data = encoder.encode(concatenatedString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
};

/**
 * Versão síncrona para compatibilidade com uso em headers
 * Usa um hash simples mas consistente
 */
export const generateIdempotencyKeySync = (...values: string[]): string => {
    const concatenatedString = values.join('|');
    
    let hash = 0;
    for (let i = 0; i < concatenatedString.length; i++) {
        const char = concatenatedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
};