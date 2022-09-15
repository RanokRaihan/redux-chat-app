import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import logoImage from "../../assets/images/lws-logo-dark.svg";
import { userLoggedOut } from "../../features/auth/authSlice";
import useAuth from "../../hooks/useAuth";

export default function Navigation() {
  const isLoggedIn = useAuth();
  const dispatch = useDispatch();
  const { name } = useSelector((state) => state?.auth?.user);

  const handleLogOut = () => {
    dispatch(userLoggedOut());
    localStorage.removeItem("auth");
  };
  return (
    <nav className='border-general sticky top-0 z-40 border-b bg-violet-700 transition-colors'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between h-16 items-center'>
          <Link to='/'>
            <img className='h-10' src={logoImage} alt='Learn with Sumit' />
          </Link>
          <ul className='flex gap-2 items-center justify center mr-2'>
            <li className='text-neutral-100'>{name}</li>
            <li>
              {isLoggedIn ? (
                <button
                  className='text-white text-lg bg-orange-600 cursor-pointer rounded-md px-4 py-2'
                  onClick={handleLogOut}
                >
                  Logout
                </button>
              ) : (
                <Link to='/'>Login</Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
