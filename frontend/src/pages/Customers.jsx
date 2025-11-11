import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import axios from "axios";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

const Customers = () => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [clientData, setClientData] = useState([]);
  const [newClient, setNewClient] = useState({ name: "", phoneNo: "" });
  const [editClient, setEditClient] = useState(null);
  const [deleteClient, setDeleteClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch client data
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/getClient");
      setClientData(response.data.data);
    } catch (err) {
      console.error("Error fetching client data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered search
  const filteredClients = clientData.filter((client) =>
    `${client.customerId}${client.name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleOpenClose = useCallback(() => {
    setOpen(false);
    setNewClient({ name: "", phoneNo: "" });
  }, []);

  const handleEditOpen = useCallback((client) => {
    setEditClient(client);
    setEditOpen(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setEditOpen(false);
    setEditClient(null);
  }, []);

  const handleOpenChange = useCallback((field, value) => {
    setNewClient((c) => ({ ...c, [field]: value }));
  }, []);

  const handleEditChange = useCallback((field, value) => {
    setEditClient((prevC) => ({ ...prevC, [field]: value }));
  }, []);

  const handleEditSave = useCallback(async () => {
    try {
      await axios.put(
        "http://localhost:3000/api/updateClient",
        editClient
      );
      fetchData(); // Refresh after edit
    } catch (error) {
      console.log("Failed to update Client", error.message);
    }
    handleEditClose();
  }, [editClient, fetchData, handleEditClose]);

  const handleDeleteOpen = useCallback((client) => {
    setDeleteClient(client);
    setDeleteOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/deleteClient/${deleteClient.customerId}`
      );
      fetchData(); // Refresh after delete
    } catch (error) {
      console.log("Failed to delete Client", error.message);
    }
    setDeleteOpen(false);
    setDeleteClient(null);
  }, [deleteClient, fetchData]);

  const handleAddClient = useCallback(async () => {
    try {
      await axios.post("http://localhost:3000/api/addClient", newClient);
      fetchData(); // Refresh after add
    } catch (error) {
      console.log("Failed to add Client", error.message);
    }
    handleOpenClose();
  }, [newClient, fetchData, handleOpenClose]);
  return (
    <>
      <div className="m-5">
        {/* Search bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Button
            onClick={() => setOpen(true)}
            className="shadow-none bg-mainColor text-white rounded-md text-lg normal-case"
          >
            Add New Client
          </Button>
          <input
            type="text"
            placeholder="Search by ID or name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-2/5"
          />

        </div>



        <div className="overflow-x-auto">
          <table className="w-full mt-7">
            <thead>
              <tr>
                <th className="p-2">S. No.</th>
                <th className="p-2">Name</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Update</th>
                <th className="p-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((p, index) => (
                <tr key={p.customerId}>
                  <td className="p-2">{p.customerId}</td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.phoneNo}</td>
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
        <Dialog open={open} handler={handleOpenClose}>
          <DialogHeader className="flex justify-center">
            Add New Client
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-4">
              <div className="text-black text-xl flex items-center">
                <label htmlFor="sku">Name</label>
                <input
                  id="name"
                  type="text"
                  value={newClient?.name}
                  onChange={(e) => handleOpenChange("name", e.target.value)}
                  className="w-80 p-2 ml-14 border-2 border-black"
                />
              </div>
              <div className="text-black text-xl flex items-center">
                <label htmlFor="productName">Phone No.</label>
                <input
                  id="phoneNo"
                  type="text"
                  value={newClient?.phoneNo}
                  onChange={(e) => handleOpenChange("phoneNo", e.target.value)}
                  className="w-80 p-2 ml-4 border-2 border-black"
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
              onClick={handleAddClient}
              className="text-sm"
            >
              <span>Confirm</span>
            </Button>
          </DialogFooter>
        </Dialog>

        <Dialog open={editOpen} handler={handleEditClose}>
          <DialogHeader className="flex justify-center">
            Edit Client
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-4">
              <div className="text-black text-xl flex items-center">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  value={editClient?.name || ""}
                  onChange={(e) => handleEditChange("name", e.target.value)}
                  className="w-96 p-2 ml-14 border-2 border-black"
                />
              </div>
              <div className="text-black text-xl flex items-center">
                <label htmlFor="editProductName">Phone No.</label>
                <input
                  id="phoneNo"
                  type="text"
                  value={editClient?.phoneNo || ""}
                  onChange={(e) => handleEditChange("phoneNo", e.target.value)}
                  className="w-80 p-2 ml-4 border-2 border-black"
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

        <Dialog open={deleteOpen} handler={() => setDeleteOpen(false)}>
          <DialogHeader>Delete Client</DialogHeader>
          <DialogBody>Are you sure you want to delete this client?</DialogBody>
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

export default Customers;
