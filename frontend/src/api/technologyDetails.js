import client from './client';


const technologyDetailsApi = {
  // technology records
  list: () => client.get('/technology-details'),
  getItem: (id) => client.get(`/technology-details/item/${id}`),
  createItem: (payload) => client.post('/technology-details/item', payload),
  updateItem: (id, payload) => client.put(`/technology-details/item/${id}`, payload),
  deleteItem: (id) => client.delete(`/technology-details/item/${id}`),

  // sections + faqs
  get: (id) => client.get(`/technology-details/${id}`),
  save: (id, payload) => client.put(`/technology-details/${id}`, payload),

  upload: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return client.post('/technology-details/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default technologyDetailsApi;