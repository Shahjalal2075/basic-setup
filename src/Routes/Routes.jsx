import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "../Pages/ErrorPage/ErrorPage";
import Root from "../Layouts/Root";
import Home from "../Pages/Home/Home";
import PrivateRoute from "./PrivateRoute";
import SignUp from "../Pages/SignUp/SignUp";
import SignIn from "../Pages/SignIn/SignIn";
import DashboardRoot from "../Layouts/DashboardRoot";
import Dashboard from "../Pages/Dashboard/Dashboard";
import Profile from "../Pages/Profile/Profile";
import Verify from "../Pages/Verify/Verify";
import Password from "../Pages/Password/Password";
import Bank from "../Pages/Bank/Bank";
import Policy from "../Pages/Policy/Policy";
import Help from "../Pages/Help/Help";
import CheckRoute from "./CheckRoute";
import Loan from "../Pages/Loan/Loan";
import LoanApply from "../Pages/LoanApply/LoanApply";
import LoanInfo from "../Pages/LoanInfo/LoanInfo";

const Routes = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>,
    errorElement: <ErrorPage></ErrorPage>,
    children: [
      {
        path: "/",
        element: <CheckRoute><Home></Home></CheckRoute>
      },
      {
        path: "/signup",
        element: <SignUp></SignUp>
      },
      {
        path: "/signin",
        element: <SignIn></SignIn>
      },
      {
        path: "/dashboard",
        element: <PrivateRoute><DashboardRoot></DashboardRoot></PrivateRoute>,
        errorElement: <ErrorPage></ErrorPage>,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard></Dashboard>
          },
          {
            path: "/dashboard/loan",
            element: <Loan></Loan>
          },
          {
            path: "/dashboard/loan/loan-info",
            element: <LoanInfo></LoanInfo>
          },
          {
            path: "/dashboard/loan/apply",
            element: <LoanApply></LoanApply>
          },
          {
            path: "/dashboard/profile",
            element: <Profile></Profile>
          },
          {
            path: "/dashboard/profile/verify",
            element: <Verify></Verify>
          },
          {
            path: "/dashboard/profile/password",
            element: <Password></Password>
          },
          {
            path: "/dashboard/profile/bank",
            element: <Bank></Bank>
          },
          {
            path: "/dashboard/profile/policy",
            element: <Policy></Policy>
          },
          {
            path: "/dashboard/profile/help",
            element: <Help></Help>
          },
        ]
      }
    ]
  },
]);

export default Routes;