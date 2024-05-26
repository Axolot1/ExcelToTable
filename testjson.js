const dataString = `总面积：,67.87,,,,地址：,二轨半加大三轨
订单编号,FG2024050903-C1,,,,订单编号,FG2024050903-C2,,,,订单编号,FG2024050903-C3
客户,刁雄,,,,客户,刁雄,,,,客户,刁雄
系列名称,亚铝120大三轨,,,,系列名称,亚铝120大三轨,,,,系列名称,亚铝105大三轨
数量,6,,,,数量,1,,,,数量,1
面积,31.04,,,,面积,1.69,,,,面积,13.75
颜色,内()/外(),,,,颜色,内()/外(),,,,颜色,内()/外()
尺寸,1429.00x3630.00,,,,尺寸,1429.00x1180.00,,,,尺寸,2350.00x5870.00
备注,,,,,备注,,,,,备注

订单编号,FG2024050903-C4,,,,订单编号,FG2024050903-C5
客户,刁雄,,,,客户,刁雄
系列名称,亚铝105大三轨,,,,系列名称,亚铝105大三轨
数量,1,,,,数量,1
面积,10.79,,,,面积,10.6
颜色,内()/外(),,,,颜色,内()/外()
尺寸,2350.00x4610.00,,,,尺寸,2350.00x4529.00
备注,,,,,备注`;

const lines = dataString
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line);
const orders = [];

let currentOrders = [];

lines.forEach((line) => {
  const parts = line.split(",,,,");
  if (line.startsWith("订单编号")) {
    // 初始化新的订单对象数组
    currentOrders = parts.map((part) => {
      const [key, value] = part.split(",");
      return { [key.trim()]: value.trim() };
    });
    orders.push(...currentOrders);
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

console.log(orders);
