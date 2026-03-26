import React, { useCallback, useRef, useState } from "react";
import axios from "axios";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { useMemo } from "react";

/**
 * Reports component
 *
 * - Change API endpoints in generateSalesReport() and generateStockReport()
 * - Print opens a dialog with a POS-style preview and prints to an 80mm width layout
 */

const Reports = () => {
  const [activeTab, setActiveTab] = useState("sales"); // 'sales' or 'stocks'

  // Sales tab state
  const [salesStart, setSalesStart] = useState("");
  const [salesEnd, setSalesEnd] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState(null);

  // Stocks tab state
  const [stockStart, setStockStart] = useState("");
  const [stockEnd, setStockEnd] = useState("");
  const [stockData, setStockData] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState(null);

  // Print dialog state
  const [printOpen, setPrintOpen] = useState(false);
  const printRef = useRef(null);
  const [printMode, setPrintMode] = useState("sales"); // which dataset to print

  // Calculate totals from data - these will update automatically when data changes
  const totalSaleQty = useMemo(() => {
    return salesData.reduce((sum, row) => sum + parseFloat(row.sale || 0), 0);
  }, [salesData]);

  const totalSaleAmount = useMemo(() => {
    return salesData.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0);
  }, [salesData]);

  const totalOpening = useMemo(() => {
    return stockData.reduce((sum, row) => sum + parseFloat(row.Opn || 0), 0);
  }, [stockData]);

  const totalReceiving = useMemo(() => {
    return stockData.reduce((sum, row) => sum + parseFloat(row.Rec || 0), 0);
  }, [stockData]);

  const totalSaleStock = useMemo(() => {
    return stockData.reduce((sum, row) => sum + parseFloat(row.Sale || 0), 0);
  }, [stockData]);

  const totalAvailable = useMemo(() => {
    return stockData.reduce((sum, row) => sum + parseFloat(row.Bal || 0), 0);
  }, [stockData]);

  // Helper: format currency
  const formatMoney = (v) => {
    if (v == null) return "-";
    return Number(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // API calls (change URLs to your backend)
  const generateSalesReport = useCallback(async () => {
    setSalesError(null);
    if (!salesStart || !salesEnd) {
      setSalesError("Please select both start and end dates");
      return;
    }
    setSalesLoading(true);
    try {
      // <-- Replace this URL with your real sales report endpoint
      const url = `${import.meta.env.VITE_BASE_URL}/api/getSaleReport`;
      const res = await axios.get(url, {
        params: { start: salesStart, end: salesEnd },
      });
      // Expect res.data.data to be an array of: { productName, sale_quantity, sale_amount }
      setSalesData(res.data?.data ?? []);
    } catch (err) {
      console.error("Sales report error", err);
      setSalesError(
        err.response?.data?.message ??
        err.message ??
        "Failed to fetch sales report"
      );
      setSalesData([]);
    } finally {
      setSalesLoading(false);
    }
  }, [salesStart, salesEnd]);

  const generateStockReport = useCallback(async () => {
    setStockError(null);
    if (!stockStart || !stockEnd) {
      setStockError("Please select both start and end dates");
      return;
    }
    setStockLoading(true);
    try {
      // <-- Replace this URL with your real stock report endpoint
      const url = `${import.meta.env.VITE_BASE_URL}/api/getStockReport`;
      const res = await axios.get(url, {
        params: { start: stockStart, end: stockEnd },
      });
      // Expect res.data.data to be an array of: { productName, Opening, Receiving, Sale, Available }
      setStockData(res.data?.data ?? []);
    } catch (err) {
      console.error("Stock report error", err);
      setStockError(
        err.response?.data?.message ??
        err.message ??
        "Failed to fetch stock report"
      );
      setStockData([]);
    } finally {
      setStockLoading(false);
    }
  }, [stockStart, stockEnd]);

  // Print: open dialog and set the dataset to print
  const openPrintDialog = (mode) => {
    setPrintMode(mode);
    setPrintOpen(true);
  };

  // Utility to open a new window with POS-ready HTML and call print
  const printContent = () => {
    const node = printRef.current;
    if (!node) return;

    // Collect HTML, wrap in minimal POS-styles
    const html = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            /* POS (80mm) styling */
            @page { margin: 5mm; size: 80mm auto; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
              width: 80mm;
              margin: 0;
              padding: 4mm;
              color: #000;
            }
            .receipt {
              width: 100%;
              box-sizing: border-box;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: 700; font-size: 18px}
            .muted { color: #555; font-size: 11px; }
            table { width: 100%; border-collapse: collapse;  }
            th, td { padding: 2px 0; text-align: center; font-size: 16px }
            .divider { border-top: 2px solid black; margin: 12px 0; }
            .big { font-size: 24px; font-weight: 700; }
          </style>
        </head>
        <body>
          ${node.innerHTML}
          <script>
            // Print then close window
            window.onload = () => { setTimeout(() => { window.print(); /* window.close(); */ }, 200); };
          </script>
        </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=700,height=700");
    if (!w) {
      alert("Pop-up blocked. Allow pop-ups for this site to print.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  // Render table rows
  const SalesTable = () => (
    <div className="overflow-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-sm bg-gray-100">
            <th className="px-3 py-2">Product</th>
            <th className="px-3 py-2">Sale Quantity</th>
            <th className="px-3 py-2">Sale Amount</th>
          </tr>
        </thead>
        <tbody>
          {salesData.length === 0 && (
            <tr>
              <td
                colSpan={3}
                className="px-3 py-4 text-center text-sm text-gray-600"
              >
                {salesLoading
                  ? "Loading..."
                  : "No sales found for selected dates."}
              </td>
            </tr>
          )}
          {salesData.map((r, idx) => (
            <tr key={idx} className="odd:bg-white even:bg-gray-50">
              <td className="px-3 py-2">{r.product ?? "-"}</td>
              <td className="px-3 py-2">{r.sale ?? 0}</td>
              <td className="px-3 py-2">{r.amount ?? 0}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold bg-gray-100">
            <td>Total</td>
            <td>{totalSaleQty.toFixed(2)}</td>
            <td>{totalSaleAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  const StockTable = () => (
    <div className="overflow-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-sm bg-gray-100">
            <th className="px-3 py-2">Product</th>
            <th className="px-3 py-2">Opening</th>
            <th className="px-3 py-2">Receiving</th>
            <th className="px-3 py-2">Sale</th>
            <th className="px-3 py-2">Available</th>
          </tr>
        </thead>
        <tbody>
          {stockData.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-3 py-4 text-center text-sm text-gray-600"
              >
                {stockLoading
                  ? "Loading..."
                  : "No stock transactions found for selected dates."}
              </td>
            </tr>
          )}
          {stockData.map((r, idx) => (
            <tr key={idx} className="odd:bg-white even:bg-gray-50">
              <td className="px-3 py-2">{r.Product ?? "-"}</td>
              <td className="px-3 py-2">{r.Opn ?? 0}</td>
              <td className="px-3 py-2">{r.Rec ?? 0}</td>
              <td className="px-3 py-2">{r.Sale ?? 0}</td>
              <td className="px-3 py-2">{r.Bal ?? 0}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold bg-gray-100">
            <td>Total</td>
            <td>{totalOpening.toFixed(2)}</td>
            <td>{totalReceiving.toFixed(2)}</td>
            <td>{totalSaleStock.toFixed(2)}</td>
            <td>{totalAvailable.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  // Build printable HTML for the dialog (simple)
  const PrintableReceipt = () => {
    if (printMode === "sales") {
      return (
        <div className="receipt" ref={printRef}>
          <div className="center bold big">Kashif Traders</div>
          <div className="center bold big">M.A.H Birds Food Shop</div>
          <div className="center great">Sales Report</div>
          <div className="center great">
            {salesStart} → {salesEnd}
          </div>
          <div className="divider" />
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Sale</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(salesData || []).map((r, i) => (
                <tr key={i}>
                  <td style={{ width: "50%" }}>{r.product ?? "-"}</td>
                  <td style={{ width: "25%" }}>{r.sale ?? 0}</td>
                  <td style={{ width: "25%" }}>{r.amount ?? 0}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td>{totalSaleQty.toFixed(2)}</td>
                <td>{totalSaleAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          <div className="divider" />
          <div className="right bold">
            Printed: {new Date().toLocaleString()}
          </div>
        </div>
      );
    }

    // stocks
    return (
      <div className="receipt" ref={printRef}>
        <div className="center bold big">Kashif Traders</div>
        <div className="center bold big">M.A.H Birds Food Shop</div>
        <div className="center great">Stock Report</div>
        <div className="center great">
          {stockStart} → {stockEnd}
        </div>
        <div className="divider" />
        <table>
          <thead>
            <tr>
              <th style={{ width: "28%" }}>Product</th>
              <th style={{ width: "18%" }}>Opn</th>
              <th style={{ width: "18%" }}>Rec</th>
              <th style={{ width: "18%" }}>Sale</th>
              <th style={{ width: "18%" }}>Bal</th>
            </tr>
          </thead>
          <tbody>
            {(stockData || []).map((r, i) => (
              <tr key={i}>
                <td style={{ width: "28%" }}>{r.Product ?? "-"}</td>
                <td style={{ width: "18%" }}>{r.Opn ?? 0}</td>
                <td style={{ width: "18%" }}>{r.Rec ?? 0}</td>
                <td style={{ width: "18%" }}>{r.Sale ?? 0}</td>
                <td style={{ width: "18%" }}>{r.Bal ?? 0}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>{totalOpening}</td>
              <td>{totalReceiving}</td>
              <td>{totalSaleStock}</td>
              <td>{totalAvailable}</td>
            </tr>
          </tfoot>
        </table>
        <div className="divider" />
        <div className="right bold">Printed: {new Date().toLocaleString()}</div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <Tabs value={activeTab === "sales" ? "1" : "2"}>
        <div className="flex justify-center mb-4">
          <TabsHeader>
            <Tab
              key="1"
              value="1"
              onClick={() => setActiveTab("sales")}
              className="w-48"
            >
              <div className="flex items-center gap-3">
                {/* small icon + label */}
                <svg
                  width="26px"
                  height="26px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {" "}
                  <path
                    d="M11.7255 17.1019C11.6265 16.8844 11.4215 16.7257 11.1734 16.6975C10.9633 16.6735 10.7576 16.6285 10.562 16.5636C10.4743 16.5341 10.392 16.5019 10.3158 16.4674L10.4424 16.1223C10.5318 16.1622 10.6239 16.1987 10.7182 16.2317L10.7221 16.2331L10.7261 16.2344C11.0287 16.3344 11.3265 16.3851 11.611 16.3851C11.8967 16.3851 12.1038 16.3468 12.2629 16.2647L12.2724 16.2598L12.2817 16.2544C12.5227 16.1161 12.661 15.8784 12.661 15.6021C12.661 15.2955 12.4956 15.041 12.2071 14.9035C12.062 14.8329 11.8559 14.7655 11.559 14.6917C11.2545 14.6147 10.9987 14.533 10.8003 14.4493C10.6553 14.3837 10.5295 14.279 10.4161 14.1293C10.3185 13.9957 10.2691 13.7948 10.2691 13.5319C10.2691 13.2147 10.3584 12.9529 10.5422 12.7315C10.7058 12.5375 10.9381 12.4057 11.2499 12.3318C11.4812 12.277 11.6616 12.1119 11.7427 11.8987C11.8344 12.1148 12.0295 12.2755 12.2723 12.3142C12.4751 12.3465 12.6613 12.398 12.8287 12.4677L12.7122 12.8059C12.3961 12.679 12.085 12.6149 11.7841 12.6149C10.7848 12.6149 10.7342 13.3043 10.7342 13.4425C10.7342 13.7421 10.896 13.9933 11.1781 14.1318L11.186 14.1357L11.194 14.1393C11.3365 14.2029 11.5387 14.2642 11.8305 14.3322C12.1322 14.4004 12.3838 14.4785 12.5815 14.5651L12.5856 14.5669L12.5897 14.5686C12.7365 14.6297 12.8624 14.7317 12.9746 14.8805L12.9764 14.8828L12.9782 14.8852C13.0763 15.012 13.1261 15.2081 13.1261 15.4681C13.1261 15.7682 13.0392 16.0222 12.8604 16.2447C12.7053 16.4377 12.4888 16.5713 12.1983 16.6531C11.974 16.7163 11.8 16.8878 11.7255 17.1019Z"
                    fill="#000000"
                  />{" "}
                  <path
                    d="M11.9785 18H11.497C11.3893 18 11.302 17.9105 11.302 17.8V17.3985C11.302 17.2929 11.2219 17.2061 11.1195 17.1944C10.8757 17.1667 10.6399 17.115 10.412 17.0394C10.1906 16.9648 9.99879 16.8764 9.83657 16.7739C9.76202 16.7268 9.7349 16.6312 9.76572 16.5472L10.096 15.6466C10.1405 15.5254 10.284 15.479 10.3945 15.5417C10.5437 15.6262 10.7041 15.6985 10.8755 15.7585C11.131 15.8429 11.3762 15.8851 11.611 15.8851C11.8129 15.8851 11.9572 15.8628 12.0437 15.8181C12.1302 15.7684 12.1735 15.6964 12.1735 15.6021C12.1735 15.4929 12.1158 15.411 12.0004 15.3564C11.8892 15.3018 11.7037 15.2422 11.4442 15.1777C11.1104 15.0933 10.8323 15.0039 10.6098 14.9096C10.3873 14.8103 10.1936 14.6514 10.0288 14.433C9.86396 14.2096 9.78156 13.9092 9.78156 13.5319C9.78156 13.095 9.91136 12.7202 10.1709 12.4074C10.4049 12.13 10.7279 11.9424 11.1401 11.8447C11.2329 11.8227 11.302 11.7401 11.302 11.6425V11.2C11.302 11.0895 11.3893 11 11.497 11H11.9785C12.0862 11 12.1735 11.0895 12.1735 11.2V11.6172C12.1735 11.7194 12.2487 11.8045 12.3471 11.8202C12.7082 11.8777 13.0255 11.9866 13.2989 12.1469C13.3765 12.1924 13.4073 12.2892 13.3775 12.3756L13.0684 13.2725C13.0275 13.3914 12.891 13.4417 12.7812 13.3849C12.433 13.2049 12.1007 13.1149 11.7841 13.1149C11.4091 13.1149 11.2216 13.2241 11.2216 13.4425C11.2216 13.5468 11.2773 13.6262 11.3885 13.6809C11.4998 13.7305 11.6831 13.7851 11.9386 13.8447C12.2682 13.9192 12.5464 14.006 12.773 14.1053C12.9996 14.1996 13.1953 14.356 13.3602 14.5745C13.5291 14.7929 13.6136 15.0908 13.6136 15.4681C13.6136 15.8851 13.4879 16.25 13.2365 16.5628C13.0176 16.8354 12.7145 17.0262 12.3274 17.1353C12.2384 17.1604 12.1735 17.2412 12.1735 17.3358V17.8C12.1735 17.9105 12.0862 18 11.9785 18Z"
                    fill="#000000"
                  />{" "}
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.59235 5H13.8141C14.8954 5 14.3016 6.664 13.8638 7.679L13.3656 8.843L13.2983 9C13.7702 8.97651 14.2369 9.11054 14.6282 9.382C16.0921 10.7558 17.2802 12.4098 18.1256 14.251C18.455 14.9318 18.5857 15.6958 18.5019 16.451C18.4013 18.3759 16.8956 19.9098 15.0182 20H8.38823C6.51033 19.9125 5.0024 18.3802 4.89968 16.455C4.81587 15.6998 4.94656 14.9358 5.27603 14.255C6.12242 12.412 7.31216 10.7565 8.77823 9.382C9.1696 9.11054 9.63622 8.97651 10.1081 9L10.0301 8.819L9.54263 7.679C9.1068 6.664 8.5101 5 9.59235 5Z"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />{" "}
                  <path
                    d="M13.2983 9.75C13.7125 9.75 14.0483 9.41421 14.0483 9C14.0483 8.58579 13.7125 8.25 13.2983 8.25V9.75ZM10.1081 8.25C9.69391 8.25 9.35812 8.58579 9.35812 9C9.35812 9.41421 9.69391 9.75 10.1081 9.75V8.25ZM15.9776 8.64988C16.3365 8.44312 16.4599 7.98455 16.2531 7.62563C16.0463 7.26671 15.5878 7.14336 15.2289 7.35012L15.9776 8.64988ZM13.3656 8.843L13.5103 9.57891L13.5125 9.57848L13.3656 8.843ZM10.0301 8.819L10.1854 8.08521L10.1786 8.08383L10.0301 8.819ZM8.166 7.34357C7.80346 7.14322 7.34715 7.27469 7.1468 7.63722C6.94644 7.99976 7.07791 8.45607 7.44045 8.65643L8.166 7.34357ZM13.2983 8.25H10.1081V9.75H13.2983V8.25ZM15.2289 7.35012C14.6019 7.71128 13.9233 7.96683 13.2187 8.10752L13.5125 9.57848C14.3778 9.40568 15.2101 9.09203 15.9776 8.64988L15.2289 7.35012ZM13.2209 8.10709C12.2175 8.30441 11.1861 8.29699 10.1854 8.08525L9.87486 9.55275C11.0732 9.80631 12.3086 9.81521 13.5103 9.57891L13.2209 8.10709ZM10.1786 8.08383C9.47587 7.94196 8.79745 7.69255 8.166 7.34357L7.44045 8.65643C8.20526 9.0791 9.02818 9.38184 9.88169 9.55417L10.1786 8.08383Z"
                    fill="#000000"
                  />{" "}
                </svg>
                Sales
              </div>
            </Tab>
            <Tab
              key="2"
              value="2"
              onClick={() => setActiveTab("stocks")}
              className="w-48"
            >
              <div className="flex items-center gap-3">
                <svg
                  width="26px"
                  height="26px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {" "}
                  <path
                    d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z"
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />{" "}
                </svg>
                Stocks
              </div>
            </Tab>
          </TabsHeader>
        </div>

        <TabsBody>
          <TabPanel key="1" value="1" className="p-0">
            {/* SALES TAB */}
            <div className="bg-white shadow rounded p-5">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-600">Start</label>
                  <input
                    type="date"
                    value={salesStart}
                    onChange={(e) => setSalesStart(e.target.value)}
                    className="border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">End</label>
                  <input
                    type="date"
                    value={salesEnd}
                    onChange={(e) => setSalesEnd(e.target.value)}
                    className="border px-3 py-2 rounded"
                  />
                </div>

                <div className="flex gap-2 ml-auto">
                  <Button
                    onClick={generateSalesReport}
                    size="sm"
                    disabled={salesLoading}
                    className="bg-blue-700 hover:bg-blue-700"
                  >
                    {salesLoading ? "Generating..." : "Generate"}
                  </Button>

                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => openPrintDialog("sales")}
                  >
                    Print
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                {salesError && (
                  <div className="text-red-600 text-sm mb-2">{salesError}</div>
                )}
                <SalesTable />
              </div>
            </div>
          </TabPanel>

          <TabPanel key="2" value="2" className="p-0">
            {/* STOCKS TAB */}
            <div className="bg-white shadow rounded p-5">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-600">Start</label>
                  <input
                    type="date"
                    value={stockStart}
                    onChange={(e) => setStockStart(e.target.value)}
                    className="border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">End</label>
                  <input
                    type="date"
                    value={stockEnd}
                    onChange={(e) => setStockEnd(e.target.value)}
                    className="border px-3 py-2 rounded"
                  />
                </div>

                <div className="flex gap-2 ml-auto">
                  <Button
                    onClick={generateStockReport}
                    size="sm"
                    disabled={stockLoading}
                    className="bg-blue-700 hover:bg-blue-700"
                  >
                    {stockLoading ? "Generating..." : "Generate"}
                  </Button>

                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => openPrintDialog("stocks")}
                  >
                    Print
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                {stockError && (
                  <div className="text-red-600 text-sm mb-2">{stockError}</div>
                )}
                <StockTable />
              </div>
            </div>
          </TabPanel>
        </TabsBody>
      </Tabs>

      {/* Print dialog */}
      <Dialog
        open={printOpen}
        handler={() => setPrintOpen((v) => !v)}
        size="sm"
      >
        <DialogHeader>Preview & Print</DialogHeader>

        <DialogBody divider>
          <div className="w-full" style={{ maxWidth: "320px" }}>
            <PrintableReceipt />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="text"
            onClick={() => setPrintOpen(false)}
            className="mr-2"
          >
            Close
          </Button>

          <Button
            onClick={() => {
              // print the content in a new window (POS friendly)
              printContent();
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Print receipt
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default Reports;
