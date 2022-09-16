/* eslint-disable eqeqeq */
import io from "socket.io-client";
import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "./../messages/messagesApi";

export const conversationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (email) =>
        `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATION_PER_PAGE}`,
      // modify the response
      transformResponse(apiResponse, meta) {
        const totalCount = meta.response.headers.get("X-Total-Count");

        return { data: apiResponse, totalCount };
      },
      async onCacheEntryAdded(arg, { updateCachedData, getCacheEntry, cacheDataLoaded, cacheEntryRemoved }) {
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

          //create a socket connection
          socket.on("conversation", (data) => {
            updateCachedData((draft) => {
              const conversation = draft.data.find((c) => c.id == data?.data?.id);
              if (conversation) {
                conversation.message = data?.data?.message;
                conversation.timestamp = data?.data?.timestamp;
                conversation.sender = data?.data?.sender;
              } else if (data?.data?.sender !== arg && data?.data?.participants.includes(arg)) {
                draft.data.push(data.data);
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
    getMoreConversations: builder.query({
      query: ({ email, page }) =>
        `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_CONVERSATION_PER_PAGE}`,
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          //update conversation cache pessimistically
          const conversations = await queryFulfilled;
          if (conversations?.data?.length > 0) {
            dispatch(
              apiSlice.util.updateQueryData("getConversations", arg.email, (draft) => {
                return {
                  data: [...draft.data, ...conversations.data],
                  totalCount: Number(draft.totalCount),
                };
              })
            );
          }
        } catch (error) {}
      },
    }),
    getConversation: builder.query({
      query: ({ userEmail, partnerEmail }) =>
        `/conversations?participants_like=${userEmail}-${partnerEmail}&participants_like=${partnerEmail}-${userEmail}`,
      providesTags: ["conversation"],
    }),

    updateConversation: builder.mutation({
      query: ({ sender, id, data }) => ({
        url: `/conversations/${id}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        //optimistic cache update
        const patchResult = dispatch(
          apiSlice.util.updateQueryData("getConversations", arg.sender, (draft) => {
            const draftConversation = draft.data.find((conversation) => conversation.id == arg.id);
            draftConversation.message = arg.data.message;
            draftConversation.timestamp = arg.data.timestamp;
            draftConversation.sender = arg.data.sender;
          })
        );

        try {
          const conversation = await queryFulfilled;

          if (conversation?.data?.id) {
            const { id, users, message, timestamp } = conversation.data;

            const res = await dispatch(
              messagesApi.endpoints.addMessage.initiate({
                conversationId: id,
                sender: users.find((user) => user.email === arg.sender),
                receiver: users.find((user) => user.email !== arg.sender),
                message: message,
                timestamp: timestamp,
              })
            ).unwrap();

            dispatch(
              apiSlice.util.updateQueryData(
                "getMessages",
                { id: res.conversationId.toString(), loggedinEmail: arg.sender },
                (draft) => {
                  draft.data.unshift(res);
                }
              )
            );
          }
        } catch (error) {
          patchResult.undo();
        }
      },
    }),

    addConversation: builder.mutation({
      query: ({ sender, data }) => ({
        url: `/conversations`,
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const conversation = await queryFulfilled;

          if (conversation?.data?.id) {
            dispatch(
              apiSlice.util.updateQueryData("getConversations", arg.sender, (draft) => {
                draft.data.push(conversation.data);
              })
            );

            const { id, users, message, timestamp } = conversation.data;
            const res = await dispatch(
              messagesApi.endpoints.addMessage.initiate({
                conversationId: id,
                sender: users.find((user) => user.email === arg.sender),
                receiver: users.find((user) => user.email !== arg.sender),
                message: message,
                timestamp: timestamp,
              })
            ).unwrap();
            // add data to cache
            dispatch(
              apiSlice.util.updateQueryData("getMessages", res.conversationId.toString(), (draft) => {
                draft.data.unshift(res);
              })
            );
          }
        } catch (error) {}
      },
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useUpdateConversationMutation,
  useAddConversationMutation,
} = conversationsApi;
