import React from 'react';
import Chat from './Chat/Chat';
import Login from './Login/Login';
import SignUp from './SignUp/SignUp';
import CustomRoute from './utils.js/CustomRoute';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {

  const [username, setusername] = React.useState(null)
  
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={<CustomRoute setusername={setusername} logged_page=<Chat username={username}/> not_logged_page=<Navigate to="/login"/>/>}/>
          <Route exact path='/signup' element={<CustomRoute setusername={setusername} logged_page=<Navigate to="/"/> not_logged_page=<SignUp />/>}/>
          <Route exact path='/login' element={<CustomRoute setusername={setusername} logged_page=<Navigate to="/"/> not_logged_page=<Login />/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
