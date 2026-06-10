export function buildPhoneHref(phone) {
  if (!phone) return null;

  const normalizedPhone = phone.replace(/[^\d+]/g, '');
  return normalizedPhone ? `tel:${normalizedPhone}` : null;
}

export function buildGoogleMapsHref(address, mapsUrl) {
  if (mapsUrl) return mapsUrl;
  if (!address) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
