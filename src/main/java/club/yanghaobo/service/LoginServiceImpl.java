package club.yanghaobo.service;

import club.yanghaobo.base64.Base64Encode;
import club.yanghaobo.dao.UserDao;
import club.yanghaobo.entity.User;
import club.yanghaobo.exception.LoginException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LoginServiceImpl implements ILoginService{

    @Autowired
    private UserDao userDao;

    @Override
    public User login(String username, String password) throws LoginException{
        User user = userDao.getUserInfoByUsername(username);
        if(user == null){
            throw new LoginException("用户不存在");
        }else if(!user.getPassword().equals(Base64Encode.encode(password))){
            throw new LoginException("密码错误");
        }
        return user;
    }
}
