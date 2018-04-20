var taskId = getQueryString("taskId");
var taskName = getQueryString("taskName");

$("title").html(decodeURI(decodeURI(taskName)));

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

                var li = "<li " + (i === 0 ? "class=\"active\"" : "") + "><a href='#" + result[i] + "' data-toggle='tab'>" + result[i] + "</a></li>";
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
        }
    });
}

function drawTable(sheetName, result) {
    $("#" + sheetName + " table").html("");
    var rule = result.rule;
    var sheetMap = result.sheetMap;
    for (var y = 0, y_len = sheetMap.length; y < y_len; y++) {
        var tr_arr = sheetMap[y];
        var tr = $("<tr></tr>");
        for (var x = 0, x_len = tr_arr.length; x < x_len; x++) {
            var value = tr_arr[x].value;
            var td = $(tr_arr[x].html);
            td.html(value);
            td.data("x", x);
            td.data("y", y);
            tr.append(td);
        }
        $("#" + sheetName + " table").append(tr);
    }

    //启用保存和完成按钮
    $("#saveBtn").removeAttr("disabled");
    $("#finishBtn").removeAttr("disabled");
}

//返回任务列表事件
$("#returnBtn").on("click", function () {
    if (confirm("确定要返回任务列表吗？注意保存")) {
        location.href = "main.html";
    }
});

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}