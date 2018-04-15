var loginUserInfo; //= {"userId":"0","username":"admin","password":null,"createTime":null,"dept":{"deptId":"0","deptName":"管理员","sign":"admin","createTime":null}};

$.ajax({
    url:"/tc/loginUserInfo.do",
    type:"post",
    dataType:"json",
    success:function(responseData){
        loginUserInfo = responseData;
        //初始化顶部登录用户信息
        $("#loginUserInfo_span").text("你好，"+loginUserInfo.username+"("+loginUserInfo.dept.deptName+")");
        if(loginUserInfo.dept.sign === 'admin'){
            $("#toolbar_div").show();
        }
        loadTaskTableData(false);
    }
});
//$("#loginUserInfo_span").text("你好，"+loginUserInfo.username+"["+loginUserInfo.dept.deptName+"]");

$("#logout_btn").on("click",function(){
    if(confirm("确定要注销吗？")){
        $.ajax({
            url:"/tc/logout.do",
            success:function(){
                location.href = "login.html";
            }
        });
    }
});

function loadTaskTableData(isSearch){
    if($.fn.dataTable.isDataTable('#task_table')){
        $('#task_table').DataTable().destroy();
    }
    $('#task_table').dataTable({
        //自动列宽
        'bAutoWidth': false,
        //加载数据时显示正在加载信息
        'bProcessing': true,
        //分页
        'paging': true,
        'bStateSave' : false,
        'sScrollY': '750px', //支持垂直滚动
        //从服务器处理分页
        'bServerSide': true,
        //查询请求action url
        'ajax': {
            'url': '/tc/task/list.do',
            'type':'post',
            'dataSrc': 'list'
        },
        // 客户端传给服务器的查询参数为sSearch,服务端根据条件查出数据源即可
        //'bFilter':true ,
        //本地搜索
        'searching': false,
        //每页显示多少条数据
        'lengthChange':false,
        //每页显示数量：15条记录
        'iDisplayLength': 15,
        'bInfo' : true, //是否显示页脚信息，DataTables插件左下角显示记录数
        'sPaginationType': 'full_numbers', //详细分页组，可以支持直接跳转到某页
        'columns': [
            {'data': 'taskId','width':'5%',render:function(data){
                return "&nbsp;&nbsp;<input type='checkbox' name='table_ids' value='"+data+"'>";
            }},
            {'data': 'taskName','width':'20%',render:function(data){
                return "&nbsp;&nbsp;"+data;
            }},
            {'data': 'type','width':'10%',render:function(data){
                return "&nbsp;&nbsp;"+data;
            }},
            {'data': 'isFinish','width':'10%',render:function(data){
                var html;
                if(data === 0){
                    html = "<font color='#f00'>未完成</font>";
                }else{
                    html = "<font color='#00aa00'>已完成</font>";
                }
                return "&nbsp;&nbsp;"+html;
            }},
            {'data': 'createTime','width':'18%',render:function(data){
                var html;
                var date = new Date(data);
                html = date.getFullYear()+"年"+(date.getMonth()+1)+"月"+date.getDate()+"日 "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
                return "&nbsp;&nbsp;"+html;
            }},
            {'data': 'createUser','width':'12%',render:function(data){
                return "&nbsp;&nbsp;"+data.username+"("+data.dept.deptName+")";
            }},
            {'data': 'progress','width':'5%',render:function(data){
                return "&nbsp;&nbsp;"+data;
            }},
            {'data': 'isFinish','width':'20%',render:function(data){
                var html = "&nbsp;&nbsp;";
                if(data === 0){
                    if(loginUserInfo.dept.sign === 'admin'){
                        html += "<button class='progress_btn'>详细进度</button>";
                    }else{
                        html += "<button class='progress_btn'>填写</button>";
                    }
                }
                return html;
            }}
        ],
        //语言
        'language': {
            url: 'internation/message_zh_CN.txt'
        },
        //排序
        'sort':false,
        'aaSorting': []
    });
}