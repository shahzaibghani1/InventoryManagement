import React, { useState, useCallback, useEffect } from "react";
import { Button, Checkbox, Spinner } from "@material-tailwind/react";
import axios from "axios";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { Toast } from "../utils/Toast";
import { toast } from "react-toastify";

const Stock = () => {
  const [skuValue, setSkuValue] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [allStockData, setAllStockData] = useState([]);

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newStockData, setNewStockData] = useState({
    sku: 0,
    quantity: "",
    purchasePrice: "",
    pricePerKg: 0,
  });
  const [editStock, setEditStock] = useState(null);
  const [deleteStock, setDeleteStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkBox, setCheckBox] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshStock, setRefreshStock] = useState(false);

  const filteredAllStockData = allStockData.filter((s) =>
    (s.productName || "")
      .toLowerCase()
      .includes(searchQuery?.toLowerCase() || "")
  );

  const filteredStockData = stockData.filter((s) =>
    (s.productName || "")
      .toLowerCase()
      .includes(searchQuery?.toLowerCase() || "")
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stockResponseDetailed, stockResponse, skuResponse] =
          await Promise.all([
            axios.get(`${import.meta.env.VITE_BASE_URL}/api/getStockDetailed`),
            axios.get(`${import.meta.env.VITE_BASE_URL}/api/getStock`),
            axios.get(`${import.meta.env.VITE_BASE_URL}/api/getSKU`),
          ]);

        setStockData(stockResponseDetailed.data.data);
        setAllStockData(stockResponse.data.data);
        setSkuValue(skuResponse.data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshStock]);

  const calculatePricePerKg = useCallback((purchasePrice, quantity) => {
    if (purchasePrice > 0 && quantity > 0) {
      return parseFloat((purchasePrice / quantity).toFixed(2));
    }
    return 0;
  }, []);
  const dateFixed = useCallback((inputDate) => {
    const date = new Date(inputDate);
    const day = String(date.getDate()).padStart(2, "0"); // Ensures two digits for the day
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }, []);

  const convertToPakistanDate = (utcDateString) => {
    const date = new Date(utcDateString);
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Karachi",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }).format(date);
  };

  const handleOpenClose = useCallback(() => {
    setOpen(false);
    setNewStockData({
      sku: 0,
      quantity: "",
      purchasePrice: "",
      pricePerKg: 0,
    });
  }, []);

  const handleEditOpen = useCallback(
    (stock) => {
      setEditStock({
        ...stock,
        pricePerKg: calculatePricePerKg(stock.purchasePrice, stock.quantity),
      });
      setEditOpen(true);
    },
    [calculatePricePerKg]
  );

  const handleEditClose = useCallback(() => {
    setEditOpen(false);
    setEditStock(null);
  }, []);

  const handleOpenChange = useCallback(
    (field, value) => {
      setNewStockData((prev) => {
        const updatedData = { ...prev, [field]: value };
        return {
          ...updatedData,
          pricePerKg: calculatePricePerKg(
            updatedData.purchasePrice,
            updatedData.quantity
          ),
        };
      });
    },
    [calculatePricePerKg]
  );

  const handleEditChange = useCallback(
    (field, value) => {
      setEditStock((prev) => {
        const updatedStock = { ...prev, [field]: value };
        return {
          ...updatedStock,
          pricePerKg: calculatePricePerKg(
            updatedStock.purchasePrice,
            updatedStock.quantity
          ),
        };
      });
    },
    [calculatePricePerKg]
  );

  const handleEditSave = useCallback(async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/updateStock`,
        editStock
      );
      toast.success("Stock Updated Successfully");
    } catch (error) {
      console.log("Failed to update stock", error.message);
      toast.error("Error in updating the stock");
    }
    setRefreshStock((prev) => !prev);
    handleEditClose();
  }, [editStock, handleEditClose]);

  const handleDeleteOpen = useCallback((s) => {
    setDeleteStock(s);
    setDeleteOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/deleteStock/${deleteStock.stockId}`
      );
      toast.success(response?.data?.message);
    } catch (error) {
      console.log("Failed to delete stock", error.message);
      toast.error(error?.response?.data?.message);
    }
    setDeleteOpen(false);
    setDeleteStock(null);
    setRefreshStock((prev) => !prev);
  }, [deleteStock]);

  const handleAddStock = useCallback(async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/addStock`,
        newStockData
      );
      toast.success(response?.data?.message);
    } catch (error) {
      console.log("Failed to add stock", error.message);
      toast.error(error?.response?.data?.message);
    }
    setRefreshStock((prev) => !prev);
    handleOpenClose();
  }, [newStockData, stockData, handleOpenClose]);

  return (
    <>
      <Toast />
      <div className="m-5">
        <div className="flex justify-between">
          <Button
            onClick={() => setOpen(true)}
            className="shadow-none bg-mainColor text-white rounded-md text-lg normal-case"
          >
            Add New Stock
          </Button>

          <Checkbox
            label="Detailed Stocks"
            value={checkBox}
            color="blue"
            onChange={() => setCheckBox(!checkBox)}
          />
        </div>
        <div>
          <div className="mt-8 mb-2">
            <input
              type="text"
              placeholder="Search by product name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-2/5"
            />
          </div>
        </div>
        {checkBox == false && (
          <div className="overflow-x-auto">
            <table className="w-full mt-7">
              <thead>
                <tr>
                  <th className="p-2">S. No.</th>
                  <th className="p-2">SKU</th>
                  <th className="p-2">Product Name</th>
                  <th className="p-2">Quantity(Kg/Item)</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllStockData?.map((s, index) => (
                  <tr key={s.id}>
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{s.sku}</td>
                    <td className="p-2">{s.productName}</td>
                    <td className="p-2">{s.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {checkBox && (
          <div className="overflow-x-auto">
            <table className="w-full mt-7">
              <thead>
                <tr>
                  <th className="p-2">S. No.</th>
                  <th className="p-2">SKU</th>
                  <th className="p-2">Product Name</th>
                  <th className="p-2">Quantity</th>
                  <th className="p-2">Purchase Price</th>
                  <th className="p-2">Price Per Kg/Item</th>
                  <th className="p-2">Date Added</th>
                  <th className="p-2">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredStockData.map((s, index) => (
                  <tr key={s.id}>
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{s.sku}</td>
                    <td className="p-2">{s.productName}</td>
                    <td className="p-2">{s.quantity}</td>
                    <td className="p-2">{s.purchasePrice}</td>
                    <td className="p-2">
                      {calculatePricePerKg(s.purchasePrice, s.quantity)}
                    </td>
                    <td className="p-2">
                      {convertToPakistanDate(s.dateAdded)}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDeleteOpen(s)}
                        className="p-1"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={open} handler={handleOpenClose}>
          <DialogHeader className="flex justify-center">
            Add New Stock
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col justify-center gap-4">
              <div className="text-black text-xl flex items-center">
                <label className="">Product Name</label>
                <select
                  value={newStockData.sku}
                  onChange={(e) => handleOpenChange("sku", e.target.value)}
                  className="w-60 p-2 ml-[45px] border-2 border-black"
                >
                  <option value="">Select a Product</option>
                  {skuValue.map((s) => (
                    <option value={s.sku}>{s.productName}</option>
                  ))}
                </select>
              </div>
              <div className="text-black text-xl flex items-center">
                <label className="">Quantity(kg/Item)</label>
                <input
                  type="number"
                  min={1}
                  value={newStockData.quantity}
                  onChange={(e) => handleOpenChange("quantity", e.target.value)}
                  className="w-28 p-2 ml-[22px] border-2 border-black"
                />
              </div>
              <div className="text-black text-xl flex items-center">
                <label className="">Purchase Price</label>
                <input
                  type="number"
                  value={newStockData.purchasePrice}
                  onChange={(e) =>
                    handleOpenChange("purchasePrice", e.target.value)
                  }
                  className="w-28 p-2 ml-10 border-2 border-black"
                />
              </div>
              <div className="text-black text-xl flex items-center">
                <label className="">Price Per Kg/Item</label>
                <input
                  value={newStockData.pricePerKg}
                  type="text"
                  disabled
                  className="w-28 p-2 ml-[18px] border-2 border-black"
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={handleOpenClose}
              className="mr-1 text-sm"
            >
              <span>Cancel</span>
            </Button>
            <Button
              className="text-sm"
              variant="gradient"
              color="green"
              onClick={handleAddStock}
            >
              <span>Confirm</span>
            </Button>
          </DialogFooter>
        </Dialog>

        <Dialog open={editOpen} handler={handleEditClose}>
          <DialogHeader className="flex justify-center">
            Edit Stock
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col justify-center gap-4">
              <div className="text-black text-xl flex items-center">
                <label className="">Product SKU</label>
                <input
                  id="sku"
                  type="number"
                  value={editStock?.sku || 0}
                  disabled
                  onChange={(e) => handleEditChange("sku", e.target.value)}
                  className="w-28 p-2 ml-[60px] border-2 border-black"
                />
              </div>
              <div className="text-black text-xl flex items-center">
                <label className="">Quantity(kg/Item)</label>
                <input
                  type="number"
                  value={editStock?.quantity || 0}
                  onChange={(e) => handleEditChange("quantity", e.target.value)}
                  className="w-28 p-2 ml-[22px] border-2 border-black"
                />
              </div>
              <div className="text-black text-xl flex items-center">
                <label className="">Purchase Price</label>
                <input
                  type="number"
                  value={editStock?.purchasePrice || 0}
                  onChange={(e) =>
                    handleEditChange("purchasePrice", e.target.value)
                  }
                  className="w-28 p-2 ml-10 border-2 border-black"
                />
              </div>
              <div className="text-black text-xl flex items-center">
                <label className="">Price Per Kg/Item</label>
                <input
                  value={editStock?.pricePerKg || 0}
                  type="text"
                  disabled
                  className="w-28 p-2 ml-[18px] border-2 border-black"
                />
              </div>
              <div className="text-black text-xl flex items-center">
                <label className="">Date Added</label>
                <input
                  value={editStock?.dateAdded || 0}
                  type="date"
                  className="w-40 p-2 ml-[68px] border-2 border-black"
                  onChange={(e) =>
                    handleEditChange("dateAdded", e.target.value)
                  }
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={handleEditClose}
              className="mr-1 text-sm"
            >
              <span>Cancel</span>
            </Button>
            <Button
              className="text-sm"
              variant="gradient"
              color="green"
              onClick={handleEditSave}
            >
              <span>Confirm</span>
            </Button>
          </DialogFooter>
        </Dialog>

        <Dialog open={deleteOpen} handler={() => setDeleteOpen(false)}>
          <DialogHeader className="flex justify-center">
            Delete Stock
          </DialogHeader>
          <DialogBody>
            Are you sure you want to delete this stock item?
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={() => setDeleteOpen(false)}
              className="mr-1 text-sm"
            >
              <span>Cancel</span>
            </Button>
            <Button
              className="text-sm"
              variant="gradient"
              color="green"
              onClick={handleDelete}
            >
              <span>Confirm</span>
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </>
  );
};

export default Stock;
