const mysql = require("mysql");
const fs = require("fs");
const http = require("http");
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

let request = (requestDetail) => {
    console.log(requestDetail.requestOptions);
    requestDetail.requestOptions.path = "/question/bat/choose";
    console.log(requestDetail.requestOptions);
    http.request(requestDetail.requestOptions, () => {
        console.log("模拟request成功")
    })
}

// 进行连接数据库
connection.connect();
// 存储findQuiz接口的问题信息和choose接口的答案信息
let container;
module.exports = {
    * beforeSendResponse(requestDetail, responseDetail) {
        // 问题
        if (requestDetail.url === 'https://question.hortor.net/question/bat/findQuiz') {
            let newResponse = Object.assign({}, responseDetail.response);
            let res = JSON.parse(newResponse.body);
            container = res;
            console.log(res);
            //request(requestDetail);
            return {
                response: newResponse
            }
        }
        // 选择并返回答案
        if (requestDetail.url === 'https://question.hortor.net/question/bat/choose') {
            let newResponse = Object.assign({}, responseDetail.response);
            //console.log(JSON.parse(newResponse.body))
            // 给上面题目的题目数据添加正确答案
            container.data.correctoption = JSON.parse(newResponse.body).data.answer;
            console.log(container);
            // 判断数据库中是否存在此题
            connection.query("SELECT * FROM `question` WHERE quiz = '" + container.data.quiz + "'", function (error, results, fields) {
                if (error) throw error;
                console.log('The solution is: ', results);
                if (results.length) {
                    console.log("有此题目");
                    // 读取文件
                    fs.readFile('./repeat.html', 'utf-8', function (err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            // 写入重题
                            fs.writeFile("./repeat.html", data.toString() + container.data.quiz + "</br></br>", () => {
                                console.log("重复题目写入成功")
                            })
                        }
                    })
                } else {
                    console.log("没有此题目");
                    // 执行sql语句，并异步查找数据库数据
                    connection.query('INSERT INTO `question` (`quiz`, `options`, `school`, `type`, `typeid`, `contributor`, `correctoption`) VALUES ' + `
                    ('${
                        container.data.quiz
                    }', '${
                        container.data.options
                    }', '${
                        container.data.school
                    }', '${
                        container.data.type
                    }', '${
                        container.data.typeID
                    }', '${
                        container.data.contributor
                    }', '${
                        container.data.correctoption
                    }')
                    `, (error, results, fields) => {
                        if (error) throw error;
                        console.log('The solution is: ', results);
                    });
                }
            });
            // 判断最后一题
            if (container.data.num == 5) {
                console.log("这是最后一题")
            } else {
                
            }
            return {
                response: newResponse
            }
        }
    },
    // 只代理https请求中host为question.hortor.net的请求
    // * beforeDealHttpsRequest(requestDetail) {
    //     if (requestDetail.host && requestDetail.host.includes('question.hortor.net')) {
    //         return true
    //     }
    //     return false
    // }
};