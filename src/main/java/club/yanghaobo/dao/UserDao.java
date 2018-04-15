package club.yanghaobo.dao;

import club.yanghaobo.entity.User;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserDao {

    User getUserInfoByUsername(@Param("username")String username);
}
