import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import checkIcon from "../../assets/images/check.svg";
import Error from "../../components/ui/Error";
import {
  conversationsApi,
  useAddConversationMutation,
  useUpdateConversationMutation,
} from "../../features/conversations/conversationsApi";
import { useGetUserQuery } from "../../features/users/usersApi";
import isValidEmail from "./../../utilities/isValidEmail";

export default function Modal({ open, control }) {
  // local states
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [requestApi, setRequestApi] = useState(false);
  const [showTick, setShowTick] = useState(false);
  const [responseError, setResponseError] = useState("");
  const [conversation, setConversation] = useState(undefined);

  //navigate function
  const navigate = useNavigate();
  const dispatch = useDispatch();
  //get loggedin user info
  const { user: loggedinUser } = useSelector((state) => state.auth) || {};

  const { email: loggedinEmail } = loggedinUser || {};

  //query receiver
  const { data: participant } = useGetUserQuery(receiver, {
    skip: !requestApi,
  });

  const [addConversation, { data: addedConversation, isSuccess: isAddSuccess }] = useAddConversationMutation();
  const [updateConversation, { data: updatedConversation, isSuccess: isUpdateSuccess }] =
    useUpdateConversationMutation();
  // debounce email search
  const debounceHandler = (fn, delay) => {
    let timeout;
    return (...args) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };

  //actual search function
  const doSearch = (value) => {
    setShowTick(false);
    if (isValidEmail(value)) {
      setReceiver(value);
      setRequestApi(true);
    }
  };
  const handleSearch = debounceHandler(doSearch, 700);

  // show status of user existence
  useEffect(() => {
    if (participant?.length && participant[0].email !== loggedinEmail) {
      setShowTick(true);
      //check conversation existence (manual dispatch)
      dispatch(
        conversationsApi.endpoints.getConversation.initiate(
          {
            userEmail: loggedinEmail,
            partnerEmail: participant[0].email,
          },
          {
            forceRefetch: true,
          }
        )
      )
        .unwrap()
        .then((data) => {
          setConversation(data);
        })
        .catch((err) => setResponseError("Error occured"));
    } else {
      setConversation(undefined);
    }
  }, [dispatch, loggedinEmail, participant]);

  // handle send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (conversation?.length > 0) {
      updateConversation({
        sender: loggedinEmail,
        id: conversation[0].id,
        data: {
          message,
          timestamp: new Date().getTime(),
          sender: loggedinEmail,
        },
      });
    } else if (conversation?.length === 0) {
      addConversation({
        sender: loggedinEmail,
        data: {
          participants: `${loggedinEmail}-${participant[0].email}`,
          users: [loggedinUser, participant[0]],
          message,
          timestamp: new Date().getTime(),
          sender: loggedinEmail,
        },
      });
    }
  };

  // controll modal
  useEffect(() => {
    if (isAddSuccess || isUpdateSuccess) {
      setShowTick(false);
      setMessage();
      control();
      if (isAddSuccess) {
        navigate(`/inbox/${addedConversation?.id}`);
      } else if (isUpdateSuccess) {
        navigate(`/inbox/${updatedConversation?.id}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddSuccess, isUpdateSuccess]);
  return (
    open && (
      <>
        <div onClick={control} className='fixed w-full h-full inset-0 z-10 bg-black/50 cursor-pointer'></div>
        <div className='rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2'>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>Send message</h2>

          <form className='mt-8 space-y-6' onSubmit={handleSendMessage}>
            <div className='rounded-md shadow-sm -space-y-px'>
              <div className='relative'>
                <label htmlFor='to' className='sr-only'>
                  To
                </label>
                <input
                  id='to'
                  name='to'
                  type='email'
                  required
                  className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm'
                  placeholder='Send to'
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {showTick && (
                  <img
                    className='absolute top-[50%] translate-y-[-50%] z-20 right-2 w-6'
                    src={checkIcon}
                    alt='check icon'
                  />
                )}
              </div>
              <div>
                <label htmlFor='message' className='sr-only'>
                  Message
                </label>
                <textarea
                  id='message'
                  name='message'
                  type='text'
                  required
                  className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm'
                  placeholder='Message'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                disabled={conversation === undefined || participant[0] === undefined}
                type='submit'
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 ${
                  conversation === undefined || participant[0] === undefined ? "cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                Send Message
              </button>
            </div>

            {participant?.length === 0 && <Error message='No user associeted with this email' />}
            {participant?.length > 0 && participant[0].email === loggedinEmail && (
              <Error message='You can not send message to yourself' />
            )}
            {responseError && <Error message={responseError} />}
          </form>
        </div>
      </>
    )
  );
}
