import https from 'https';

const geocodeCache = new Map();

/**
 * Perform a GET request to Nominatim API
 * @param {string} url 
 * @returns {Promise<any>}
 */
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'DesiKit-Delivery-Fee-Calculator/1.0 (ishuy066@gmail.com)'
            }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error("Failed to parse geocoding response"));
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Geocode address to lat/lon coordinates
 * @param {string} addressString 
 * @returns {Promise<{lat: number, lon: number}|null>}
 */
export async function geocodeAddress(addressString) {
    if (!addressString) return null;
    const cleanAddress = addressString.trim();
    if (geocodeCache.has(cleanAddress)) {
        return geocodeCache.get(cleanAddress);
    }

    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanAddress)}&format=json&limit=1`;
        const results = await fetchJson(url);
        if (results && results.length > 0) {
            const coords = {
                lat: parseFloat(results[0].lat),
                lon: parseFloat(results[0].lon)
            };
            geocodeCache.set(cleanAddress, coords);
            return coords;
        }
    } catch (error) {
        console.error(`Geocoding failed for "${cleanAddress}":`, error.message);
    }
    return null;
}

/**
 * Calculate Haversine distance in kilometers
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number}
 */
export function getHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
