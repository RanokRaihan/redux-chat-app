import gravatarURL from "gravatar-url";
import moment from "moment";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { conversationsApi, useGetConversationsQuery } from "../../features/conversations/conversationsApi";
import getPartnerInfo from "../../utilities/getPartnerInfo";
import ConversationLoading from "../ui/ConversationLoading";
import Error from "../ui/Error";
import ScrollLoading from "../ui/ScrollLoading";
import Blank from "./Blank";
import ChatItem from "./ChatItem";

export default function ChatItems() {
  const { user } = useSelector((state) => state.auth);
  const { data, isSuccess, isLoading, isError, error } = useGetConversationsQuery(user?.email) || {};
  const { data: conversations, totalCount } = data || {};

  //dispatch
  const dispatch = useDispatch();
  //scrolling state
  const [page, setPage] = useState(1);
  const [haseMore, setHaseMore] = useState(true);
  // scroll function
  const fetchMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  //fetch more conversation
  useEffect(() => {
    if (page > 1) {
      dispatch(conversationsApi.endpoints.getMoreConversations.initiate({ email: user?.email, page }));
    }
  }, [dispatch, page, user]);

  useEffect(() => {
    if (totalCount > 0) {
      const more = Math.ceil(totalCount / Number(process.env.REACT_APP_CONVERSATION_PER_PAGE)) > page;
      setHaseMore(more);
    }
  }, [page, totalCount]);
  //decide what to render
  let content = null;
  if (isLoading) {
    content = (
      <li>
        <ConversationLoading />
        <ConversationLoading />
        <ConversationLoading />
      </li>
    );
  } else if (!isLoading && isError) {
    content = (
      <li>
        <Error message={error.data} />
      </li>
    );
  } else if (isSuccess && conversations?.length === 0) {
    content = <Blank />;
  } else if (isSuccess && conversations?.length > 0) {
    content = (
      <InfiniteScroll
        dataLength={conversations.length}
        next={fetchMore}
        hasMore={haseMore}
        loader={<ScrollLoading />}
        height={window.innerHeight - 129}
      >
        {conversations
          .slice()
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((conversation) => {
            const { id, message, users, timestamp, sender } = conversation;
            const partnar = getPartnerInfo(users, user.email);
            const { name, email } = partnar || {};
            return (
              <li key={id}>
                <Link to={`/inbox/${id}`}>
                  <ChatItem
                    avatar={gravatarURL(email, {
                      size: 80,
                    })}
                    sender={sender}
                    loggedinEmail={user.email}
                    name={name}
                    lastMessage={message}
                    lastTime={moment(timestamp).fromNow()}
                  />
                </Link>
              </li>
            );
          })}
      </InfiniteScroll>
    );
  }
  return <ul>{content}</ul>;
}
