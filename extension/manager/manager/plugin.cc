//////////////////////////////////////////////////
//
// CPlugin class implementation
//

#include "phone.pb.h"
#include<string>
#include <string.h>
#include <stdlib.h>
#include "plugin.h"
#if defined(WIN32)
#include <Windows.h>
#include <atlstr.h>
#include <sstream>
#include <iostream>
#include <fstream>
#endif


#include <TinyThread/tinythread.h>
#include <TinyThread/fast_mutex.h>


#include "GetDataObject.h"
#include <Tool.h>


#include <json/json.h>

#include <base64/base64.h>


#include "Logger.h"
#ifndef WIN32
#include "iconv.h"
#endif

// 接口定义
const char *kDoCommand =    "DoCommand";
const char *kAaptCommand =  "AaptCommand";
const char *kGetDeviceInfo = "GetDeviceInfo";
const char *kGetStorageInfo = "GetStorageInfo";
const char *kGetAppList = "GetAppList";
const char *kGetPictureList = "GetPictureList";const char *kGetVideoList = "GetVideoList";
const char *kGetMusicList = "GetMusicList"; //
const char *kGetAddressBook = "GetAddressBook";//通信录
const char *kGetSMSList = "GetSMSList"; // 短信列表
const char *kDoInstall = "DoInstall"; // 安装
const char *kDoUninstall = "DoUninstall"; // 卸载
const char *kDoTest = "DoTest"; // 卸载
const char *kCheckDevice = "CheckDevice"; 
const char *kCheckApplist = "CheckApplist"; 


const char *kGetFilelist = "GetFilelist"; // 文件系统
const char *kPullFile = "PullFile";
const char *kPushFile = "PushFile";



std::string PictureType[3] = {"jpg", "jpeg", "png"}; // 图片数据类型
std::string VideoType[6] = {"Ogg", "mp4"}; // 影像数据类型
std::string MusicType[6] = {"aac", "mp3", "AMR"}; // 影像数据类型

using namespace std;
using namespace tthread;

extern PhoneDataObject task;



static NPClass plugin_ref_obj =
{
    NP_CLASS_STRUCT_VERSION,
    ScriptablePluginObject::Allocate,
    ScriptablePluginObject::Deallocate,
    NULL,
    ScriptablePluginObject::HasMethod,
    ScriptablePluginObject::Invoke,
    ScriptablePluginObject::InvokeDefault,
    ScriptablePluginObject::HasProperty,
    ScriptablePluginObject::GetProperty,
    NULL,
    NULL,
};

ScriptablePluginObject::ScriptablePluginObject(NPP instance)
    : npp(instance)
{
	bigit::Logger::Debug("ScriptablePluginObject construct.");

}

NPObject *ScriptablePluginObject::Allocate(NPP instance, NPClass *npclass)
{
	bigit::Logger::Debug("ScriptablePluginObject Allocate.");
    return (NPObject *)(new ScriptablePluginObject(instance));
}

void ScriptablePluginObject::Deallocate(NPObject *obj)
{
	bigit::Logger::Debug("ScriptablePluginObject Deallocate.");
    delete (ScriptablePluginObject *)obj;
}

bool ScriptablePluginObject::HasMethod(NPObject *obj, NPIdentifier methodName)
{
    return true;
}

bool ScriptablePluginObject::InvokeDefault(NPObject *obj, const NPVariant *args,
        uint32_t argCount, NPVariant *result)
{
    return true;
}

/*

*/




static int mb_get_len(NPString src)
{
    return MultiByteToWideChar(CP_UTF8, 0, src.UTF8Characters,
                               src.UTF8Length, NULL, 0);
}
static int mb_to_wchar(NPString src, wchar_t *buf, int mb_len)
{
    int ret = MultiByteToWideChar(CP_UTF8, 0, src.UTF8Characters,
                                  src.UTF8Length, buf, mb_len);
	if (!ret)
		bigit::Logger::Debug("MultiByteToWideChar err:%d",GetLastError());
	else
		bigit::Logger::Debug("MultiByteToWideChar ret:%d",ret);
    *(buf + mb_len) = L'\0';
    return ret;
}

//从UTF8编码抓为GBK编码
static int utf8togbk(NPString src, std::string& out)
{
#ifndef WIN32 
	iconv_t conveter=iconv_open("GBK","UTF-8");
	unsigned int len = iconv(conveter,&(src.UTF8Characters), &(src.UTF8Length),NULL,0);
	char *gbk= new char[len+1];
	iconv(conveter,&(src.UTF8Characters), &(src.UTF8Length),&gbk, &len);
	out = gbk;
	return len;
#else
	
	if (src.UTF8Length <=0) return 0;

	int len = MultiByteToWideChar(CP_UTF8, 0, src.UTF8Characters,
                               src.UTF8Length, NULL, 0);
	wchar_t *buf = new wchar_t[len+1];
	memset(buf,0,sizeof(wchar_t)*(len+1));
	int ret = MultiByteToWideChar(CP_UTF8, 0, src.UTF8Characters,
                                  src.UTF8Length, buf, len);

	 bigit::Logger::Debug("utf8togbk,ret1:%d",ret);
	 int len2 = WideCharToMultiByte(CP_ACP,0,buf,-1,NULL,0,0,FALSE);
	 char *gbk= new char[len2+1];
	 memset(gbk,0,sizeof(char)*(len2+1));
	 ret = WideCharToMultiByte(CP_ACP,0,buf,len,gbk,len2,0,FALSE);

	 bigit::Logger::Debug("utf8togbk,ret2:%d,gbk:%s",ret,gbk);
	 out = gbk;
	 delete buf;
	
	 return len;
#endif
}


bool ScriptablePluginObject::Invoke(NPObject *obj, NPIdentifier methodName,
                                    const NPVariant *args, uint32_t argCount,
                                    NPVariant *result)
{
	bigit::Logger::Debug("ScriptablePluginObject Invoke start.");

    ScriptablePluginObject *thisObj = (ScriptablePluginObject *)obj;
    char *name = npnfuncs->utf8fromidentifier(methodName);

    NPString arg0 = NPVARIANT_TO_STRING(args[0]);

    //int	agrlen = mb_get_len(arg0);
	if (arg0.UTF8Length >0)
		bigit::Logger::Debug("args:%s,len:%d",arg0.UTF8Characters,arg0.UTF8Length);
	//bigit::Logger::Debug("mb_get_len:%d",agrlen);
    //wchar_t *buf = new wchar_t[agrlen+1];
    //mb_to_wchar(arg0, buf, agrlen);

    bool ret_val = false;
    if (!name)
    {
        return ret_val;

    }
	std::string arg;
	utf8togbk(arg0,arg);
	bigit::Logger::Debug("Invoke method:%s, arg:%s",name, arg.c_str());

	 if (!strcmp(name, kCheckApplist))
    {
		ret_val = true;
		string restr;
		if(task.hasApplist)
        {
            restr = "1";
        }
        else
        {
            restr = "0";
        }
        char *npOutString = (char *)npnfuncs->memalloc(restr.size() + 1);
        memset(npOutString, 0x0, restr.size() + 1);
        if (!npOutString)
            return false;
        strcpy(npOutString, restr.c_str());

		bigit::Logger::Debug("Invoke method:%s, return:%s.",name,npOutString);

        STRINGZ_TO_NPVARIANT(npOutString, *result);
	 }
	 if (!strcmp(name, kCheckDevice))
    {
		ret_val = true;
		string restr;
        if(task.isConnected )
        {
            restr = "1";
        }
        else
        {
            restr = "0";
        }
        char *npOutString = (char *)npnfuncs->memalloc(restr.size() + 1);
        memset(npOutString, 0x0, restr.size() + 1);
        if (!npOutString)
            return false;
        strcpy(npOutString, restr.c_str());
		bigit::Logger::Debug("Invoke method:%s, return:%s.",name,npOutString);
        STRINGZ_TO_NPVARIANT(npOutString, *result);
	 }
    if (!strcmp(name, kDoInstall))
    {
        ret_val = true;
		CString ss = ExecuteExternalFile(ADB_COMMAND_PATH, arg.c_str());
        string all = CString2String(ss);
        string::size_type re = all.find("Success");
        string restr;
        if(re == std::string::npos )
        {
            restr = "0";
        }
        else
        {
            restr = "1";
        }
        char *npOutString = (char *)npnfuncs->memalloc(restr.size() + 1);
        memset(npOutString, 0x0, restr.size() + 1);
        if (!npOutString)
            return false;
        strcpy(npOutString, restr.c_str());
		bigit::Logger::Debug("Invoke method:%s, return:%s.",name,npOutString);
        STRINGZ_TO_NPVARIANT(npOutString, *result);
    }
    if (!strcmp(name, kDoUninstall))
    {
        ret_val = true;
		CString ss = ExecuteExternalFile(ADB_COMMAND_PATH, arg.c_str());
        string all = CString2String(ss);
        string::size_type re = all.find("Success");
        string restr;
        if(re == std::string::npos )
        {
            restr = string("0");
        }
        else
        {
            restr = string("1");
        }
        char *npOutString = (char *)npnfuncs->memalloc(restr.size() + 1);
        memset(npOutString, 0x0, restr.size() + 1);
        if (!npOutString)
            return false;
        strcpy(npOutString, restr.c_str());
		bigit::Logger::Debug("Invoke method:%s, return:%s.",name,npOutString);
        STRINGZ_TO_NPVARIANT(npOutString, *result);
    }

    if (!strcmp(name, kDoTest))
    {
        ret_val = true;
        bigit::testlist tetsobj_;
        bigit::testobj *pp = tetsobj_.add_obj();
        pp->set_name(string("tste1"));
        bigit::testobj *pp1 = tetsobj_.add_obj();
        pp1->set_name(string("tste2"));
        //	tetsobj.add_msg(string("tste1"));
        //	tetsobj.add_msg(string("tste2"));
        int size = tetsobj_.ByteSize();
        char *npOutString = (char *)npnfuncs->memalloc(size + 1);
        memset(npOutString, 0x0, size + 1);
        if (!npOutString)
            return false;
        tetsobj_.SerializeToArray(npOutString, size);
		bigit::Logger::Debug("Invoke method:%s, return:%s.",name,npOutString);
        STRINGZ_TO_NPVARIANT(npOutString, *result);
    }
    if (!strcmp(name, kGetFilelist))
    {
        ret_val = true;
		string cmd = "shell ls -l ";
		cmd = cmd + arg;
		CString ss = ExecuteExternalFile(ADB_COMMAND_PATH, cmd.c_str());

        string all = CString2String(ss);

        string buffer;
		bigit::FileList fileList;
        stringstream istr(all);
        std::istringstream iss(all);
        std::string line;
        std::string pdir("/");
		
        while (getline(iss, line))
        {
			//bigit::Logger::Debug("process line:%s", line.c_str());
			std::string right;	//权限
			std::string author;	
			std::string owner;
			std::string size;
			std::string date;
			std::string time;
			std::string name;
			int pos=0;

			
			if(line.size() <= 1)
				continue;
			//is File
			if (line.at(0)=='-' || line.at(0) == 'd')
			{
				pos = ReadToken(line, pos, ' ', right);
				pos = ReadToken(line, pos, ' ', owner);
				pos = ReadToken(line, pos, ' ', author);
				if (line.at(0)=='-')
					pos = ReadToken(line, pos, ' ', size);
				pos = ReadToken(line, pos, ' ', date);
				pos = ReadToken(line, pos, ' ', time);
				pos = ReadToken(line, pos, ' ', name);
				bigit::Logger::Debug("get file: %s %s %s %s %s ,name:%s",right.c_str(),owner.c_str(), size.c_str(),
					date.c_str(), time.c_str(), name.c_str());
				
				//add to list
				bigit::FileInfo *fi = fileList.add_file();
				fi->set_right(right);
				fi->set_owner(owner);
				fi->set_modify(author);
				if (line.at(0)=='-'){
					std::string fsize;
					::FormatSize(size, fsize, 0);
					fi->set_size(fsize);
				}
				fi->set_date(date);
				fi->set_time(time);
				fi->set_name(name);
				fi->set_path(arg + "/" + name);
				
			}
			
		}
		std::string aProtocolBuffer;
        fileList.SerializeToString(&aProtocolBuffer);
        std::string encData = base64_encode(reinterpret_cast<const unsigned char *>(aProtocolBuffer.c_str()), aProtocolBuffer.length());

		char *npOutString = (char *)npnfuncs->memalloc(encData.size() + 1);
		memset(npOutString, 0x0, encData.size() + 1);
		strcpy(npOutString, encData.c_str());
		bigit::Logger::Debug("Invoke method:%s, return:%s.",name,npOutString);
        STRINGZ_TO_NPVARIANT(npOutString, *result);
	}

#if 1

    if (!strcmp(name, kGetAppList))
    {
        ret_val = true;
        //delete buf;
 		char *npOutString = (char *)npnfuncs->memalloc(::task.AppList.size() + 1);
        memset(npOutString, 0x0, task.AppList.size() + 1);
        strcpy(npOutString, task.AppList.c_str());
		bigit::Logger::Debug("Invoke method:%s, return:%s.",name,npOutString);
        STRINGZ_TO_NPVARIANT(npOutString, *result);
    }
    if (!strcmp(name, kGetPictureList))
    {
        ret_val = true;
        CString ss = ExecuteExternalFile(ADB_COMMAND_PATH, " shell ls -lR /storage");
        //delete buf;

        bigit::ResList plist;
        int last = 0;
        int first = 0;
        int cout = 0;
        for (int i = 0; ss.GetLength() > 2 ; i++)
        {
            last = ss.Find(CString("\x0d"));

            std::string picname = CString2String(ss.Mid(first + 2, last));

            int de = picname.find("jpg");
            if(de  != std::string::npos)
            {
                bigit::ResInfo *pnewres = plist.add_res();
                pnewres->set_author("author");
                pnewres->set_createdate("author");
                pnewres->set_duration("author");
                pnewres->set_size("author");
                pnewres->set_icodata("author");
                pnewres->set_format("jpg");
                pnewres->set_path(picname);
            }
            ss = ss.Mid(last + 1, ss.GetLength() - (last + 1));
        }

        int size = plist.ByteSize();
        char *npOutString = (char *)npnfuncs->memalloc(size + 1);
        memset(npOutString, 0x0, size + 1);
        if (!npOutString)
            return false;
        plist.SerializeToArray(npOutString, size);

        STRINGZ_TO_NPVARIANT(npOutString, *result);
    }

    if (!strcmp(name, kGetDeviceInfo))
    {
        ret_val = true;
        //delete buf;

		int size = task.DeviceInf.size();
        char *npOutString = (char *)npnfuncs->memalloc(size + 1);
        memset(npOutString, 0x0, size + 1);
        if (!npOutString)
            return false;
		strcpy(npOutString,task.DeviceInf.c_str());
		bigit::Logger::Debug("Invoke method:%s, return:%s.",name,npOutString);
        STRINGZ_TO_NPVARIANT(npOutString, *result);
    }

    if (!strcmp(name, kGetStorageInfo))
    {
        ret_val = true;
        //delete buf;

        CString ss = ExecuteExternalFile(ADB_COMMAND_PATH, " shell busybox df -k | busybox grep storage_int");
        ss = ss.Trim();
        bigit::StorageInfo StorageInfo;
        int first = 0;
        int last = ss.Find(CString(" "), first + 1);
        CString total = ss.Mid(first, last - first);
        ss = ss.Right(ss.GetLength() - total.GetLength());
        ss = ss.Trim();


        first = 0;
        last = ss.Find(CString(" "), first + 2);
        CString used = ss.Mid(0, last - first);
        ss = ss.Right(ss.GetLength() - used.GetLength());
        ss = ss.Trim();

        first = 0;
        last = ss.Find(CString(" "), first + 1);
        CString freed = ss.Mid(first, last);

        std::string stotal = CString2String(total);
        std::string sfree = CString2String(freed);

        //google::protobuf::int32  totalsiz = atoi(stotal.c_str());
        StorageInfo.set_total(stotal.c_str(), stotal.size());
        StorageInfo.set_free(sfree.c_str(), sfree.size());;
        //StorageInfo.set_u(used.c_str(),used.size());
        int size = StorageInfo.ByteSize();
        char *npOutString = (char *)npnfuncs->memalloc(size + 1);
        memset(npOutString, 0x0, size + 1);
        if (!npOutString)
            return false;
        StorageInfo.SerializeToArray(npOutString, size);
		bigit::Logger::Debug("Invoke method:%s, return:%s.",name,npOutString);
        STRINGZ_TO_NPVARIANT(npOutString, *result);
    }

    if (!strcmp(name, kAaptCommand))
    {
        ret_val = true;
		CString ss = ExecuteExternalFile("", arg.c_str());
        //delete buf;
#ifdef UNCODE
        //获取宽字节字符的大小，大小是按字节计算的
        int len = WideCharToMultiByte(CP_UTF8, 0, ss, ss.GetLength(), NULL, 0, NULL, NULL);
        char *npOutString = (char *)npnfuncs->memalloc(len + 1);
        if (!npOutString)
            return false;
        //宽字节编码转换成多字节编码
        WideCharToMultiByte(CP_UTF8, 0, ss, ss.GetLength(), npOutString, len, NULL, NULL);
        //strcpy(npOutString,"转换成多字节编码");
        npOutString[len + 1] = '/0'; //多字节字符以'/0'结束
#else
        char *npOutString = (char *)npnfuncs->memalloc(ss.GetLength() + 1);
        if (!npOutString)
            return false;
        strcpy(npOutString, ss.GetBuffer());
#endif
        STRINGZ_TO_NPVARIANT(npOutString, *result);
    }
#endif
    if (!strcmp(name, kDoCommand))
    {
        ret_val = true;
        //	CString ss = ExecuteExternalFile("c:\\aapt dump badging c:\\1.6.0219060.zip","");
        //	aapt dump badging 1.6.0219060.zip
		CString ss = ExecuteExternalFile(ADB_COMMAND_PATH, arg.c_str());
        //delete buf;
#ifdef UNCODE
        //获取宽字节字符的大小，大小是按字节计算的
        int len = WideCharToMultiByte(CP_ACP, 0, ss.GetBuffer(), ss.GetLength(), NULL, 0, NULL, NULL);
        if (!npOutString)
            return false;
        ////宽字节编码转换成多字节编码
        WideCharToMultiByte(CP_ACP, 0, ss, ss.GetLength(), npOutString, len, NULL, NULL);
        npOutString[len + 1] = '/0'; //多字节字符以'/0'结束
#else
        char *npOutString = (char *)npnfuncs->memalloc(ss.GetLength() + 1);
        if (!npOutString)
            return false;
        //string newss = 	devices();
        strcpy(npOutString, ss.GetBuffer());
#endif
        STRINGZ_TO_NPVARIANT(npOutString, *result);
    }
    if(!ret_val)
    {
        // Exception handling.
        npnfuncs->setexception(obj, "Unknown method");
    }
    npnfuncs->memfree(name);
	bigit::Logger::Debug("ScriptablePluginObject Invoke end.");
    return ret_val;

}

bool ScriptablePluginObject::HasProperty(NPObject *obj, NPIdentifier propertyName)
{
    return false;
}

bool ScriptablePluginObject::GetProperty(NPObject *obj, NPIdentifier propertyName,
        NPVariant *result)
{
    return false;
}

CPlugin::CPlugin(NPP pNPInstance) :
    m_pNPInstance(pNPInstance),
    m_bInitialized(false),
    m_pScriptableObject(NULL)
{
#ifdef _WINDOWS
    m_hWnd = NULL;
#endif
}

CPlugin::~CPlugin()
{
    if (m_pScriptableObject)
        npnfuncs->releaseobject((NPObject *)m_pScriptableObject);
#ifdef _WINDOWS
    m_hWnd = NULL;
#endif
    m_bInitialized = false;
}



NPBool CPlugin::init(NPWindow *pNPWindow)
{

    if(pNPWindow == NULL)
        return false;
#ifdef _WINDOWS
    m_hWnd = (HWND)pNPWindow->window;
    if(m_hWnd == NULL)
        return false;
#endif
    m_Window = pNPWindow;
    m_bInitialized = true;
    return true;
}

NPBool CPlugin::isInitialized()
{
    return m_bInitialized;
}

ScriptablePluginObject *CPlugin::GetScriptableObject()
{
    if (!m_pScriptableObject)
    {
        m_pScriptableObject = (ScriptablePluginObject *)npnfuncs->createobject(m_pNPInstance, &plugin_ref_obj);

        npnfuncs->retainobject((NPObject *)m_pScriptableObject);
    }

    return m_pScriptableObject;
}

#ifdef _WINDOWS
HWND CPlugin::GetHWnd()
{
    return m_hWnd;
}
#endif