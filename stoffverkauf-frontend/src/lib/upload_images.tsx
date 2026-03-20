import api from "../../api";
import axios from "axios";
import { toast } from "sonner";

export const uploadFiles = async (files: File[]) => {
  try {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file); // must match backend field name
    });

    const res = await api.post("api/upload/upload-files", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.urls; // array of uploaded URLs

  } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // Axios error
        toast.error(
          err.response?.data?.errors?.[0] ||
          err.response?.data?.message ||
          "Server error"
        );
      } else {
        // Non-Axios / unknown error
        toast.error("An unexpected error occurred");
        console.error(err);
      }
    };
};