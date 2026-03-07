import { NovelFormData, UploadCoverResponse } from "../types";

export const uploaderApi = {
  createNovel: async (data: NovelFormData): Promise<{ id: string }> => {
    const response = await fetch("/api/novels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  updateNovel: async (id: string, data: NovelFormData): Promise<void> => {
    const response = await fetch(`/api/novels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
  },

  getNovel: async (id: string): Promise<NovelFormData> => {
    const response = await fetch(`/api/novels/${id}`);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  uploadCover: async (file: File): Promise<UploadCoverResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload/cover", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
};
