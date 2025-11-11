import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import axios from "axios";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { Toast } from "../utils/Toast";
import { toast } from "react-toastify";

const Products = () => {
  const [productData, setProductData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ sku: "", productName: "" });
  const [editableProduct, setEditableProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/getProduct"
        );
        setProductData(response.data.data);
      } catch (err) {
        console.error("Error fetching Product data:", err);
      }
    };
    fetchData();
  }, [refreshFlag]);

  const handleOpenClose = useCallback(() => {
    setOpen(false);
    setNewProduct({ sku: "", productName: "" });
  }, []);

  const handleEditOpen = useCallback((product) => {
    setEditableProduct(product);
    setEditOpen(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setEditOpen(false);
    setEditableProduct(null);
  }, []);

  const handleOpenChange = useCallback((field, value) => {
    setNewProduct((p) => ({ ...p, [field]: value }));
  }, []);

  const handleEditChange = useCallback((field, value) => {
    setEditableProduct((prevProduct) => ({ ...prevProduct, [field]: value }));
  }, []);

  const handleEditSave = useCallback(async () => {
    try {
      // 2️⃣ Send update request
      const response = await axios.put(
        "http://localhost:3000/api/updateProduct",
        editableProduct
      );

      // 3️⃣ If backend returns success
      toast.success(response?.data?.message);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.error("❌ Failed to update Product:", error.message);
    } finally {
      handleEditClose();
      setRefreshFlag((prev) => !prev); // trigger refresh
    }
  }, [editableProduct, handleEditClose]);

  const handleDeleteOpen = useCallback((product) => {
    setProductToDelete(product);
    setDeleteOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    console.log(productToDelete);
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/deleteProduct/${productToDelete.productId}`
      );
      toast.success(response?.data?.message);
      setRefreshFlag((prev) => !prev); // after successful add/delete
    } catch (error) {
      console.log("Failed to delete Product", error.message);
      toast.error(error?.response?.data?.message);
    }

    setDeleteOpen(false);
    setProductToDelete(null);
  }, [productToDelete]);

  const handleAddProduct = useCallback(async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/addProduct",
        newProduct
      );
      toast.success(response?.data?.message);
      setRefreshFlag((prev) => !prev); // Trigger data refresh
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.error("Failed to add Product:", error?.response?.data?.message);
    } finally {
      handleOpenClose(); // Close modal or reset form
    }
  }, [newProduct, handleOpenClose]);

  const filteredProducts = productData.filter((p) =>
    p.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {" "}
      <Toast />
      <div className="m-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Button
            onClick={() => setOpen(true)}
            className="shadow-none bg-mainColor text-white rounded-md text-lg normal-case hover:transition-colors"
          >
            Add New Product
          </Button>
          <input
            type="text"
            placeholder="Search by product name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-2/5"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full mt-7">
            <thead>
              <tr>
                <th className="p-2">S. No.</th>
                <th className="p-2">SKU</th>
                <th className="p-2">Product Name</th>
                <th className="p-2">Purchase Price (kg/Item)</th>
                <th className="p-2">Selling Price (kg/item)</th>
                <th className="p-2">Update</th>
                <th className="p-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, index) => (
                <tr key={p.productId}>
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{p.sku}</td>
                  <td className="p-2">{p.productName}</td>
                  <td className="p-2 w-60">{p.purchasePrice}</td>
                  <td className="p-2">{p.sellingPrice}</td>
                  <td className="p-2">
                    <button onClick={() => handleEditOpen(p)} className="p-1">
                      ✏️
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => handleDeleteOpen(p)} className="p-1">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* New Product Dialog */}
        <Dialog open={open} handler={handleOpenClose}>
          <DialogHeader className="flex justify-center">
            Add New Product
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-4">
              <div className="text-black text-xl flex items-center">
                <label htmlFor="sku">Product SKU</label>
                <input
                  id="sku"
                  type="number"
                  value={newProduct.sku}
                  onChange={(e) => handleOpenChange("sku", e.target.value)}
                  className="w-28 p-2 ml-8 border-2 border-black"
                />
              </div>
              <div className="text-black text-xl flex items-center">
                <label htmlFor="productName">Product Name</label>
                <input
                  id="productName"
                  type="text"
                  value={newProduct.productName}
                  onChange={(e) =>
                    handleOpenChange("productName", e.target.value)
                  }
                  className="w-80 p-2 ml-5 border-2 border-black"
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
              variant="gradient"
              color="green"
              onClick={handleAddProduct}
              className="text-sm"
            >
              <span>Confirm</span>
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={editOpen} handler={handleEditClose}>
          <DialogHeader className="flex justify-center">
            Edit Product
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-4">
              <div className="text-black text-xl flex items-center">
                <label htmlFor="editSku">Product SKU</label>
                <input
                  id="editSku"
                  type="text"
                  value={editableProduct?.sku || ""}
                  disabled
                  className="w-28 p-2 ml-8 border-2 border-black"
                />
              </div>
              <div className="text-black text-xl flex items-center">
                <label htmlFor="editProductName">Product Name</label>
                <input
                  id="editProductName"
                  type="text"
                  value={editableProduct?.productName || ""}
                  onChange={(e) =>
                    handleEditChange("productName", e.target.value)
                  }
                  className="w-80 p-2 ml-5 border-2 border-black"
                />
              </div>
              <div className="text-black text-xl flex items-center">
                <label htmlFor="editSellingPrice">Purchase Price</label>
                <input
                  id="editPurchasePrice"
                  type="number"
                  value={editableProduct?.purchasePrice || ""}
                  onChange={(e) =>
                    handleEditChange("purchasePrice", e.target.value)
                  }
                  className="w-32 p-2 ml-3 border-2 border-black"
                />
              </div>
              <div className="text-black text-xl flex items-center">
                <label htmlFor="editSellingPrice">Selling Price</label>
                <input
                  id="editSellingPrice"
                  type="number"
                  value={editableProduct?.sellingPrice || ""}
                  onChange={(e) =>
                    handleEditChange("sellingPrice", e.target.value)
                  }
                  className="w-32 p-2 ml-9 border-2 border-black"
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
              <span>Save</span>
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Delete Product Dialog */}
        <Dialog open={deleteOpen} handler={() => setDeleteOpen(false)}>
          <DialogHeader>Delete Product</DialogHeader>
          <DialogBody>Are you sure you want to delete this product?</DialogBody>
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
      </div>
    </>
  );
};

export default Products;
