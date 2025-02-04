import { apiSlice } from "./apiSlice";
import { BASE_URL,NOTES_URL, IMAGE_URL,AUDIO_URL } from "../constants";

export const notesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getAllNotes: builder.query({
      query: () => `${BASE_URL}${NOTES_URL}/all`,
    }),

    newNote: builder.mutation({
      query: (newNotes) => ({
        url: `${BASE_URL}${NOTES_URL}/new`,
        method: "POST",
        body: newNotes,
      }),
    }),

    updateNote: builder.mutation({
      query: ({ id, updatedNotes }) => ({
        url: `${BASE_URL}${NOTES_URL}/${id}`,
        method: "PUT",
        body: updatedNotes,
      }),
    }),


    deleteNote: builder.mutation({
      query: (id) => ({
        url: `${BASE_URL}${NOTES_URL}/${id}`,
        method: "DELETE",
      }),
    }),

    getSpecificNote: builder.query({
      query: (id) => `${BASE_URL}${NOTES_URL}/${id}`,
    }),

    getFavouriteNotes: builder.query({
      query: () => `${BASE_URL}${NOTES_URL}/fav`,
    }),

    uploadImage: builder.mutation({
      query: (formData) => ({
        url: `${BASE_URL}${IMAGE_URL}`,
        method: "POST",
        body: formData,
      }),
    }),

    uploadAudio: builder.mutation({
      query: (formData) => ({
        url: `${BASE_URL}${AUDIO_URL}`,
        method: "POST",
        body: formData,
      }),
    }),

   
  }),
});

export const{
  useGetAllNotesQuery,
  useDeleteNoteMutation,
  useGetSpecificNoteQuery,
  useNewNoteMutation,
  useUpdateNoteMutation,
  useGetFavouriteNotesQuery,
  useUploadImageMutation,
  useUploadAudioMutation,
 }=notesApiSlice;