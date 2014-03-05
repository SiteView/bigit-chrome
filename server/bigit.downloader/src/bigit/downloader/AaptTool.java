package bigit.downloader;

import java.io.IOException;
import java.io.LineNumberReader;

public class AaptTool {

	public static String[] unZip(String apkUrl, String logoUrl){
		//[0]:版本号;[1]包名;[2]应用名
	      String[] st = new String[3];
	      String tmp;
	      try {
			Process p =Runtime.getRuntime().exec("aapt d badging "+apkUrl);
			
			java.io.InputStreamReader isr = new java.io.InputStreamReader(p.getInputStream(),"UTF-8");
			LineNumberReader a = new LineNumberReader(isr);
			while((tmp = a.readLine())!=null){
				String[] nvs = tmp.split(":");
				if (nvs[0].equals("package")){
					String[] nvss = nvs[1].split(" ");
					for(String nv: nvss){
						if (nv.startsWith("versionName=")){
							st[0] = nv.substring(13, nv.length()-1);
						}else if (nv.startsWith("name=")){
							st[1] = nv.substring(6, nv.length()-1);
						}
					}
				}else if (nvs[0].equals("application-label")){
					st[2] = nvs[1].substring(1, nvs[1].length() -1);
				}
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	      
	      return st;
	}
}
