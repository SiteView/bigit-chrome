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