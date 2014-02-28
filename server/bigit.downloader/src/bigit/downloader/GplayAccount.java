package bigit.downloader;

/*
 * Google Play Account info
 */
public class GplayAccount {
	private String name;			//user name
	private String pass;			//password
	private String androidId;  //device id
	private long useCount;		//count of use
	
	public GplayAccount(String name, String pass, String androidId) {
		super();
		this.pass = pass;
		this.androidId = androidId;
		this.name = name;
		this.useCount = 0;
	}
	
	/*
	 * login name
	 */
	public String getName() {
		return name;
	}
	/*
	 * login password
	 */
	public String getPass() {
		return pass;
	}
	
	/*
	 * android device id
	 */
	public String getAndroidId() {
		return androidId;
	}
	
	/*
	 * account use count
	 */
	public long getUseCount() {
		return useCount;
	}
	
	/*
	 * add use count
	 */
	public long addUseCount(){
		return ++useCount;
	}
	
	/*
	 * reset use count to 0
	 */
	public void resetUseCount(){
		useCount = 0;
	}
	
}
