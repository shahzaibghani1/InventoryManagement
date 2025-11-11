import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "@material-tailwind/react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Sidebar from "./Sidebar.jsx";
import Customers from "./pages/Customers.jsx";
import Products from "./pages/Products.jsx";
import Stock from "./pages/Stock.jsx";
import Sales from "./pages/Sales.jsx";
import Reports from "./pages/Reports.jsx";

const Layout = () => (
  <>
    <div className="relative">
      <div className="absolute right-0 left-0 -z-10 h-16 flex justify-center items-center bg-mainColor text-[26px] font-bold text-white">
        Inventory Management System
      </div>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 pt-20">
          <Outlet />
        </div>
      </div>
    </div>
  </>
);

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/products", element: <Products /> },
      { path: "/stock", element: <Stock /> },
      { path: "/sales", element: <Sales /> },
      // { path: "/customers", element: <Customers /> },
      { path: "/reports", element: <Reports /> },
      { path: "*", element: <div>Page not found</div> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
