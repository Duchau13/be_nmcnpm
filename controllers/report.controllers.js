const { Order } = require("../models");
const { QueryTypes } = require("sequelize");

const getAllReport = async (req, res) => {
  const { flag } = req.params;
  const { start_date, end_date } = req.query;

  try {
    // Xây dựng điều kiện WHERE cho tìm kiếm theo ngày
    let dateFilter = '';
    const replacements = {};
    if (start_date && end_date) {
      dateFilter = 'WHERE DATE(time_order) BETWEEN :start_date AND :end_date';
      replacements.start_date = start_date;
      replacements.end_date = end_date;
    }

    // Truy vấn tổng hợp từ bảng orders, không nhóm theo ngày hay id_store
    const [report] = await Order.sequelize.query(
      `SELECT 
        SUM(CASE WHEN status NOT IN (0, 2) THEN item_fee ELSE 0 END) AS revenue,
        COUNT(CASE WHEN status NOT IN (0, 2) THEN 1 END) AS countOrder,
        COUNT(CASE WHEN status = 0 THEN 1 END) AS pendingOrders,
        COUNT(CASE WHEN status = 2 THEN 1 END) AS canceledOrders
      FROM orders
      ${dateFilter}`,
      {
        replacements,
        type: QueryTypes.SELECT,
        raw: true,
      }
    );

    // Định dạng revenue
    const formattedReport = {
      revenue: report.revenue ? report.revenue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0',
      countOrder: report.countOrder || 0,
      pendingOrders: report.pendingOrders || 0,
      canceledOrders: report.canceledOrders || 0
    };

    // Chọn template dựa trên flag
    const template = flag ? "report/report-print" : "report/report";
    res.status(200).render(template, {
      itemList: formattedReport,
      id_role: req.id_role,
      start_date: start_date || '',
      end_date: end_date || ''
    });
  } catch (error) {
    console.error('Lỗi khi lấy báo cáo:', error);
    res.status(500).render("report/report", {
      itemList: { revenue: '0', countOrder: 0, pendingOrders: 0, canceledOrders: 0 },
      id_role: req.id_role,
      start_date: start_date || '',
      end_date: end_date || '',
      error: "Đã có lỗi xảy ra khi tải báo cáo!"
    });
  }
};

const getReportDetail = async (req, res) => {
  const { date } = req.params; // Date format: dd-mm-yyyy
  try {
    // Chuyển đổi date từ dd-mm-yyyy sang yyyy-mm-dd
    const [day, month, year] = date.split('-');
    const formattedDate = `${year}-${month}-${day}`;

    // Truy vấn tổng hợp cho báo cáo theo ngày
    const [report] = await Order.sequelize.query(
      `SELECT 
        SUM(CASE WHEN status NOT IN (0, 2) THEN item_fee ELSE 0 END) AS revenue,
        COUNT(CASE WHEN status NOT IN (0, 2) THEN 1 END) AS countOrder,
        COUNT(CASE WHEN status = 0 THEN 1 END) AS pendingOrders,
        COUNT(CASE WHEN status = 2 THEN 1 END) AS canceledOrders
      FROM orders
      WHERE DATE(date) = :date`,
      {
        replacements: { date: formattedDate },
        type: QueryTypes.SELECT,
        raw: true,
      }
    );

    // Truy vấn chi tiết hóa đơn theo ngày
    const itemList = await Order.sequelize.query(
      `SELECT 
        o.id_order,
        o.item_fee AS total,
        o.status,
        COUNT(o.id_order) AS sold,
        i.name AS name_item,
        i.price
      FROM orders o
      LEFT JOIN items i ON o.id_item = i.id_item
      WHERE DATE(o.date) = :date
      GROUP BY o.id_order, i.name, i.price`,
      {
        replacements: { date: formattedDate },
        type: QueryTypes.SELECT,
        raw: true,
      }
    );

    // Định dạng revenue và date
    const formattedReport = {
      revenue: report.revenue ? report.revenue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0',
      countOrder: report.countOrder || 0,
      pendingOrders: report.pendingOrders || 0,
      canceledOrders: report.canceledOrders || 0,
      date: new Date(formattedDate).toLocaleDateString('vi-VN')
    };

    const formattedItemList = itemList.map(item => ({
      ...item,
      total: item.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
      status: item.status === 0 ? 'Đang đợi' : item.status === 2 ? 'Bị hủy' : 'Thành công'
    }));

    res.status(200).render("report/report-detail", {
      itemList: formattedItemList,
      report: formattedReport,
      id_role: req.id_role
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết báo cáo:', error);
    res.status(500).render("report/report-detail", {
      itemList: [],
      report: { revenue: '0', countOrder: 0, pendingOrders: 0, canceledOrders: 0 },
      id_role: req.id_role,
      error: "Đã có lỗi xảy ra khi tải chi tiết báo cáo!"
    });
  }
};

module.exports = {
  getAllReport,
  getReportDetail,
};