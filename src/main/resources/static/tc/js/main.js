var loginUserInfo;
//是否为测试模式
var isTest = true;
if (isTest) {
    loginUserInfo = {
        "userId": "0",
        "username": "admin",
        "password": null,
        "createTime": null,
        "dept": {"deptId": "0", "deptName": "管理员", "sign": "admin", "createTime": null}
    };
    $("#loginUserInfo_span").text("你好，" + loginUserInfo.username + "(" + loginUserInfo.dept.deptName + ")");
    loadTaskTableData(false);
    $("#createTask_btn").show();
} else {
    $.ajax({
        url: "/tc/loginUserInfo.do",
        type: "post",
        dataType: "json",
        success: function (responseData) {
            loginUserInfo = responseData;
            //初始化顶部登录用户信息
            $("#loginUserInfo_span").text("你好，" + loginUserInfo.username + "(" + loginUserInfo.dept.deptName + ")");
            if (loginUserInfo.dept.sign === 'admin') {
                $("#createTask_btn").show();
            }
            loadTaskTableData(false);
        }
    });
}

$("#logout_btn").on("click", function () {
    if (confirm("确定要注销吗？")) {
        $.ajax({
            url: "/tc/logout.do",
            success: function () {
                location.href = "login.html";
            }
        });
    }
});

//加载任务列表
function loadTaskTableData(isSearch) {
    if ($.fn.dataTable.isDataTable('#task_table')) {
        $('#task_table').DataTable().destroy();
    }
    $('#task_table').dataTable({
        //自动列宽
        'bAutoWidth': false,
        //加载数据时显示正在加载信息
        'bProcessing': true,
        //分页
        'paging': true,
        'bStateSave': false,
        'sScrollY': '503px', //支持垂直滚动
        //从服务器处理分页
        'bServerSide': true,
        //查询请求action url
        'ajax': {
            'url': '/tc/task/list.do',
            'type': 'post',
            'dataSrc': 'list'
        },
        // 客户端传给服务器的查询参数为sSearch,服务端根据条件查出数据源即可
        //'bFilter':true ,
        //本地搜索
        'searching': false,
        //每页显示多少条数据
        'lengthChange': false,
        //每页显示数量：15条记录
        'iDisplayLength': 10,
        'bInfo': true, //是否显示页脚信息，DataTables插件左下角显示记录数
        'sPaginationType': 'full_numbers', //详细分页组，可以支持直接跳转到某页
        'columns': [
            {
                'data': 'taskId', 'width': '5%', render: function (data) {
                return "&nbsp;&nbsp;<input type='checkbox' name='table_ids' value='" + data + "'>";
            }
            },
            {
                'data': 'taskName', 'width': '20%', render: function (data) {
                return "&nbsp;&nbsp;" + data;
            }
            },
            {
                'data': 'type', 'width': '10%', render: function (data) {
                var html;
                if ("excel" === data) {
                    html = "Excel表格";
                } else if ("word" === data) {
                    html = "Word文档";
                } else {
                    html = "未知类型";
                }
                return "&nbsp;&nbsp;" + html;
            }
            },
            {
                'data': 'isFinish', 'width': '10%', render: function (data) {
                var html;
                if (data === 0) {
                    html = "<font color='#f00'>未完成</font>";
                } else {
                    html = "<font color='#00aa00'>已完成</font>";
                }
                return "&nbsp;&nbsp;" + html;
            }
            },
            {
                'data': 'createTime', 'width': '18%', render: function (data) {
                var html;
                var date = new Date(data);
                html = date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日 " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                return "&nbsp;&nbsp;" + html;
            }
            },
            {
                'data': 'createUser', 'width': '12%', render: function (data) {
                return "&nbsp;&nbsp;" + data.username + "(" + data.dept.deptName + ")";
            }
            },
            {
                'data': 'progress', 'width': '6%', render: function (data) {
                return "&nbsp;&nbsp;" + data;
            }
            },
            {
                'data': 'isFinish', 'width': '19%', render: function (data) {
                var html = "&nbsp;&nbsp;";
                if (loginUserInfo.dept.sign === 'admin') {
                    html += "<button class='progress_btn'>详细进度</button><button class='progress_btn'>查看规则</button>";
                } else if (data === 0) {
                    html += "<button class='progress_btn'>填写</button>";
                }
                return html;
            }
            }
        ],
        //语言
        'language': {
            url: 'internation/message_zh_CN.txt'
        },
        //排序
        'sort': false,
        'aaSorting': []
    });
}

//发布任务按钮事件
$("#createTask_btn").on("click", function () {
    creatTaskModalInit();
    $("#createTaskModal").modal("show");
});

function creatTaskModalInit(){
    $("#createTask_file_name").html("");
    $("#createTask_file_size").html("");
    $("#createTask_file_progress").html("");
    $("#createTask_file").show();
    $("#next_btn").attr("disabled", true);
}

//发布任务-上传事件
$('#createTask_file').fileupload({
    url: "/tc/task/upload.do",
    dataType: "json",
    add: function (e, data) {
        var fileName = data.originalFiles[0].name;
        var fileType = fileName.substring(fileName.lastIndexOf(".") + 1);
        if (fileType === "doc" || fileType === "docx" || fileType === "xls" || fileType === "xlsx") {
            $("#createTask_file_name").html(fileName);
            $("#createTask_file_size").html("<label>大小：</label>" + tools.fileSizeOf(data.originalFiles[0].size));
            data.submit();
        } else {
            $("#createTask_file_name").text("任务文件格式应为doc、docx、xls、xlsx");
            $("#createTask_file_size").html("");
            return false;
        }
    },
    progressall: function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $("#createTask_file_progress").html("，<label>进度：</label>" + progress + "%");
    },
    done: function (e, data) {
        $("#createTask_file_progress").html("，<label>进度：</label>已上传完成");
        $("#createTask_file").hide();
        $("#next_btn").attr("disabled", false);
    }
});

var tools = {
    fileSizeOf: function (size) {
        if (size >= 1024 * 1024) {
            return (size / (1024 * 1024)).toFixed(2) + "mb";
        } else {
            return (size / 1024).toFixed(0) + "kb";
        }
    }
};
