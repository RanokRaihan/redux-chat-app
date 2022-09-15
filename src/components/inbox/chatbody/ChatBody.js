import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useGetMessagesQuery } from "../../../features/messages/messagesApi";

import Error from "../../ui/Error";
import ChatHead from "./ChatHead";
import Messages from "./Messages";
import Options from "./Options";

export default function ChatBody() {
  const { id } = useParams();
  const { email: loggedinEmail } = useSelector((state) => state?.auth.user);
  const { data, isLoading, isError, isSuccess } = useGetMessagesQuery({ id, loggedinEmail });
  const { data: messages, totalCount } = data || {};
  //decide what to render
  let content = null;
  if (isLoading) {
    content = <div>Loading...</div>;
  } else if (!isLoading && isError) {
    content = <Error message='Loading messages failed' />;
  } else if (isSuccess && messages?.length === 0) {
    content = <div>No Messaeges found</div>;
  } else if (isSuccess && messages?.length > 0) {
    content = (
      <>
        <ChatHead message={messages[0]} />
        <Messages messages={messages} totalCount={totalCount} />
        <Options />
      </>
    );
  }
  return (
    <div className='w-full lg:col-span-2 lg:block'>
      <div className='w-full grid conversation-row-grid'>{content}</div>
    </div>
  );
}
