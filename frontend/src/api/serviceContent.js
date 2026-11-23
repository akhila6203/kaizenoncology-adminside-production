import client from './client';

const serviceContentApi = {
  upload: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return client.post('/service-content/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // main services
  listServices: () => client.get('/service-content/services'),
  getService: (id) => client.get(`/service-content/services/${id}`),
  createService: (payload) => client.post('/service-content/services', payload),
  updateService: (id, payload) => client.put(`/service-content/services/${id}`, payload),
  deleteService: (id) => client.delete(`/service-content/services/${id}`),

  // service pages
  listPages: () => client.get('/service-content/pages'),
  getPage: (id) => client.get(`/service-content/pages/${id}`),
  createPage: (payload) => client.post('/service-content/pages', payload),
  updatePage: (id, payload) => client.put(`/service-content/pages/${id}`, payload),
  deletePage: (id) => client.delete(`/service-content/pages/${id}`),
};

export default serviceContentApi;