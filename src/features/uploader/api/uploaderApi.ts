import { NovelFormData, ChapterFormData, UploadCoverResponse } from "../types";

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

  createChapter: async (
    novelId: string,
    data: ChapterFormData,
  ): Promise<{ id: string }> => {
    const response = await fetch(`/api/novels/${novelId}/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  updateChapter: async (id: string, data: ChapterFormData): Promise<void> => {
    const response = await fetch(`/api/chapters/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
  },

  getChapters: async (
    novelId: string,
  ): Promise<{ id: string; title: string; chapter_index: number }[]> => {
    const response = await fetch(`/api/novels/${novelId}/chapters`);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  getChapter: async (id: string): Promise<ChapterFormData> => {
    const response = await fetch(`/api/chapters/${id}`);
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
