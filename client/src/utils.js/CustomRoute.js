

const CustomRoute = (params) => {  
  
  return params.is_authenticated?params.logged_page:params.not_logged_page

}


export default CustomRoute;
