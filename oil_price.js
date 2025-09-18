// 油价查询脚本 for Loon - 修正版
// 使用聚合数据API：https://www.juhe.cn/docs/api/id/148

// 配置部分 - 请修改为您自己的设置
const OIL_API_KEY = "3fbfd7698d10e975d1d66d052c7fcd65"; // 替换为您的聚合数据API Key
const TARGET_PROVINCE = "安徽"; // 设置要查询的省份
const TARGET_CITY = "亳州"; // 设置要查询的城市(可选)

// 主函数
function getOilPrice() {
    // 构建API请求URL
    let url;
    if (TARGET_CITY) {
        url = `http://apis.juhe.cn/gnyj/city?key=${OIL_API_KEY}&city=${encodeURIComponent(TARGET_CITY)}`;
    } else {
        url = `http://apis.juhe.cn/gnyj/province?key=${OIL_API_KEY}&province=${encodeURIComponent(TARGET_PROVINCE)}`;
    }
    
    // 发送请求 - 使用Loon的$tool对象
    $tool.get(url, function(error, response, data) {
        if (error) {
            console.log("油价查询失败: " + error);
            $notification.post("油价查询失败", "网络请求错误", error);
            $done();
            return;
        }
        
        try {
            // 解析JSON数据
            const result = JSON.parse(data);
            
            // 检查API返回状态
            if (result.error_code !== 0) {
                throw new Error(`API错误: ${result.reason} (错误码: ${result.error_code})`);
            }
            
            // 提取油价信息
            let oilData, locationName, updateTime;
            
            if (TARGET_CITY) {
                oilData = result.result;
                locationName = TARGET_CITY;
                updateTime = oilData.time;
            } else {
                oilData = result.result[0];
                locationName = TARGET_PROVINCE;
                updateTime = oilData.time;
            }
            
            // 格式化消息
            let message = `🛢️ ${locationName}最新油价 (${updateTime})\n\n`;
            message += `92号汽油: ${oilData.p92} 元/升\n`;
            message += `95号汽油: ${oilData.p95} 元/升\n`;
            
            if (oilData.p98) {
                message += `98号汽油: ${oilData.p98} 元/升\n`;
            }
            
            message += `0号柴油: ${oilData.p0} 元/升\n`;
            
            if (oilData.p89) {
                message += `89号汽油: ${oilData.p89} 元/升\n`;
            }
            
            // 发送通知
            $notification.post(`${locationName}今日油价`, "", message);
            
            // 记录日志
            console.log(`${locationName}油价查询成功`);
            
        } catch (e) {
            console.log("油价查询失败: " + e.message);
            $notification.post("油价查询失败", "数据处理错误", e.message);
        } finally {
            $done();
        }
    });
}

// 执行主函数
getOilPrice();