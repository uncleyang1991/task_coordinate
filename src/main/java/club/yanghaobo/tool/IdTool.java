package club.yanghaobo.tool;

import java.util.UUID;

/**
 * ID工具类
 */
public class IdTool {

    /**
     * 获取一个UUID
     */
    public static String getUUID(){
        String[] arr = UUID.randomUUID().toString().split("-");
        StringBuffer sb = new StringBuffer();
        for(String str:arr){
            sb.append(str);
        }
        return sb.toString();
    }
}
