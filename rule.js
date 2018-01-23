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

module.exports = {
    * beforeSendResponse(requestDetail, responseDetail) {
        // 问题
        if (requestDetail.url === 'https://question.hortor.net/question/bat/findQuiz') {
            let newResponse = Object.assign({}, responseDetail.response)
            let res = JSON.parse(newResponse.body)
            // 执行sql语句，并异步查找数据库数据
            connection.query('INSERT INTO `question` (`quiz`, `options`, `school`, `type`, `typeid`, `contributor`) VALUES ' + `
                ('${
                    res.data.quiz
                }', '${
                    res.data.options
                }', '${
                    res.data.school
                }', '${
                    res.data.type
                }', '${
                    res.data.typeID
                }', '${
                    res.data.contributor
                }')
                `, function (error, results, fields) {
                if (error) throw error;
                console.log('The solution is: ', results);
            });
            console.log(res);
            return {
                response: newResponse
            }
        }
        // 选择并返回答案
        if (requestDetail.url === 'https://question.hortor.net/question/bat/choose') {
            let newResponse = Object.assign({}, responseDetail.response)
            let res = JSON.parse(newResponse.body)
            console.log(res);
            return {
                response: newResponse
            }
        }
    },
    // 只代理host question.hortor.net
    * beforeDealHttpsRequest(requestDetail) {
        if (requestDetail.host && requestDetail.host.includes('question.hortor.net')) {
            return true
        }
        return false
    }
};