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

import Siteview.IAuthenticationBundle;
import Siteview.Operators;
import Siteview.SiteviewException;
import Siteview.SiteviewQuery;
import Siteview.SiteviewValue;
import Siteview.UpdateResult;
import Siteview.Api.BusinessObject;
import Siteview.Api.ISiteviewApi;
import Siteview.Api.SiteviewApi;
import Siteview.Asd.AuthenticationBundle;
import Siteview.thread.IPrincipal;

public class BigitDl implements javax.servlet.Servlet {

	private ISiteviewApi api = null;
	private IPrincipal principal;
	private String localDir;

	@Override
	public void init(ServletConfig config) throws ServletException {
		localDir = "d:\\cache";
		boolean ret = initApi();
		System.out.println("bigit download servlet init:" + ret);
	}

	@Override
	public ServletConfig getServletConfig() {
		return null;
	}

	@Override
	public void service(ServletRequest req, ServletResponse res)
			throws ServletException, IOException {
		int b;
		String pkg = req.getParameter("pkg");
		javax.servlet.http.HttpServletResponse httpres = (HttpServletResponse) res;

		String filepath;
		filepath = getPath(pkg);
		
		//数据库里有记录
		if (filepath.length()>0) {
			File f = new File(localDir + File.separator +filepath);
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
			
			File fd = new File(localDir + File.separator +pkg.substring(0, 6) );
			if (!fd.exists()) fd.mkdirs();
			filepath = pkg.substring(0, 6)+File.separator + pkg + ".apk";
			File f = new File(localDir +File.separator +filepath);
			
			CloseableHttpClient httpclient = HttpClients.createDefault();

			HttpGet httpGet = new HttpGet(strUrl);
			CloseableHttpResponse response1 = httpclient.execute(httpGet);
			for (Header hd : response1.getAllHeaders()) {
				System.out.println("header:[" + hd.getName() + "]=["
						+ hd.getValue() + "]");
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
			//更新到数据库
			updateApkPath(pkg, filepath);
			System.out.println("download done!");
		}
	}

	/*
	 *  get apk location from database
	 */
	private String getPath(String pkg) {
		if (initApi()){
			Siteview.thread.Thread.set_CurrentPrincipal(principal);
			try{
			SiteviewQuery query =new SiteviewQuery();
			query.set_BusinessObjectName("MobileApp");
			query.set_BusObSearchCriteria(query.get_CriteriaBuilder().FieldAndValueExpression("AppId", Operators.Equals, pkg));
			BusinessObject bo = api.get_BusObService().GetBusinessObject(query);
			if (bo!=null){
				String rPath = bo.GetField("AppLocation").get_Value().ToText();
				return rPath;
			}
			}catch(SiteviewException e){
				e.printStackTrace();
			}
		}
		return "";
	}
	
	/*
	 * update apk's path,if not exist,create new one.
	 */
	public boolean updateApkPath(String apkId, String path){
		if (initApi()){
			Siteview.thread.Thread.set_CurrentPrincipal(principal);
			try{
				SiteviewQuery query =new SiteviewQuery();
				query.set_BusinessObjectName("MobileApp");
				query.set_BusObSearchCriteria(query.get_CriteriaBuilder().FieldAndValueExpression("AppId", Operators.Equals, apkId));
				BusinessObject bo = api.get_BusObService().GetBusinessObject(query);
				if (bo!=null){
					bo.GetField("AppLocation").SetValue(new SiteviewValue(path));
				}else{
					bo = api.get_BusObService().Create("MobileApp");
					bo.GetField("AppId").SetValue(new SiteviewValue(apkId));
					bo.GetField("AppLocation").SetValue(new SiteviewValue(path));
				}
				UpdateResult ur =bo.SaveObject(api, false, false);
				if (!ur.get_Success()){
					System.err.println(ur.get_ErrorMessages());
				}
			}catch(SiteviewException e){
				e.printStackTrace();
			}
		}
		return true;
	}

	@Override
	public String getServletInfo() {
		return null;
	}

	@Override
	public void destroy() {
	}

	/*
	 *  init siteview api
	 */
	private boolean initApi() {
		if (api == null) {
			api = SiteviewApi.get_CreateInstance();
		}
		try {
			if (api.get_LoggedIn()) return true;
			
			api.Connect(System.getProperty("bigit.downloader.connection"));
			// api.get_BusObEventPublisher().Register(new ServerSideRuleExecutor(api));

			IAuthenticationBundle ab = AuthenticationBundle.Create();
			ab.set_AuthenticationId(System.getProperty("bigit.downloader.username"));
			ab.set_Password(System.getProperty("bigit.downloader.password"));

			boolean ret = api.Login(ab);
			if (ret) {
			} else {
				api.Disconnect();
			}

			principal = Siteview.thread.Thread.get_CurrentPrincipal();
			return ret;
		} catch (SiteviewException e) {
			e.printStackTrace();
			return false;
		}
	}

}
