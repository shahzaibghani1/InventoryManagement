import { useState } from "react";
import { Button } from "@material-tailwind/react";
import salesIcon from "./svgs/sales1.svg";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import {
  BrowserRouter,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
function App() {
  return (
    <>
    
      {/* <div className="bg-mainColor w-screen h-16 fixed flex justify-center items-center text-white text-2xl font-bold">
        Inventory Management System
      </div>
      <div className="fixed h-screen border-mainColor border-r-[2px]">
        <Sidebar
          className="text-[23px] h-full sticky"
          collapsed={collapse}
          backgroundColor="white"
          width={collapse ? "80px" : "250px"}
        >
          <Button
            className="bg-transparent text-black text-3xl shadow-none my-[7px]"
            onClick={() => {
              setCollapse(!collapse);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.0}
              stroke="currentColor"
              className="size-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
              />
            </svg>
          </Button>
          <Menu className="hover:bg-white">
            <MenuItem
              className=" border-mainColor py-2"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                  />
                </svg>
              }
            >
              <h1 className="mx-3">Sales</h1>
            </MenuItem>
            <MenuItem icon={<img src={salesIcon} className="w-7 h-7" />}>
              Products
            </MenuItem>
            <MenuItem
              className=" border-mainColor py-2 "
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
              }
            >
              <p className="mx-3">Stock</p>
            </MenuItem>
          </Menu>
        </Sidebar>
      </div> */}
      {/* <div className="">
        <h1 className="text-center text-white">Hello World</h1>
      </div> */}
    </>
  );
}

export default App;
