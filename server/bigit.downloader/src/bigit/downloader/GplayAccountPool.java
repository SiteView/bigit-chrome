package bigit.downloader;

import java.util.ArrayList;
import java.util.Calendar;

/*
 * Google Play Account pool
 */
public class GplayAccountPool {
	private ArrayList<GplayAccount> gAccounts;
	public static long ACCOUNT_LIMIT = 20000;
	private static GplayAccountPool instance;

	
	/*
	 * init account pool
	 */
	public synchronized void initPool(){
		gAccounts = new ArrayList<GplayAccount>();
		gAccounts.add(new GplayAccount("shixianfang@gmail.com","","386D196C72B46ab2"));
		
		
		/* thread to reset use count*/
		new Thread(new Runnable(){

			@Override
			public void run() {
				Calendar last = Calendar.getInstance();  
				int lastDay = last.get(Calendar.DAY_OF_MONTH);
				for(;;){
					try {
						Thread.sleep(10000);
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
					Calendar now = Calendar.getInstance();  
					int nowDay = now.get(Calendar.DAY_OF_MONTH);
					if (nowDay != lastDay){
						lastDay = nowDay;
						for(GplayAccount ga:gAccounts){
							ga.resetUseCount();
						}
					}
				}
				
			}}).start();
	}
	
	/*
	 * get a valid google account
	 */
	public synchronized GplayAccount getOne(){
		for(GplayAccount ga:gAccounts){
			if (ga.getUseCount() < ACCOUNT_LIMIT){
				ga.addUseCount();
				return ga;
			}
		}
		return null;
	}
	
	/*
	 * Pool instance
	 */
	public static GplayAccountPool Instance(){
		if (instance==null){
			instance = new GplayAccountPool();
			instance.initPool();
		}
		return instance;
	}
}
