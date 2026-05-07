const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COMPACT_UUID_PATTERN = /^[0-9a-f]{32}$/i;
const ROUTE_ID_PATTERN = /^p([0-9a-z]{20,26})$/i;

const formatUuid = (hex) => [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20)
].join('-');

const base36ToBigInt = (value) => {
    let result = BigInt(0);
    const radix = BigInt(36);

    for (const char of value.toLowerCase()) {
        const code = char.charCodeAt(0);
        const digit = code >= 48 && code <= 57
            ? code - 48
            : code >= 97 && code <= 122
                ? code - 87
                : -1;

        if (digit < 0 || digit >= 36) return null;
        result = result * radix + BigInt(digit);
    }

    return result;
};

const encodePostRouteId = (uuid) => {
    if (!uuid) return null;
    const compact = String(uuid).replace(/-/g, '').toLowerCase();
    if (!COMPACT_UUID_PATTERN.test(compact)) return null;
    return `p${BigInt(`0x${compact}`).toString(36)}`;
};

const decodePostRouteId = (routeId) => {
    if (!routeId || UUID_PATTERN.test(routeId)) return UUID_PATTERN.test(routeId || '') ? routeId : null;

    const match = ROUTE_ID_PATTERN.exec(String(routeId));
    if (!match) return null;

    const numeric = base36ToBigInt(match[1]);
    if (numeric === null) return null;

    const hex = numeric.toString(16).padStart(32, '0');
    if (!COMPACT_UUID_PATTERN.test(hex) || hex.length > 32) return null;
    return formatUuid(hex);
};

module.exports = {
    encodePostRouteId,
    decodePostRouteId
};
