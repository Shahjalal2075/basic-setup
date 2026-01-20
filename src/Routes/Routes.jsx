import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "../Pages/ErrorPage/ErrorPage";
import Root from "../Layouts/Root";
import Home from "../Pages/Home/Home";
import PrivateRoute from "./PrivateRoute";
import SignUp from "../Pages/SignUp/SignUp";
import SignIn from "../Pages/SignIn/SignIn";
import DashboardRoot from "../Layouts/DashboardRoot";
import Dashboard from "../Pages/Dashboard/Dashboard";

const Routes = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>,
    errorElement: <ErrorPage></ErrorPage>,
    children: [
      {
        path: "/",
        element: <PrivateRoute><Home></Home></PrivateRoute>
      },
      {
        path: "/signup",
        element: <PrivateRoute><SignUp></SignUp></PrivateRoute>
      },
      {
        path: "/signin",
        element: <PrivateRoute><SignIn></SignIn></PrivateRoute>
      },
      {
        path: "/dashboard",
        element: <DashboardRoot></DashboardRoot>,
        errorElement: <ErrorPage></ErrorPage>,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard></Dashboard>
          },
        ]
      }
    ]
  },
]);

export default Routes;