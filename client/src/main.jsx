import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from './redux/store.js'
import { Provider } from 'react-redux'
import {Route,RouterProvider,createRoutesFromElements } from 'react-router'
import {createBrowserRouter} from 'react-router-dom'

import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'
import Home from './pages/users/Home.jsx'
import Favourites from './pages/users/Favourites.jsx'
import UserRoute from './components/UserRoutes.jsx'
import Dashboard from './pages/users/Dashboard.jsx'

const routes=createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} >
      <Route path='/login' element={<Login/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/' element={<Dashboard/>}/>
      <Route path='/home' element={<Home/>}/>
      <Route path='/fav' element={<Favourites/>}/>

      
      <Route  path='' element={<UserRoute/>}>
      
      </Route>


    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <RouterProvider router={routes} />
  </Provider>
)