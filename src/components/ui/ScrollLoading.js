import React from "react";

const ScrollLoading = () => {
  return (
    <div className='w-full p-4 flex items-center justify-center'>
      <div className='w-10 h-10'>
        <div role='status' className={`animate-spin w-10 h-10 border-4 border-black border-r-white rounded-full`}>
          <span className='sr-only'>Loading..</span>
        </div>
      </div>
    </div>
  );
};

export default ScrollLoading;
