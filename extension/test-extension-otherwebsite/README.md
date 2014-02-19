### 扩展配置文件说明
```
{
    "manifest_version" ：配置文件版本号（chrome读取） 一般设置为 2,

    "name" ： 扩展名称,

    "description"：扩展描述,
    
    "version"： 扩展版本号,
    
    "plugins" ：{ //插件
        "path"：插件路径 以扩展的根目录为相对路径
        "pulic"：true or false 是否公共使用
    },
    
    "browser_action"：{ //扩展位于 工具栏
        "default_icon"： { //设置扩展图标logo
            "19":"icon.png",//根据浏览器像素自动选择
            "38":"icon.png"
        }，
        "default_title": "手机助手",//扩展工具栏标题
        "default_popup": "popup.html"//设置默认弹出菜单页面
    }

    "permissions":[...] //权限
    包括：
        contextMenus :右键菜单 具体代码查看test/contextMenus代码
        notifications：桌面通知
}
    "background":[ //背景
        "scripts": ["background.js"]  //js
    ]
    
    "options_page"："options.html"
    
```
### 相关属性说明
```
chrome.browserAction：

Badge：这个东西实际上和 扩展图标的作用差不多，通过相关api使用一个基于 HTML5 canvas 的元素作为扩展图标，可以实现动态效果。

```

  "background": {
    "page": "main.html"
  },
  "options_page": "options.html",


###编译相关
出现编译错误：
