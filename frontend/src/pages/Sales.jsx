import { useState, useCallback, useEffect, useRef } from "react";
import { button, Button } from "@material-tailwind/react";
import axios from "axios";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { Trash2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import { Toast } from "../utils/Toast";

const Sales = () => {
  const [salesData, setSalesData] = useState([]);
  const [skuValue, setSkuValue] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [name, setName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [newSale, setNewSale] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentProduct, setCurrentProduct] = useState({
    sku: "",
    productName: "",
    saleQuantity: "",
    unitPrice: "",
    price: "",
  });
  const [totalPurchasePrice, setTotalPurchasePrice] = useState(0);
  const [deleteSale, setDeleteSale] = useState(null);
  const [viewSale, setViewSale] = useState(null);
  const [payment, setPayment] = useState("");

  const [change, setChange] = useState(0);

  const convertToPakistanDate = (utcDateString) => {
    const date = new Date(utcDateString);
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Karachi",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }).format(date);
  };

  const convertToPakistanTime = (utcDateString) => {
    const date = new Date(utcDateString);
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Karachi",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
      .format(date)
      .replaceAll(" ", "");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [saleData, skuResponse] = await Promise.all([
          axios.get("http://localhost:3000/api/v2/getSale"),
          axios.get("http://localhost:3000/api/getSKU"),
        ]);
        setSalesData(saleData.data.data);
        setSkuValue(skuResponse.data.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  const filteredSalesData = salesData.filter((sale) => {
    const search = searchTerm.toLowerCase();
    return (
      sale.saleId.toString().includes(search) ||
      sale.name?.toLowerCase().includes(search)
      // sale.phoneNo?.toString().includes(search)
    );
  });
  const handleAddSale = useCallback(async () => {
    console.log(payment);
    console.log(change);

    try {
      const saleData = {
        name,
        phoneNo,
        saleItems: newSale,
        saleTotal: Number(totalPurchasePrice.toFixed(2)),
        saleDate: new Date(),
        payment: Number(payment) || 0,
        change: Number(change) || 0,
      };
      const response = await axios.post(
        "http://localhost:3000/api/v2/addSale",
        saleData
      );
      toast.success(response?.data?.msg);

      handleOpenClose();
    } catch (error) {
      console.log("Failed to add Sale", error.message);
      toast.error(error?.response?.data?.msg);
    }
    setRefreshTrigger((prev) => prev + 1);
  }, [newSale, name, phoneNo, totalPurchasePrice, payment, change]);

  const handleDelete = useCallback(async () => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/v2/deleteSale/${deleteSale.saleId}`
      );
      toast.success(response?.data?.msg);
    } catch (error) {
      console.log("Failed to delete Sale", error.message);
      toast.error(error?.response?.data?.msg);
    }
    setRefreshTrigger((prev) => prev + 1); 
    setDeleteOpen(false);
    setDeleteSale(null);
  }, [deleteSale]);

  const handleProductChange = useCallback(
    (field, value) => {
      setCurrentProduct((prev) => ({ ...prev, [field]: value }));

      if (field === "productName") {
        const selected = skuValue.find((s) => s.productName === value);
        if (selected) {
          setCurrentProduct({
            sku: selected.sku,
            productName: selected.productName,
            unitPrice: selected.sellingPrice,
            saleQuantity: "",
            price: "",
          });
        }
      }
    },
    [skuValue]
  );

  const handleQuantityChange = useCallback(
    (value) => {
      const quantity = parseFloat(value);

      // Prevent negative or zero values
      if (isNaN(quantity) || quantity <= 0) {
        setCurrentProduct((prev) => ({
          ...prev,
          saleQuantity: "",
          price: "",
        }));
        return;
      }

      const price = quantity * parseFloat(currentProduct.unitPrice || "0");
      setCurrentProduct((prev) => ({
        ...prev,
        saleQuantity: value,
        price: price.toFixed(2),
      }));
    },
    [currentProduct.unitPrice]
  );

  const handlePriceChange = useCallback(
    (value) => {
      const price = parseFloat(value);
      const quantity = price / parseFloat(currentProduct.unitPrice || 1);
      setCurrentProduct((prev) => ({
        ...prev,
        price: value,
        saleQuantity: isNaN(quantity) ? "" : quantity.toFixed(2),
      }));
    },
    [currentProduct.unitPrice]
  );

  const handleAddProduct = useCallback(() => {
    if (
      currentProduct.productName &&
      currentProduct.saleQuantity &&
      currentProduct.price
    ) {
      setNewSale((prev) => [...prev, { ...currentProduct, id: Date.now() }]);
      setTotalPurchasePrice((prev) => prev + parseFloat(currentProduct.price));
      setCurrentProduct({
        sku: "",
        productName: "",
        saleQuantity: "",
        unitPrice: "",
        price: "",
      });
    }
  }, [currentProduct]);

  const handleRemoveProduct = useCallback((id) => {
    setNewSale((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      const newTotal = updated.reduce((sum, p) => sum + parseFloat(p.price), 0);
      setTotalPurchasePrice(newTotal);
      return updated;
    });
  }, []);

  const handleOpenClose = useCallback(() => {
    setOpen(false);
    setPayment("");
    setNewSale([]);
    setName("");
    setPhoneNo("");
    setTotalPurchasePrice(0);
    setCurrentProduct({
      sku: "",
      productName: "",
      saleQuantity: "",
      unitPrice: "",
      price: "",
    });
  }, []);

  const handleViewOpen = useCallback((sale) => {
    setViewSale(sale);
    setViewOpen(true);
  }, []);

  const handleViewClose = useCallback(() => {
    setViewSale(null);
    setViewOpen(false);
  }, []);

  const handleDeleteOpen = useCallback((sale) => {
    setDeleteSale(sale);
    setDeleteOpen(true);
  }, []);

  const dateFixed = useCallback((inputDate) => {
    const date = new Date(inputDate);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
  }, []);
  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const handlePaymentChange = useCallback(
    (value) => {
      // value comes as string from input
      if (value === "" || value === null) {
        setPayment("");
        setChange(0);
        return;
      }

      const numPayment = parseFloat(value);
      const total = parseFloat(totalPurchasePrice.toString());

      setPayment(value);

      if (isNaN(numPayment) || isNaN(total)) {
        setChange(0);
        return;
      }

      // Calculate change safely (never negative)
      const c = Math.max(0, numPayment - total);
      setChange(c);
    },
    [totalPurchasePrice]
  );

  return (
    <>
      <Toast />
      <div className="m-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Button
            onClick={() => setOpen(true)}
            className="shadow-none bg-mainColor text-white rounded-md text-lg normal-case hover:transition-colors"
          >
            Generate New Sale
          </Button>
          <input
            type="text"
            placeholder="Search by ID, Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-2/5"
          />
        </div>

        <div className="overflow-x-auto mt-8">
          <table className="w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-center">Sale ID</th>
                <th className="p-3 text-center">Customer Name</th>
                <th className="p-3 text-center">Phone No</th>
                <th className="p-3 text-center">Sale Items</th>
                <th className="p-3 text-center">Total Price</th>
                <th className="p-3 text-center">Date Of Sale</th>
                <th className="p-3 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalesData.map((p, index) => (
                <tr key={p.saleId} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-center">{p.saleId}</td>
                  <td className="p-3 text-center">{p.name}</td>
                  <td className="p-3 text-center">{p.phoneNo}</td>
                  <td
                    className="p-3 text-center font-semibold cursor-pointer underline"
                    onClick={() => handleViewOpen(p)}
                  >
                    View
                  </td>
                  <td className="p-3 text-center">{p.saleTotal}</td>
                  <td className="p-3 text-center">{dateFixed(p.saleDate)}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleDeleteOpen(p)} className="p-1">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSalesData.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center p-4 text-gray-500">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Dialog
        open={open}
        handler={handleOpenClose}
        size="xxl"
        className="min-w-[80vw]"
      >
        <DialogHeader className="flex justify-center text-2xl font-bold text-mainColor">
          New Sale
        </DialogHeader>
        <DialogBody divider className="flex h-[75vh]">
          <div className="w-1/2 pr-4 border-r overflow-scroll">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-md font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="phoneNo"
                  className="block text-md font-medium text-gray-700"
                >
                  Phone No
                </label>
                <input
                  type="text"
                  id="phoneNo"
                  value={phoneNo}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => setPhoneNo(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="productName"
                  className="block text-md font-medium pt-3 pb-2 text-gray-700"
                >
                  Product Name
                </label>
                <select
                  id="productName"
                  value={currentProduct.productName}
                  onChange={(e) =>
                    handleProductChange("productName", e.target.value)
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a product</option>
                  {skuValue.map((s) => (
                    <option key={s.sku} value={s.productName}>
                      {s.productName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="unitPrice"
                  className="block text-md font-medium text-gray-700"
                >
                  Unit Price
                </label>
                <input
                  type="text"
                  id="unitPrice"
                  value={currentProduct.unitPrice}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                />
              </div>
              <div>
                <label
                  htmlFor="saleQuantity"
                  className="block text-md font-medium text-gray-700"
                >
                  Quantity (kg/Item)
                </label>
                <input
                  type="number"
                  id="saleQuantity"
                  value={currentProduct.saleQuantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block text-md font-medium text-gray-700"
                >
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  value={currentProduct.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <Button
                onClick={handleAddProduct}
                className="w-full bg-mainColor hover:opacity-80 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Add Product
              </Button>
            </div>
          </div>

          <div className="w-1/2 pl-4 overflow-y-auto">
            <h3 className="text-xl text-center font-semibold mb-4">
              Sale Receipt
            </h3>
            <div className="flex justify-between">
              <div className="font-semibold ml-2">Name: {name}</div>
              <div className="font-semibold mr-12">Contact: {phoneNo}</div>
            </div>
            <table className="my-2">
              <thead>
                <tr>
                  <th className="border-none pr-5 w-48 text-left">
                    Product Name
                  </th>
                  <th className="border-none pr-5 w-24 text-left">Qty</th>
                  <th className="border-none pr-5 w-36 text-left">Rate</th>
                  <th className="border-none pr-8 text-left w-40">Amount</th>
                </tr>
              </thead>
            </table>
            {newSale.length > 0 ? (
              <div>
                <div className="space-y-4 my-2">
                  {newSale.map((product) => (
                    <table className="w-full" key={product.id}>
                      <tbody>
                        <tr>
                          <td className="border-none text-left w-48 ">
                            {product.productName}
                          </td>
                          <td className="border-none  text-left w-24">
                            {product.saleQuantity}
                          </td>
                          <td className="border-none text-left w-36">
                            {product.unitPrice}
                          </td>
                          <td className="border-none  text-left">
                            {product.price}
                          </td>

                          <td className="border-none w-3 pt-2">
                            <button
                              onClick={() => handleRemoveProduct(product.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <p className="text-xl font-bold text-right mr-6">
                    Total Amount: {totalPurchasePrice.toFixed(2)} <br />{" "}
                    Payment:
                    <input
                      type="number"
                      id="payment"
                      value={payment}
                      onChange={(e) => handlePaymentChange(e.target.value)}
                      className="mt-1 ml-3 px-3 w-24 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                    <br />
                    Change: {parseFloat(change.toFixed(2))}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic text-center">
                No products added yet.
              </p>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleOpenClose}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={handleAddSale}
            className="ml-1"
          >
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={deleteOpen} handler={() => setDeleteOpen(false)}>
        <DialogHeader>Confirm Deletion</DialogHeader>
        <DialogBody>Are you sure you want to delete this sale?</DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setDeleteOpen(false)}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button variant="gradient" color="green" onClick={handleDelete}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>

      {viewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleViewClose}
          ></div>

          {/* Dialog */}
          <div className="relative bg-white shadow-xl w-[100mm] max-h-[90vh] overflow-y-auto p-2 z-10">
            <div className="flex justify-center mb-3">
              <button
                className="text-md font-semibold bg-green-400 p-2 rounded-md"
                onClick={reactToPrintFn}
              >
                Print Receipt
              </button>
            </div>

            {/* Body */}
            <div className="flex justify-center">
              {viewSale && (
                <div
                  className="space-y-1 text-black w-[80mm] justify-center items-center"
                  ref={contentRef}
                >
                  <div className="flex-col text-lg font-semibold">
                    <div className="flex justify-center text-3xl">
                      Kashif Traders
                    </div>
                    <div className="flex justify-center text-2xl mt-4">
                      M.A.H Birds Food Shop
                    </div>
                    <div className="flex justify-center text-xl mt-4">
                      Sales Invoice
                    </div>
                    <div className="flex justify-center text-[15px] mt-4">
                      Shop No. 33 Bahawal Sheer Road
                    </div>
                    <div className="flex justify-center text-[15px]">
                      Chauburji Lahore
                    </div>
                    <div className="flex justify-center text-[15px]">
                      Phone: 03235132987
                    </div>
                    <hr className="border-t-2 border-black" />
                    <div className="flex justify-between py-2 px-2 text-[15px]">
                      <div className="w-1/2">Sale Id: {viewSale.saleId}</div>
                      <div className="w-1/2 ml-3">
                        Date: {convertToPakistanDate(viewSale.saleDate)}
                      </div>
                    </div>
                    <div className="flex justify-between px-2 text-[15px]">
                      <div className="w-1/2">Name: {viewSale.name}</div>
                      <div className="w-1/2 ml-3">
                        Time: {convertToPakistanTime(viewSale.saleDate)}
                      </div>
                    </div>
                  </div>
                  <table className="border-collapse border-black text-sm w-[80mm]">
                    <thead>
                      <tr>
                        <th className="border p-2 text-center">Sr.</th>
                        <th className="border p-2 text-center">Description</th>
                        <th className="border p-2 text-center">Quantity</th>
                        <th className="border p-2 text-center">Rate</th>
                        <th className="border p-2 text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewSale.saleItems &&
                        viewSale.saleItems.map((item, index) => (
                          <tr key={index}>
                            <td className="border p-2">{index + 1}</td>
                            <td className="border p-2">{item.productName}</td>
                            <td className="border p-2">{item.saleQuantity}</td>
                            <td className="border p-2">{item.unitPrice}</td>
                            <td className="border p-2">{item.price}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <div className="text-right font-semibold text-[15px] mr-4">
                    <div className="mt-10">
                      Grand Total: {viewSale.saleTotal}
                    </div>
                  </div>
                  <div className="text-right font-semibold text-[15px] mr-4">
                    <div>Payment: {viewSale.payment}</div>
                  </div>
                  <div className="text-right font-semibold text-[15px] mr-4">
                    <div>Change: {viewSale.changeBack}</div>
                  </div>
                  <div className="flex justify-center">
                    <div className="mt-10">Thank you for your kind Visit</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* <Dialog open={viewOpen} handler={handleViewClose} size="xs">
       
        <DialogBody>
          <div className="flex justify-center items-center overflow-y-auto">
            {viewSale && (
              <div className="space-y-1 text-black w-[80mm]" ref={contentRef}>
                <div className="flex-col text-lg font-semibold">
                  <div className="flex justify-center text-3xl">
                    Kashif Traders
                  </div>
                  <div className="flex justify-center text-xl mt-4">
                    Sales Invoice
                  </div>
                  <div className="flex justify-center text-lg mt-4">
                    Peer Bahawal Sheer Road
                  </div>
                  <div className="flex justify-center text-lg">
                    Phone: 03235132987
                  </div>
                  <hr className="border-t-2 border-black" />
                  <div className="flex justify-between py-2 px-2 text-[15px]">
                    <div className="w-1/2">Sale Id: {viewSale.saleId}</div>
                    <div className="w-1/2 ml-3">
                      Date: {convertToPakistanDate(viewSale.saleDate)}
                    </div>
                  </div>
                  <div className="flex justify-between px-2 text-[15px]">
                    <div className="w-1/2">Name: {viewSale.name}</div>
                    <div className="w-1/2 ml-3">
                      Time: {convertToPakistanTime(viewSale.saleDate)}
                    </div>
                  </div>
                </div>
                <table className="border-collapse border-black text-sm w-[80mm]">
                  <thead>
                    <tr>
                      <th className="border p-2 text-center">Sr.</th>
                      <th className="border p-2 text-center">Description</th>
                      <th className="border p-2 text-center">Quantity</th>
                      <th className="border p-2 text-center">Rate</th>
                      <th className="border p-2 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewSale.saleItems &&
                      viewSale.saleItems.map((item, index) => (
                        <tr key={index}>
                          <td className="border p-2">{index + 1}</td>
                          <td className="border p-2">{item.productName}</td>
                          <td className="border p-2">{item.saleQuantity}</td>
                          <td className="border p-2">{item.unitPrice}</td>
                          <td className="border p-2">{item.price}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className="text-right font-semibold text-[15px] mr-4">
                  <div className="mt-10">Grand Total: {viewSale.salePrice}</div>
                </div>
                <div className="text-right font-semibold text-[15px] mr-4">
                  <div>Payment: {viewSale.payment}</div>
                </div>
                <div className="text-right font-semibold text-[15px] mr-4">
                  <div>Change: {viewSale.changeBack}</div>
                </div>
                <div className="flex justify-center">
                  <div className="mt-20">Thank you for your kind Visit</div>
                </div>
                <div className="flex justify-center">
                  <div className="mt-20">Thank you for your kind Visit</div>
                </div>
              </div>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="green"
            onClick={reactToPrintFn}
            className="mr-1 border-2 border-black text-white bg-green-600 text-sm hover:text-white hover:bg-green-400"
          >
            <span>Print Receipt</span>
          </Button>
          <Button
            variant="text"
            color="red"
            onClick={handleViewClose}
            className="mr-1"
          >
            <span>Close</span>
          </Button>
        </DialogFooter>
      </Dialog> */}
    </>
  );
};

export default Sales;
