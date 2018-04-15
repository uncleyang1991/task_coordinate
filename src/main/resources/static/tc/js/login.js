$(function(){
    $("#login_button").on("click",function(){
        var username = $("#username_input").val();
        var password = $("#password_input").val();
        if(checkInput(username, password)){
            $.ajax({
                url:"/tc/login.do",
                type:"post",
                data:{
                    username:username,
                    password:password
                },
                dataType:"json",
                success:function(responseData){
                    if(responseData.success){
                        location.href = "main.html";
                    }else{
                        alert(responseData.data);
                    }
                }
            });
        }
    });
});

function checkInput(username, password){
    var flag = true;
    if(username === null || username.trim() === ''){
        flag = false;
    }else if(password === null || password.trim() === ''){
        flag = false;
    }
    return flag;
}