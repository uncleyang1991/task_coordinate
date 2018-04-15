package club.yanghaobo.tool;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.beanutils.BeanMap;
import org.apache.commons.beanutils.BeanUtils;

import java.io.IOException;
import java.util.Map;

/**
 * Json工具类
 */
public class JsonTool {

    private static ObjectMapper mapper = new ObjectMapper();

    /**
     * 序列化
     */
    public static String obj2json(Object obj){
        String json = null;
        try {
            json = mapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return json;
    }

    /**
     * 反序列化
     */
    public static <T>T json2obj(String json,Class<T> clazz){
        T t = null;
        try {
            t = mapper.readValue(json,clazz);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return t;
    }

    /**
     *  结果json
     */
    public static String makeResultJson(boolean result,String msg){
        StringBuffer sb = new StringBuffer();
        sb.append("{\"success\":").append(result).append(",\"data\":\"").append(msg).append("\"}");
        return sb.toString();
    }


    public static Object mapToObject(Map<String, Object> map, Class<?> beanClass){
        if (map == null)
            return null;

        Object obj = null;

        try{
            obj = beanClass.newInstance();
            BeanUtils.populate(obj, map);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return obj;
    }

    public static Map<?, ?> objectToMap(Object obj) {
        if(obj == null)
            return null;

        return new BeanMap(obj);
    }
}
