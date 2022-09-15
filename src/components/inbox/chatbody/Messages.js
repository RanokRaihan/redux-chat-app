import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { messagesApi } from "../../../features/messages/messagesApi";
import ScrollLoading from "../../ui/ScrollLoading";
import Message from "./Message";

export default function Messages({ messages = [], totalCount }) {
  //get conversation id
  const { id } = useParams();

  //get loggedin user
  const { email: loggedinEmail } = useSelector((state) => state?.auth?.user) || {};

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
      dispatch(messagesApi.endpoints.getMoreMessages.initiate({ id, loggedinEmail, page }));
    }
  }, [dispatch, id, loggedinEmail, page]);

  useEffect(() => {
    if (totalCount > 0) {
      const more = Math.ceil(totalCount / Number(process.env.REACT_APP_MESSAGE_PER_PAGE)) > page;
      setHaseMore(more);
    }
  }, [page, totalCount]);

  return (
    <div className='relative w-full h-[calc(100vh_-_197px)]   overflow-y-auto flex flex-col-reverse'>
      <ul className='space-y-2 flex flex-col-reverse overflow-hidden '>
        <InfiniteScroll
          dataLength={messages.length}
          style={{ display: "flex", flexDirection: "column-reverse", padding: "10px" }} //To put endMessage and loader to the top.
          inverse={true}
          next={fetchMore}
          hasMore={haseMore}
          loader={<ScrollLoading />}
          height={window.innerHeight - 197}
        >
          {messages.map((message) => (
            <Message message={message} key={message.id} />
          ))}
        </InfiniteScroll>
      </ul>
    </div>
  );
}
