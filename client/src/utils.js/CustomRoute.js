import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie'

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


const CustomRoute = (params) => {

  const [state, setState] = useState('loading');

  useEffect(() => {
    (async function() {
      const isUserLogged = await checkCookie();
      setState(isUserLogged);
    })();
  }, []);

  if(state === 'loading') {
    return <div>Loading..</div>
  }
  
  if (typeof state === 'object'){
    params.setusername(state.username)
    return params.logged_page
  }
  else{
    return params.not_logged_page
  }
  
  
}


export default CustomRoute;
