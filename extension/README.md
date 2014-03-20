bigit-chrome
============

bigit for chrome

### 下载app:
http://package.1mobile.com/d.php?pkg=@appName@&channel=304

### adb 安装 on Ubuntu：

1. 安装sdk
2. 复制adb工具
```shell
sudo cp -r sdk /opt
```
3.  安装adb服务到开机启动
```shell
sudo vim /etc/init.d/adb
```
粘贴一下内容：
```shell
#!/bin/sh
case "$1" in
   start)
         # Start daemon.
         echo -n "Starting ADB: "
         /opt/sdk/platform-tools/adb start-server
         ;;
   stop)
         # Stop daemons.
         echo -n "Shutting ADB: "
         /opt/sdk/platform-tools/adb kill-server
         ;;
   restart)
         $0 stop
         $0 start
         ;;
   *)
         echo "Usage: $0 {start|stop|restart}"
         exit 1
esac

exit 0
```

运行一下命令：
```
cd /etc/init.d/
sudo chown root:root adb
sudo update-rc.d adb defaults
sudo chmod +x adb
```

4. 编辑环境变量
```shell
sudo vim /etc/environment
```
在PATH后面添加：
```shell
/opt/platform-tools
```
最后PATH类似这样：
``` shell
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt/sdk/tools:/opt/sdk/platform-tools"
```

5. 重启机器。运行：
```shell
sudo chmod -R 777 /opt/sdk
```

6.测试。运行：
```
adb 
```

### Ubuntu 启动虚拟机
```shell
emulator-arm -avd avd_name
```

### Plugin API
```c
const char *kDoCommand =    "DoCommand";
const char *kAaptCommand =  "AaptCommand";
const char *kGetDeviceInfo = "GetDeviceInfo";
const char *kGetStorageInfo = "GetStorageInfo";
const char *kGetAppList = "GetAppList";
const char *kGetPictureList = "GetPictureList";
const char *kGetVideoList = "GetVideoList";
const char *kGetMusicList = "GetMusicList"; //
const char *kGetAddressBook = "GetAddressBook";//通信录
const char *kGetSMSList = "GetSMSList"; // 短信列表
const char *kDoInstall = "DoInstall"; // 安装
const char *kDoUninstall = "DoUninstall"; // 卸载
const char *kCheckDevice = "CheckDevice"; 
const char *kCheckApplist = "CheckApplist";

GetFilelist
std::string PushFile(const std::string& localFile,const std::string& remoteFile);
std::string PullFile(const std::string& remoteFile,const std::string& localFile);
GetStorageInfo(const std::string& arg);
std::string GetPictureList(const std::string& arg);
std::string GetVideoList(const std::string& arg);
std::string GetMusicList(const std::string& arg);
```


### ProtoBuf
protobuf的默认安装路径是/usr/local/lib，而/usr/local/lib 不在Ubuntu体系默认的 LD_LIBRARY_PATH 里，所以就找不到该lib
解决方法:
创建文件 /etc/ld.so.conf.d/libprotobuf.conf 包含内容：
```shell
/usr/local/lib 
```
然后运行命令：
```shell
sudo ldconfig 
```