//当前登录的用户信息
var loginUserInfo;
//准备要发布的任务对象
var newTask = {};
//是否为测试模式
var isTest = false;
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

//注销按钮事件
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
                if ("xls" === data || "xlsx" === data) {
                    html = "Excel表格";
                } else if ("doc" === data || "docx" === dta) {
                    html = "Word文档";
                } else {
                    html = "未知类型";
                }
                return "&nbsp;&nbsp;" + html;
            }
            },
            {
                'data': 'isFinish', 'width': '10%', render: function (data) {
                var span = $("<font color='#000'></font>");
                span.data("isFinish",data);
                if (data === 0) {
                    span.attr("color","#f00");
                    span.html("未完成");
                } else {
                    span.attr("color","#0a0");
                    span.html("已完成");
                }
                return "&nbsp;&nbsp;" + span[0].outerHTML;
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
                    html += "<button class='progress_btn' onclick='openDetailedProgressModal(this)'>详细进度</button><button class='progress_btn'>查看规则</button>";
                } else if (data === 0) {
                    html += "<button class='progress_btn' onclick='openTaskInputWindow(this)'>填写</button>";
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

//填写任务
function openTaskInputWindow(btn){
    var taskId = $(btn).parent().siblings().eq(0).children("input").val();
    var taskName =$(btn).parent().siblings().eq(1).text();
    location.href = "sheet.html?taskId="+taskId+"&taskName="+encodeURI(encodeURI(taskName.trim()));
}

//打开详细进度模态框
function openDetailedProgressModal(btn) {
    var taskId = $(btn).parent().siblings().eq(0).children("input").val();
    var taskName = $(btn).parent().siblings().eq(1).text();
    $("#detailedProgressModal").data("taskId",taskId);
    $("#detailedProgressTable").children().eq(1).html("");
    $("#detailedProgressModal_taskName").html(taskName);
    $("#detailedProgressModal_downloadBtn").on("click",function(){
        location.href = "/tc/task/download.do?taskId="+taskId;
    });
    var finishText = $(btn).parent().siblings().eq(3).children().eq(0).text();
    if("已完成" === finishText){
        $("#detailedProgressModal_finishBtn").hide();
    }else{
        $("#detailedProgressModal_finishBtn").show();
    }
    $("#detailedProgressModal").modal("show");
    $.ajax({
        url: "/tc/task/detailedProgress.do",
        type: "post",
        dataType: "json",
        data: {
            taskId: taskId
        },
        success: function (result) {
            for (var i = 0, len = result.length; i < len; i++) {
                var finishHtml;
                if (result[i].is_finish === 0) {
                    finishHtml = "<font color='#f00'>未完成</font>";
                } else if (result[i].is_finish === 1) {
                    finishHtml = "<font color='#149a15'>已完成</font>";
                }
                var tr = $("<tr>" +
                    "<td>" + result[i].dept_name + "</td>" +
                    "<td>" + finishHtml + "</td>" +
                    "</tr>");
                tr.data("taskId", taskId);
                tr.data("deptId", result[i].dept_id);
                $("#detailedProgressTable").children().eq(1).append(tr);
            }
        }
    });

}

//详细进度-完成此任务按钮事件
$("#detailedProgressModal_finishBtn").on("click",function(){
    var btn = $(this);
    if(confirm("确定要完成此任务吗？")){
        var taskId = $("#detailedProgressModal").data("taskId");
        $.ajax({
            url:"/tc/task/finishTask.do",
            type:"post",
            dataType:"json",
            data:{
                taskId:taskId
            },
            success:function(result){
                btn.hide();
                loadTaskTableData();
            }
        });
    }
});

//发布任务按钮事件
$("#createTask_btn").on("click", function () {
    creatTaskModalInit();
    $("#createTaskModal").modal("show");
});

function creatTaskModalInit() {
    newTask = {};
    $("#createTaskModalHead>h4").html("发布任务-上传任务文件");
    $("#createTask_file_name").html("");
    $("#createTask_file_size").html("");
    $("#createTask_file_progress").html("");
    $("#createTaskDeptSelect").html("<option>请选择分局</option>");
    $("#createTaskSheetSelect").html("<option>请选择工作表</option>");
    $("#createTaskRuleDiv").html("");
    $("#createTask_file").show();
    $("#next_btn").attr("disabled", true);
    $("#createTaskUploadModalBody").show();
    $("#createTaskAllotModalBody").hide();
    $("#cancel_btn").show();
    $("#next_btn").show();
    $("#enter_btn").removeAttr("disabled");
    $("#enter_btn").val("确认发布");
    $("#enter_btn").hide();

    loadDeptSelect();
}

//发布任务模态框关闭事件
$("#createTaskModalCloseButton,#cancel_btn").on("click", function () {
    if (confirm("确定要取消发布该任务吗？这将会删除关于此任务的所有信息")) {
        $.ajax({
            url: "/tc/task/cancelCreateTask.do",
            type: "post",
            data: {
                fileName: newTask.fileId ? newTask.fileId : "@none",
                fileType: newTask.fileType ? newTask.fileType : "@none"
            }
        });
        newTask = {};
        $("#createTaskModal").modal("hide");
    }
});

//读取分局列表
function loadDeptSelect() {
    $.ajax({
        url: "/tc/dept/list.do",
        dataType: "json",
        success: function (result) {
            for (var i = 0, len = result.length; i < len; i++) {
                var option_html = "<option>" + result[i].deptName + "</option>";
                var option = $(option_html);
                option.sign = result[i].sign;
                $("#createTaskDeptSelect").append(option);
            }
            newTask.dept = result;
        }
    });
}

//发布任务-上传事件
$('#createTask_file').fileupload({
    url: "/tc/task/upload.do",
    dataType: "json",
    add: function (e, data) {
        var fileName = data.originalFiles[0].name;
        var fileType = fileName.substring(fileName.lastIndexOf(".") + 1);
        if (fileType === "xls" || fileType === "xlsx") {
            $("#createTask_file_name").html(fileName);
            $("#createTask_file_size").html("<label>大小：</label>" + tools.fileSizeOf(data.originalFiles[0].size));
            data.submit();
        } else {
            $("#createTask_file_name").text("任务文件格式应为xls、xlsx");
            $("#createTask_file_size").html("");
            return false;
        }
    },
    progressall: function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $("#createTask_file_progress").html("，<label>进度：</label>" + progress + "%");
    },
    done: function (e, data) {

        var fileName = data.originalFiles[0].name;
        var fileType = fileName.substring(fileName.lastIndexOf(".") + 1);
        var result = data.result;
        if (result.success) {
            $("#createTask_file_progress").html("，<label>进度：</label>已上传完成");
            $("#createTask_file").hide();
            $("#next_btn").attr("disabled", false);
            newTask.fileName = fileName.substring(0, fileName.lastIndexOf("."));
            newTask.fileId = result.data;
            newTask.fileType = fileType;
        } else {
            $("#createTask_file_progress").html("，<label>进度：</label>上传失败!");
        }
    }
});

//发布任务-下一步按钮事件
$("#next_btn").on("click", function () {
    $.ajax({
        url: "/tc/task/sheetList.do",
        type: "post",
        data: {
            fileName: newTask.fileId,
            fileType: newTask.fileType
        },
        dataType: "json",
        success: function (result) {
            var dept = newTask.dept;
            for (var i = 0, len = result.length; i < len; i++) {
                $("#createTaskSheetSelect").append("<option>" + result[i] + "</option>");
            }
        }
    });
    $("#createTaskModalHead>h4").html("发布任务-分配任务");
    $("#createTaskUploadModalBody").hide();
    $("#createTaskAllotModalBody").show();
    $("#next_btn").hide();
    $("#enter_btn").show();
});

//发布任务-分配任务-分局select和工作表select选择事件
$("#createTaskDeptSelect,#createTaskSheetSelect").on("change", function () {
    var deptVal = $("#createTaskDeptSelect").val();
    var sheetVal = $("#createTaskSheetSelect").val();
    var ruleArr;
    $("#createTaskRuleDiv").html("");
    for (var i = 0, dept_len = newTask.dept.length; i < dept_len; i++) {
        if (deptVal === newTask.dept[i].deptName && newTask.dept[i].sheet) {
            for (var j = 0, sheet_len = newTask.dept[i].sheet.length; j < sheet_len; j++) {
                if (sheetVal === newTask.dept[i].sheet[j].sheetName) {
                    ruleArr = newTask.dept[i].sheet[j].rule;
                    break;
                }
            }
            break;
        }
    }
    if (ruleArr) {
        for (var k = 0, rule_len = ruleArr.length; k < rule_len; k++) {
            //获取规则模板
            var ruleTemp = $($("#createTaskRuleTemplate").html());
            //增加一个是否确定的标志
            ruleTemp.data("isEnter", true);
            var children = ruleTemp.children();
            $(children[1]).val(ruleArr[k].range);
            $(children[1]).attr("disabled", "disabled");
            $(children[3]).val(ruleArr[k].formatType);
            $(children[3]).attr("disabled", "disabled");
            if (ruleArr[k].formatType === "自定义") {
                $(children[4]).val(ruleArr[k].custom);
                $(children[4]).attr("disabled", "disabled");
                $(children[4]).show();
            }
            $(children[5]).hide();
            $("#createTaskRuleDiv").append(ruleTemp);
        }
    }
});

//发布任务-分配任务-规则-增加按钮事件
$("#createTaskRuleButton").on("click", function () {
    var deptVal = $("#createTaskDeptSelect").val();
    var sheetVal = $("#createTaskSheetSelect").val();
    if (deptVal === "请选择分局" || sheetVal === "请选择工作表") {
        return false;
    }
    //获取规则模板
    var ruleTemp = $($("#createTaskRuleTemplate").html());
    //增加一个是否确定的标志
    ruleTemp.data("isEnter", false);
    $("#createTaskRuleDiv").append(ruleTemp);
});

//发布任务-分配任务-规则-格式选择事件
function createTaskRuleSelect(item) {
    var selected = $(item).val();
    if ("自定义" === selected) {
        $(item).siblings().eq(3).show();
    } else {
        $(item).siblings().eq(3).hide();
    }
}

//发布任务-分配任务-规则-确定按钮事件
function createTaskRuleEnter(item) {
    var parentDiv = $(item).parent();
    var range = $($(item).siblings()[1]);
    var select = $($(item).siblings()[3]);
    var custom = $($(item).siblings()[4]);

    var deptSelect = $("#createTaskDeptSelect");
    var sheetSelect = $("#createTaskSheetSelect");
    //检验范围格式
    var reg = /^[A-Z]+[0-9]+:[A-Z]+[0-9]+$/;
    if (!reg.test(range.val())) {
        alert("范围表达式错误,例:C7:C19");
        return false;
    }
    if (select.val() === "自定义") {
        var flag = false;
        var customVal = custom.val();
        //自定义表达式,目前只有select,以后可以追加  @select:
        if (customVal.substring(0, 8) === "@select:") {
            if (customVal.substring(8).split(",").length > 1 && customVal.lastIndexOf(",") !== customVal.length - 1) {
                $($(item).siblings()[4]).attr("disabled", "true");
                flag = true;
            }
        }
        if (!flag) {
            alert("自定义表达式错误,例:@select:选项一,选项二");
            return flag;
        }
    }

    for (var i = 0, dept_len = newTask.dept.length; i < dept_len; i++) {
        var czDept = newTask.dept[i];
        if (deptSelect.val() === czDept.deptName) {
            if (!czDept.sheet) {
                czDept.sheet = new Array();
                czDept.sheet[czDept.sheet.length] = {
                    sheetName: sheetSelect.val(),
                    rule: new Array()
                };
            }
            var sheetFlag = false;
            for (var j = 0, sheet_len = czDept.sheet.length; j < sheet_len; j++) {
                var czSheet = czDept.sheet[j];
                if (sheetSelect.val() === czDept.sheet[j].sheetName) {
                    czSheet.rule[czSheet.rule.length] = {
                        range: range.val(),
                        formatType: select.val(),
                        custom: custom.val()
                    };
                    sheetFlag = true;
                    break;
                }
            }
            if (!sheetFlag) {
                czDept.sheet[czDept.sheet.length] = {
                    sheetName: sheetSelect.val(),
                    rule: new Array()
                };
                for (var k = 0, sheet1_len = czDept.sheet.length; k < sheet1_len; k++) {
                    var czSheet_ = czDept.sheet[k];
                    if (sheetSelect.val() === czDept.sheet[k].sheetName) {
                        czSheet_.rule[czSheet_.rule.length] = {
                            range: range.val(),
                            formatType: select.val(),
                            custom: custom.val()
                        };
                        break;
                    }
                }
            }
            break;
        }
    }

    $(item).remove();
    range.attr("disabled", "true");
    select.attr("disabled", "true");
    parentDiv.data("isEnter", true);
}

//发布任务-分配任务-规则-删除按钮事件
function createTaskRuleDelete(item) {
    var parentDiv = $(item).parent();
    var deptSelect = $("#createTaskDeptSelect");
    var sheetSelect = $("#createTaskSheetSelect");
    var range = $($(item).siblings()[1]);
    if (parentDiv.data("isEnter")) {
        for (var i = 0, dept_len = newTask.dept.length; i < dept_len; i++) {
            if (deptSelect.val() === newTask.dept[i].deptName) {
                for (var j = 0, sheet_len = newTask.dept[i].sheet.length; j < sheet_len; j++) {
                    if (sheetSelect.val() === newTask.dept[i].sheet[j].sheetName) {
                        for (var k = 0, rule_len = newTask.dept[i].sheet[j].rule.length; k < rule_len; k++) {
                            if (range.val() === newTask.dept[i].sheet[j].rule[k].range) {
                                newTask.dept[i].sheet[j].rule.splice(k, 1);
                                if (newTask.dept[i].sheet[j].rule.length === 0) {
                                    newTask.dept[i].sheet.splice(j, 1);
                                    if (newTask.dept[i].sheet.length === 0) {
                                        delete newTask.dept[i].sheet;
                                    }
                                }
                                break;
                            }
                        }
                        break;
                    }
                }
                break;
            }
        }
    }
    parentDiv.remove();
}

//发布任务-确认发布按钮事件
$("#enter_btn").on("click", function () {
    var flag = false;
    for (var i = 0, dept_len = newTask.dept.length; i < dept_len; i++) {
        if (newTask.dept[i].sheet && newTask.dept[i].sheet.length > 0) {
            flag = true;
            break;
        }
    }
    if (flag) {
        $("#cancel_btn").hide();
        $("#enter_btn").val("正在发布");
        $("#enter_btn").attr("disabled", "disabled");
        $.ajax({
            url: "/tc/task/createTask.do",
            type: "post",
            dataType: "json",
            data: {
                taskJson: JSON.stringify(newTask)
            },
            success: function (result) {
                if (result.success) {
                    $("#createTaskModal").modal("hide");
                    newTask = {};
                    loadTaskTableData();
                } else {
                    $("#cancel_btn").show();
                    $("#enter_btn").removeAttr("disabled");
                    $("#enter_btn").val("确认发布");
                    alert("发布任务失败");
                }
            }
        });
    } else {
        alert("至少要为一个分局分配一个工作表的规则");
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
