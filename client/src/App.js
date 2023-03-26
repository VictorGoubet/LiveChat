import React from 'react';
import Chat from './Chat/Chat';
import Cookies from 'js-cookie';
import Login from './Login/Login';
import SignUp from './SignUp/SignUp';
import CustomRoute from './utils.js/CustomRoute';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';


const checkCookie = async () =>{
  let cookie = Cookies.get('live-chat');
  if (!cookie){
    return false
  }
  cookie = JSON.parse(cookie)
  let res = await fetch('/api/checkCookie', {method:'POST',
                                            headers:{'Content-Type':'application/json'}, 
                                            body:JSON.stringify({username:cookie.username, accessToken:cookie.accessToken})});
  return res.status === 200?cookie:false;
}

function App() {

  const [userInfo, setUserInfo] = React.useState('loading');

  React.useEffect(() => {
    (async function() {
      const info = await checkCookie();
      setUserInfo(info);
    })();
  }, []);

  if(userInfo === 'loading') {
    return <div>Loading..</div>
  }

  return (
    <div className='app-container'>
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={<CustomRoute is_authenticated={typeof userInfo == 'object'} logged_page=<Chat userInfo={userInfo}/> not_logged_page=<Navigate to="/login"/>/>}/>
          <Route exact path='/signup' element={<CustomRoute is_authenticated={typeof userInfo == 'object'} logged_page=<Navigate to="/"/> not_logged_page=<SignUp />/>}/>
          <Route exact path='/login' element={<CustomRoute is_authenticated={typeof userInfo == 'object'} logged_page=<Navigate to="/"/> not_logged_page=<Login />/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}



export default App;
