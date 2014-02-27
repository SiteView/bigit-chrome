package bigit.downloader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;

import org.apache.http.Header;
import org.apache.http.HeaderElement;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.ExecutionContext;
import org.apache.http.protocol.HttpContext;

public class ApkPull {
	public static final String LAST_REDIRECT_URL = "last_redirect_url";
	public static void main(String[] argv) {
		int b;
		String strUrl = "http://down.mumayi.com/%s";
		String localDir = "d:\\apk\\";
		try {
			
			for (int i = 100; i < 1000; i++) {
				CloseableHttpClient httpclient = HttpClients.createDefault();
				Thread.sleep(100);
				String url = String.format(strUrl,i);
				HttpGet httpGet = new HttpGet(url);
				HttpContext context = new BasicHttpContext(); 
				CloseableHttpResponse response1 = httpclient.execute(httpGet,context);
				if (response1.getStatusLine().getStatusCode() == 404)
					continue;
				HttpEntity entity1 = response1.getEntity();

				String name = getUrlAfterRedirects(context);
				name = name.substring(name.lastIndexOf('/')+1);
				if (name.contains("404"))
					continue;
				System.out.println("[" +i +"]" + name);
				FileOutputStream fos = new FileOutputStream(localDir + name);
				try{
					InputStream is = entity1.getContent();
					while ((b = is.read()) != -1) {
						fos.write(b);
					}
					is.close();
					fos.close();
				}catch(Exception e1){
					e1.printStackTrace();
					File f = new File(localDir + name);
					f.delete();
				}
				response1.close();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	    public static String getFileName(HttpResponse response) {  
		        Header contentHeader = response.getFirstHeader("Content-Disposition");  
		        String filename = null;  
		        if (contentHeader != null) {  
		            HeaderElement[] values = contentHeader.getElements();  
		            if (values.length == 1) {  
		                NameValuePair param = values[0].getParameterByName("filename");  
		                if (param != null) {  
		                    try {  
		                        //filename = new String(param.getValue().toString().getBytes(), "utf-8");  
		                        //filename=URLDecoder.decode(param.getValue(),"utf-8");  
		                        filename = param.getValue();  
		                    } catch (Exception e) {  
		                        e.printStackTrace();  
		                    }  
		                }  
		            }  
		        }  
		        return filename;  
		   } 
	    
	    private static String getUrlAfterRedirects(HttpContext context) {
	        String lastRedirectUrl = (String) context.getAttribute(LAST_REDIRECT_URL);
	        if (lastRedirectUrl != null)
	            return lastRedirectUrl;
	        else {
	            HttpUriRequest currentReq = (HttpUriRequest) context.getAttribute(ExecutionContext.HTTP_REQUEST);
	            HttpHost currentHost = (HttpHost)  context.getAttribute(ExecutionContext.HTTP_TARGET_HOST);
	            String currentUrl = (currentReq.getURI().isAbsolute()) ? currentReq.getURI().toString() : (currentHost.toURI() + currentReq.getURI());
	            return currentUrl;
	        }
	    }
}
