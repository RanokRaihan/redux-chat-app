/* eslint-disable eqeqeq */
import { io } from "socket.io-client";
import { apiSlice } from "../api/apiSlice";

export const messagesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query({
      query: ({ id, loggedinEmail }) =>
        `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGE_PER_PAGE}`,
      //modify response with response header
      transformResponse(apiResponse, meta) {
        const totalCount = meta.response.headers.get("X-Total-Count");

        return { data: apiResponse, totalCount };
      },

      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        //create socket
        const socket = io(process.env.REACT_APP_BASE_URL, {
          //
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 10,
          transports: ["websocket"],
          agent: false,
          upgrade: false,
          rejectUnauthorized: false,
        });

        try {
          await cacheDataLoaded;
          // create a socket connection
          socket.on("message", (data) => {
            updateCachedData((draft) => {
              if (data?.data?.conversationId == arg.id && data?.data?.receiver?.email === arg.loggedinEmail) {
                draft.data.unshift(data?.data);
              }
            });
          });
          //close the socket after unmount
          await cacheEntryRemoved;
          socket.close();
        } catch (error) {
          //do nothing
        }
      },
    }),
    getMoreMessages: builder.query({
      query: ({ id, loggedinEmail, page }) =>
        `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_MESSAGE_PER_PAGE}`,
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          //update conversation cache pessimistically
          const messages = await queryFulfilled;
          if (messages?.data?.length > 0) {
            dispatch(
              apiSlice.util.updateQueryData(
                "getMessages",
                { id: arg.id, loggedinEmail: arg.loggedinEmail },
                (draft) => {
                  return {
                    data: [...draft.data, ...messages.data],
                    totalCount: Number(draft.totalCount),
                  };
                }
              )
            );
          }
        } catch (error) {}
      },
    }),

    addMessage: builder.mutation({
      query: (message) => ({
        url: `/messages`,
        method: "POST",
        body: message,
      }),
    }),
  }),
});

export const { useGetMessagesQuery, useAddMessageMutation } = messagesApi;
