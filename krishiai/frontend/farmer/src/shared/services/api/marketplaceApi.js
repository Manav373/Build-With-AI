import client from './client';

export const marketplaceApi = {
  // Farmer Crop Listings
  createListing: (payload) =>
    client.post('/api/v1/marketplace/listings', payload),

  getListings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return client.get(`/api/v1/marketplace/listings?${query}`);
  },

  getMyListings: () =>
    client.get('/api/v1/marketplace/farmer/my-listings'),

  // Vendor Placing Bids / Offers
  submitOffer: (listingId, payload) =>
    client.post(`/api/v1/marketplace/listings/${listingId}/offer`, payload),

  // Farmer Accepting Offer -> UnifiedOrder created
  acceptOffer: (offerId) =>
    client.post(`/api/v1/marketplace/offers/${offerId}/accept`, {}),
};

export default marketplaceApi;
