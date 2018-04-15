package club.yanghaobo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class MainController {

    @RequestMapping("/tc")
    public String index(){
        return "redirect:/tc/login.html";
    }
}
