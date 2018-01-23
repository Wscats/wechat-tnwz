const mysql = require("mysql");
const connection = mysql.createConnection({
    // 域名
    host: 'localhost',
    // 用户名
    user: 'laoli',
    // 密码
    password: '12345678',
    // 数据库
    database: 'brain'
});

// 进行连接数据库
connection.connect();

connection.query("SELECT * FROM `question` WHERE quiz = '云南省昆明市最大的淡水湖是？'", function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results);
    if(results.length){
        console.log("有")
    }else{
        console.log("没有")
    }
});