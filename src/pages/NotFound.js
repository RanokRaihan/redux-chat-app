import React from "react";
import { Link } from "react-router-dom";
import sadIcon from "../assets/images/sad.svg";

const NotFound = () => {
  return (
    <div className='text-center min-h-screen flex items-center justify-center'>
      <div className='flex flex-col gap-4 items-center justify-center'>
        <img className='m-auto w-32' src={sadIcon} alt='Not found' />
        <h1 className='text-8xl'>404</h1>
        <h1 className='text-3xl'>Sorry, We couldn't find what you are looking for!</h1>

        <Link to='/'>
          <button className='hover:bg-neutral-600 bg-neutral-500 px-4 py-2 text-white rounded-md'>
            Go to Home Page
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
