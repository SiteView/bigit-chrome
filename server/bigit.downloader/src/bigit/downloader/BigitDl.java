package bigit.downloader;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

public class BigitDl implements javax.servlet.Servlet {

	@Override
	public void init(ServletConfig config) throws ServletException {
		// TODO Auto-generated method stub
		System.out.println("servlet init");
	}

	@Override
	public ServletConfig getServletConfig() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void service(ServletRequest req, ServletResponse res)
			throws ServletException, IOException {
		int b;
		String pkg = req.getParameter("pkg");
		javax.servlet.http.HttpServletResponse httpres = (HttpServletResponse) res;
		
		File f = new File("d:/cache/" + pkg + ".apk");

		if (f.exists()) {
			FileInputStream is = new FileInputStream(f);
			httpres.setHeader("Content-Disposition", "attachment; filename="
					+ pkg + ".apk");
			httpres.setContentLength((int) f.length());
			httpres.setContentType("application/vnd.android.package-archive");
			OutputStream os = res.getOutputStream();
			while ((b = is.read()) != -1) {
				os.write(b);
			}
			os.flush();
		} else {
			String strUrl = "http://package.1mobile.com/d.php?pkg=" + pkg
					+ "&channel=304";
			
			CloseableHttpClient httpclient = HttpClients.createDefault();

			HttpGet httpGet = new HttpGet(strUrl);
			CloseableHttpResponse response1 = httpclient.execute(httpGet);
			for (Header hd : response1.getAllHeaders()) {
				 System.out.println("header:[" + hd.getName()+
				 "]=["+hd.getValue()+"]");
				httpres.addHeader(hd.getName(), hd.getValue());
			}
			httpres.setHeader("Content-Disposition", "attachment; filename="
					+ pkg + ".apk");
			HttpEntity entity1 = response1.getEntity();
			InputStream is = entity1.getContent();

			FileOutputStream fos = new FileOutputStream(f);

			OutputStream os = res.getOutputStream();
			while ((b = is.read()) != -1) {
				os.write(b);
				fos.write(b);
			}
			os.flush();
			fos.close();
		}
		System.out.println("download done!");
	}

	@Override
	public String getServletInfo() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void destroy() {
		// TODO Auto-generated method stub

	}

}
