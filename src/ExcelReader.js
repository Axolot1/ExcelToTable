import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Table, Container, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // 引入CSS文件

// 解析尺寸并添加宽高属性的辅助函数
function parseAndAddDimensions(order) {
  if (order.尺寸) {
    const [height, width] = order.尺寸.split("x").map(Number);
    order.宽度 = Math.round(width);
    order.高度 = Math.round(height);
  }
}

const ExcelReader = () => {
  const [customerName, setCustomerName] = useState("");
  const [seriesNames, setSeriesNames] = useState([]);
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const tableRef = useRef();

  const parseData = (data) => {
    // 先用,连接所有单元格，然后用,,,,区分每组信息
    const lines = data.map((row) => row.join(",")).filter((line) => line);

    const orders = [];
    const materials = [];

    let currentOrders = [];
    // 判断是否为型材行的正则表达式
    const materialRegex = /^[^,]+\/[^,]+\/$/;

    // 判断是否是型材行的辅助函数
    function isMaterialLine(line) {
      // 使用正则表达式判断第一个单元格是否符合"型材名/型号/"的模式
      const parts = line.split(",").filter((part) => part.trim() !== "");
      return parts.length > 0 && materialRegex.test(parts[0]);
    }

    lines.forEach((line) => {
      const parts = line.split(",,,,");
      if (line.startsWith("订单编号")) {
        // 初始化新的订单对象数组
        currentOrders = parts.map((part) => {
          const [key, value] = part.split(",");
          return { [key.trim()]: value.trim() };
        });
        orders.push(...currentOrders);
      } else if (isMaterialLine(line)) {
        // 处理型材信息行
        const materialParts = line
          .split(",")
          .filter((part) => part.trim() !== "");

        if (materialParts.length >= 3) {
          const materialName = materialParts[0].trim();
          const sizeInfo = reverseSizeOrder(materialParts[1]);
          const totalLength = `${parseFloat(materialParts[2]).toFixed(1)}m`;

          materials.push({
            型材: materialName,
            尺寸: sizeInfo,
            总长: totalLength,
          });
        }
      } else {
        // 将信息填充到所有当前订单对象中
        parts.forEach((part, index) => {
          if (currentOrders[index]) {
            // 确保不超出范围
            const [key, value] = part.split(",");
            if (key && value) {
              currentOrders[index][key.trim()] = value.trim();
            }
          }
        });
      }
    });

    // 提取客户名称和系列名称
    if (orders.length > 0) {
      const customerName = orders[0].客户;
      const seriesNames = [...new Set(orders.map((order) => order.系列名称))];
      setCustomerName(customerName);
      setSeriesNames(seriesNames);
    }

    // 对每个订单对象解析尺寸并添加宽高属性
    orders.forEach((order) => {
      parseAndAddDimensions(order);
    });

    return { orders, materials };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      let data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const { orders, materials } = parseData(data);

      setOrders(orders);
      setMaterials(materials);
    };
    reader.readAsBinaryString(file);
  };

  const reverseSizeOrder = (sizeInfo) => {
    return sizeInfo
      .split(" ")
      .filter((l) => l)
      .sort((a, b) => {
        const lengthA = parseInt(a.split("=")[0].replace(/<[^>]+>/g, ""), 10);
        const lengthB = parseInt(b.split("=")[0].replace(/<[^>]+>/g, ""), 10);
        return lengthB - lengthA;
      })
      .map((pair) => `<span style="white-space: nowrap;">${pair.trim()}</span>`)
      .join("          ");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container ref={tableRef}>
      <Row className="my-3">
        <Col>
          <input type="file" onChange={handleFileUpload} />
          <Button onClick={handlePrint} className="ml-2">
            Print
          </Button>
        </Col>
      </Row>
      <Row>
        <h4>
          客户: {customerName} <span style={{ margin: "0 30px" }}></span>
          <span /> 系列: {seriesNames.join(", ")}
        </h4>
        <Col>
          <Table striped bordered hover className="print-table">
            <thead>
              <tr>
                <th>宽度</th>
                <th>高度</th>
                <th>数量</th>
                <th>系列名称</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index}>
                  <td>{order.宽度}</td>
                  <td>{order.高度}</td>
                  <td>{order.数量}</td>
                  <td>{order.系列名称}</td>
                  <td>{order.备注}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table
            striped
            bordered
            hover
            className="print-table  materials-table"
          >
            <thead>
              <tr>
                <th>型材</th>
                <th>尺寸</th>
                <th>总长</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material, index) => (
                <tr key={index}>
                  <td>{material.型材}</td>
                  <td dangerouslySetInnerHTML={{ __html: material.尺寸 }}></td>
                  <td>{material.总长}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default ExcelReader;
