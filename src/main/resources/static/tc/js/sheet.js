var taskId = getQueryString("taskId");
var taskName = getQueryString("taskName");
var sheetNameList;

$("title").html("任务：" + decodeURI(decodeURI(taskName)));

if (!taskId) {
    alert("参数错误");
    window.opener = null;
    window.open('', '_self');
    window.close();
}

$(function () {
    loadTab();
});

function loadTab() {
    $.ajax({
        url: "/tc/task/sheetNameByDept.do",
        type: "post",
        dataType: "json",
        data: {
            taskId: taskId
        },
        success: function (result) {
            sheetNameList = result;
            var fristSheetName;
            if (result.length === 0) {
                alert("此任务没有您需要填写的内容");
                location.href = "main.html";
            }
            $("#topBarDiv").show();
            $("#contentDiv").show();
            for (var i = 0, sheet_len = result.length; i < sheet_len; i++) {
                if (i === 0) {
                    fristSheetName = result[0];
                }
                var div = "<div class='tab-pane fade" + (i === 0 ? " in active" : "") + "' id='" + result[i] + "'>" +
                    "<table style='border-collapse:collapse'></table>" +
                    "</div>";
                $("#tabContentDiv").append(div);

                var li = "<li " + (i === 0 ? "class='active'" : "") + "><a href='#" + result[i] + "' data-toggle='tab'>" + result[i] + "</a></li>";
                $("#tabUl").append(li);
            }

            loadSheetTable(fristSheetName);

            //切换标签页事件
            $("#tabUl a").on("show.bs.tab", function (e) {
                var sheetName = $(e.target).text();
                loadSheetTable(sheetName);
            });
        }
    });
}

//加载工作表
function loadSheetTable(sheetName) {
    if($("#"+sheetName).data("isDraw") === true){
        return false;
    }
    $.ajax({
        url: "/tc/task/sheetMap.do",
        type: "post",
        dataType: "json",
        data: {
            taskId: taskId,
            sheetName: sheetName
        },
        success: function (result) {
            drawTable(sheetName, result);
            $("#"+sheetName).data("isDraw",true);
        }
    });
}

//绘制工作表表格
function drawTable(sheetName, result) {
    $("#" + sheetName + " table").html("");
    var rule = result.rule;
    var ruleTemp = new Array(rule.length);
    for (var i = 0, rule_len = rule.length; i < rule_len; i++) {
        var range = rule[i].range.split(":");
        ruleTemp[i] = {};
        ruleTemp[i].fromX = letterToNumber(range[0].match(/^[a-z|A-Z]+/gi)[0]);
        ruleTemp[i].fromY = range[0].match(/\d+$/gi)[0] - 1;
        ruleTemp[i].toX = letterToNumber(range[1].match(/^[a-z|A-Z]+/gi)[0]);
        ruleTemp[i].toY = range[1].match(/\d+$/gi)[0] - 1;
        ruleTemp[i].formatType = rule[i].formatType;
        ruleTemp[i].custom = rule[i].custom;
    }
    var sheetMap = result.sheetMap;
    for (var y = 0, y_len = sheetMap.length; y < y_len; y++) {
        var tr_arr = sheetMap[y];
        var tr = $("<tr></tr>");
        for (var x = 0, x_len = tr_arr.length; x < x_len; x++) {
            var value = tr_arr[x].value;
            var td = $(tr_arr[x].html);
            td.html("");
            //加入规则
            for (var rule_index = 0, len = ruleTemp.length; rule_index < len; rule_index++) {
                rule = ruleTemp[rule_index];
                if (x >= rule.fromX && x <= rule.toX && y >= rule.fromY && y <= rule.toY) {
                    td.attr("align","left");
                    td.attr("valign","middle");
                    var formatType = rule.formatType;
                    var com;
                    if ("是或否" === formatType) {
                        com = $("<select><option " + (value === "是" ? "selected" : "") + ">是</option><option " + (value === "否" ? "selected" : "") + ">否</option></select>");
                    } else if ("数字" === formatType) {
                        com = $("<input type='number' style='width: 95%;'>");
                        com.val(value);
                    } else if ("文本" === formatType) {
                        com = $("<input type='text' style='width: 95%;'>");
                        com.val(value);
                    } else if ("自定义" === formatType) {
                        var custom = rule.custom;
                        com = customInput(custom, value);
                    }
                    td.data("isInput", "isInput");
                    td.data("isChange", false);
                    $(com).on("change", function () {
                        $($(this).parent()).data("isChange", true);
                    });
                    td.append(com);
                    break;
                }
            }
            td.data("x", x);
            td.data("y", y);
            if (td.data("isInput") !== "isInput") {
                td.html(value);
            }
            tr.append(td);
        }
        $("#" + sheetName + " table").append(tr);
    }

    //启用保存和完成按钮
    $("#saveBtn").text("保存");
    $("#saveBtn").removeAttr("disabled");
    $("#finishBtn").removeAttr("disabled");
}

//自定义类型
function customInput(custom, value) {
    if (!custom) return false;
    //自定义选择器 @select:
    if (custom.substring(0, 8) === "@select:") {
        var valueList = custom.substring(8).split(",");
        var select = $("<select></select>");
        for (var customSelect_index = 0, customSelect_len = valueList.length; customSelect_index < customSelect_len; customSelect_index++) {
            select.append("<option " + (valueList[customSelect_index] === value ? "selected" : "") + ">" + valueList[customSelect_index] + "</option>");
        }
        return select;
    } else {
        return false;
    }
}

//返回任务列表事件
$("#returnBtn").on("click", function () {
    if (confirm("确定要返回任务列表吗？注意保存")) {
        location.href = "main.html";
    }
});

//保存按钮事件
$("#saveBtn").on("click", function () {
    var inputMap = getInputMap();
    $.ajax({
        url:"/tc/task/saveTask.do",
        type:"post",
        dataType:"json",
        data:{
            obj:JSON.stringify(inputMap)
        },
        success:function(result){
            $("#saveResultSpan").show();
            if(result.success){
                $("#saveResultSpan").css("color","#26A13D");
                $("#saveResultSpan").text("保存成功");
            }else{
                $("#saveResultSpan").css("color","#f00");
                $("#saveResultSpan").text("保存失败,请重试");
            }
            setTimeout(function(){
                $("#saveResultSpan").fadeOut("slow");
            },2000);
        }
    });
});

//完成填写按钮事件
$("#finishBtn").on("click",function(){
    if(confirm("确定要完成填写吗？确定后将无法继续填写该任务")){
        var inputMap = getInputMap();
        $.ajax({
            url:"/tc/task/finishTaskInput.do",
            type:"post",
            dataType:"json",
            data:{
                obj:JSON.stringify(inputMap)
            },
            success:function(result){
                if(result.success){
                    location.href = "main.html";
                }else{
                    alert("提交出错");
                }
            }
        });
    }
});

function getInputMap() {
    var result = {};
    result.taskId = taskId;
    result.inputMap = new Array(sheetNameList.length);

    for (var sheetNameList_index = 0, sheetNameList_len = sheetNameList.length; sheetNameList_index < sheetNameList_len; sheetNameList_index++) {
        var inputMap = {};
        inputMap.sheetName = sheetNameList[sheetNameList_index];

        var inputs = $("#" + sheetNameList[sheetNameList_index] + " table select,#" + sheetNameList[sheetNameList_index] + " table input");
        var changeInput = new Array();
        for (var i = 0, len = inputs.length; i < len; i++) {
            var td = $($(inputs[i]).parent());
            if (td.data("isChange") === true) {
                changeInput.push({
                    x:td.data("x"),
                    y:td.data("y"),
                    value:$(inputs[i]).val()
                });
                //td.data("isChange",false);
            }
        }
        inputMap.changeInput = changeInput;
        result.inputMap[sheetNameList_index] = inputMap;
    }
    return result;
}

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

function letterToNumber(str) {
    var num = 0;
    for (var i = 0, len = str.length; i < len; i++) {
        num += str.charCodeAt(i) - 65;
        if (i !== 0) {
            num += 1;
        }
    }
    return num;
}