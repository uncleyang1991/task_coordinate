package club.yanghaobo.controller;

import club.yanghaobo.entity.User;
import club.yanghaobo.exception.LoginException;
import club.yanghaobo.service.ILoginService;
import club.yanghaobo.tool.JsonTool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;

@RestController
@RequestMapping("/tc")
public class LoginController {

    @Autowired
    private ILoginService loginService;

    @RequestMapping("/login.do")
    public String login(HttpSession session, @RequestParam("username")String username, @RequestParam("password")String password){
        User user;
        try{
            user = loginService.login(username, password);
        }catch (LoginException e){
            return JsonTool.makeResultJson(false, e.getMessage());
        }
        user.setPassword(null);
        session.setAttribute("loginUserInfo", user);
        return JsonTool.makeResultJson(true, null);
    }

    @RequestMapping("/loginUserInfo.do")
    public String loginInfo(HttpSession session){
        Object obj = session.getAttribute("loginUserInfo");
        if(obj != null){
            User user = (User)obj;
            return JsonTool.obj2json(user);
        }
        return JsonTool.makeResultJson(false, null);
    }

    @RequestMapping("/logout.do")
    public String logout(HttpSession session){
        session.removeAttribute("loginUserInfo");
        return JsonTool.makeResultJson(true, null);
    }
}
