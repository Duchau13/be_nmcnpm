const express = require("express");
const {authenticate} = require("../middlewares/auth/authenticate.js")
const {authorize} = require("../middlewares/auth/authorize.js");
const { getAllItemInOrder, getAllOrder, confirmOrder, cancelOrder, thongKeSanPham, thongKeDonHang, getAllOrderForShipper, receiveOrder, thongKeSanPhamAdmin, thongKeDonHangAdmin, createReport, dashboardManager, updateOrder, getAllDetailOrder, getAllItemInOrderToChange, createOrderDetailForm, createOrderDetail, getDetailOrderDetail, updateOrderDetail, deleteOrderDetail, getDetailOrder,confirmOrder2 } = require("../controllers/order.controllers");
const orderRouter = express.Router();

orderRouter.get("/", authenticate, getAllOrder);
orderRouter.get("/printreport/:flag", authenticate, getAllOrder);
orderRouter.get("/ship", authenticate, authorize(["Shipper"]), getAllOrderForShipper);
orderRouter.post("/report", authenticate, authorize(["Quản lý"]), createReport);
orderRouter.get("/dashboard-manager", authenticate, authorize(["Quản lý"]), dashboardManager);
orderRouter.get("/receive/:id_order", authenticate, authorize(["Shipper"]), receiveOrder);
orderRouter.get("/detail/:id_order", authenticate, getAllItemInOrder);
orderRouter.get("/detail/:id_order/:flag", authenticate, getAllItemInOrder);
orderRouter.get("/getdetail/:id_order", authenticate, authorize(["Nhân viên"]), getAllDetailOrder);
orderRouter.get("/create/:id_order", authenticate, authorize(["Nhân viên"]), createOrderDetailForm);
orderRouter.get("/orderdetail/:id_order/:id_item", authenticate, authorize(["Nhân viên"]), getDetailOrderDetail);
orderRouter.post("/orderdetail/:id_order", authenticate, authorize(["Nhân viên"]), createOrderDetail);
orderRouter.put("/orderdetail/:id_order/:id_item", authenticate, authorize(["Nhân viên"]), updateOrderDetail);
orderRouter.delete("/orderdetail/:id_order/:id_item", authenticate, authorize(["Nhân viên"]), deleteOrderDetail);
orderRouter.get("/orderdetail/:id_order", authenticate, authorize(["Nhân viên"]), getAllItemInOrderToChange);
orderRouter.get("/order/:id_order", authenticate, authorize(["Nhân viên"]), getDetailOrder);
orderRouter.put("/update/:id_order", updateOrder);
orderRouter.get("/confirm/:id_order", confirmOrder);
orderRouter.get("/confirm2/:id_order", confirmOrder2);
orderRouter.get("/cancel/:id_order", authenticate, authorize(["Nhân viên","Khách hàng"]), cancelOrder);
// orderRouter.get("/thongkesanpham", authenticate, authorize(["Quản lý"]), thongKeSanPham);
// orderRouter.get("/thongkedonhang", authenticate, authorize(["Quản lý"]), thongKeDonHang);
// orderRouter.get("/thongkesanpham/admin", authenticate, authorize(["Admin"]), thongKeSanPhamAdmin);
// orderRouter.get("/thongkedonhang/admin", authenticate, authorize(["Admin"]), thongKeDonHangAdmin);


module.exports = {
    orderRouter,
}