
import api from "./client";

export const getAdminSlides = () => {
  return api.get("/home-sliders");
};

export const createSlide = (data) => {
  return api.post("/home-sliders", data);
};

export const updateSlide = (id, data) => {
  return api.put(`/home-sliders/${id}`, data);
};

export const deleteSlide = (id) => {
  return api.delete(`/home-sliders/${id}`);
};

// Home page public API
export const getPublicSlides = () => {
  return api.get("/home-sliders/public");
};