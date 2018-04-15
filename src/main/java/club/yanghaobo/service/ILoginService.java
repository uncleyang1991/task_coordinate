package club.yanghaobo.service;

import club.yanghaobo.entity.User;
import club.yanghaobo.exception.LoginException;

public interface ILoginService {

    User login(String username, String password) throws LoginException;
}
