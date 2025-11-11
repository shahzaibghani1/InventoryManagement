// ReceiptPrint.jsx
import React from "react";

// forwardRef so we can attach the ref from Sales
const ReceiptPrint = React.forwardRef((props, ref) => {
  // if no sale, don't render anything

  return (
    <div ref={ref} className="p-6 w-[80mm] text-black">
      <div>Sale Receipt</div>
    </div>
  );
});

export default ReceiptPrint;
