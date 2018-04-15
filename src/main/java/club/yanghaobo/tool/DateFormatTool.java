package club.yanghaobo.tool;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class DateFormatTool {

    private static SimpleDateFormat sdf = new SimpleDateFormat();

    public static Date strToDate(String pattern,String str){
        if(pattern==null){
            sdf.applyPattern("yyyy-MM-dd");
        }else{
            sdf.applyPattern(pattern);
        }
        Date date = null;
        try{
            date = sdf.parse(str);
        }catch (ParseException e) {
            e.printStackTrace();
        }
        return date;
    }

    public static String dateToStr(String pattern,Date date){
        if(pattern==null){
            sdf.applyPattern("yyyy-MM-dd");
        }else{
            sdf.applyPattern(pattern);
        }
        return sdf.format(date);
    }
}
