import { useSelector } from "react-redux";

export default function Message({ message }) {
  const { sender, message: messageBody } = message;
  const { user } = useSelector((state) => state.auth);
  const justify = sender?.email === user?.email ? "end" : "start";

  return (
    <li className={`flex justify-${justify}`}>
      <div className='relative max-w-xl px-4 py-2 text-gray-700 rounded shadow'>
        <span className='block'>{messageBody}</span>
      </div>
    </li>
  );
}
