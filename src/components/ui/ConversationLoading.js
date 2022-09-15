import React from "react";

const ConversationLoading = () => {
  return (
    <div className='flex items-center px-3 py-2 text-sm animate-pulse'>
      <div className='w-10 h-10'>
        <div className=' w-10 h-10 rounded-full bg-neutral-200'></div>
      </div>

      <div className='w-full pb-2 hidden md:block'>
        <div className='flex justify-between'>
          <span className='block ml-2 font-semibold text-neutral-200 bg-neutral-200'>chat perticipant name </span>
          <span className='block ml-2 text-sm text-neutral-200 bg-neutral-200'>last time</span>
        </div>
        <span className=' inline-block ml-2 mt-1 text-sm text-neutral-200 bg-neutral-200'> last message</span>
      </div>
    </div>
  );
};

export default ConversationLoading;
