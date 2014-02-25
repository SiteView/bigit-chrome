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

#endif
// 接口定义
const char* kDoCommand =    "DoCommand";
const char* kAaptCommand =  "AaptCommand";
const char* kGetDeviceInfo = "GetDeviceInfo";
const char* kGetStorageInfo = "GetStorageInfo";
const char* kGetAppList = "GetAppList";
const char* kGetPictureList = "GetPictureList";
const char* kGetVideoList = "GetVideoList";
const char* kGetMusicList = "GetMusicList"; // 
const char* kGetAddressBook = "GetAddressBook";//通信录
const char* kGetSMSList = "GetSMSList"; // 短信列表
const char* kDoInstall = "DoInstall"; // 安装
const char* kDoUninstall = "DoUninstall"; // 卸载

#define ADB_COMMAND_PATH  "c:\\adb.exe"


#if defined(WIN32)
typedef SOCKET Socket;
#else
typedef int Socket;
#endif

void CloseSocket(Socket socket)
{
#if defined(WIN32)
    closesocket(socket);
#else
    close(socket);
#endif
}


static NPClass plugin_ref_obj = {
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
    : npp(instance) {
}

NPObject* ScriptablePluginObject::Allocate(NPP instance, NPClass* npclass) {
  return (NPObject*)(new ScriptablePluginObject(instance));
}

void ScriptablePluginObject::Deallocate(NPObject* obj) {
  delete (ScriptablePluginObject*)obj;
}

bool ScriptablePluginObject::HasMethod(NPObject* obj, NPIdentifier methodName) {
  return true;
}

bool ScriptablePluginObject::InvokeDefault(NPObject* obj, const NPVariant* args,
                            uint32_t argCount, NPVariant* result) {
  return true;
}

/*
std::string CString2String(CString _input) 
{ 
	if(_input==""){return"";} 
	USES_CONVERSION; 
	return T2A((LPTSTR)(LPCTSTR)_input); 
}
*/
std::string CString2String(CString _input)
{
	int ansiLen=WideCharToMultiByte(CP_ACP,NULL,_input,wcslen(_input),NULL,0,NULL,NULL);
	char* _Chars=new char[ansiLen+1]; 
	memset(_Chars,0x0,ansiLen+1);
	WideCharToMultiByte(CP_ACP,NULL,_input,wcslen(_input),_Chars,ansiLen,NULL,NULL); 
	_Chars[ansiLen] = '\0'; 
	std::string output = _Chars; 
	delete[] _Chars;
	return output;
}
void clean_string(char *str)
	{
	    char *start = str - 1;
	    char *end = str;
	    char *p = str;
	    while(*p)
	    {
	        switch(*p)
	        {
	        case ' ':
	        case '\r':
	        case '\n':
	            {
	                if(start + 1==p)
	                    start = p;
	            }
	            break;
	        default:
	            break;
	        }
	        ++p;
	    }
	    //现在来到了字符串的尾部 反向向前
	    --p;
	    ++start;
	    if(*start == 0)
	    {
	        //已经到字符串的末尾了
	        *str = 0 ;
	        return;
	    }
	    end = p + 1;
	    while(p > start)
	    {
	        switch(*p)
	        {
	        case ' ':
	        case '\r':
	        case '\n':
	            {
	                if(end - 1 == p)
	                    end = p;
	            }
	            break;
	        default:
	            break;
	        }
	        --p;
	    }
	    memmove(str,start,end-start);
	    *(str + (int)end - (int)start) = 0;
	}

std::string GetKeyValue(CString all, CString key)
{
	all = all.Trim();
	int first = all.Find(key);
	if(first <1) 
		return std::string("");
	int last  = all.Find(CString("\x0d"),first);
	CString value = all.Mid(first+key.GetLength(),last-first -key.GetLength()-1);
	std::string stdvatle =  CString2String(value);
	return  stdvatle;
}

CString ExecuteExternalFile(CString csExeName, CString csArguments)
{
  CString csExecute;
  csExecute=csExeName + " " + csArguments;
  
  
  // csExecute=csArguments;
  
  SECURITY_ATTRIBUTES secattr; 
  ZeroMemory(&secattr,sizeof(secattr));
  secattr.nLength = sizeof(secattr);
  secattr.bInheritHandle = TRUE;

  HANDLE rPipe, wPipe;

  //Create pipes to write and read data
  CreatePipe(&rPipe,&wPipe,&secattr,0);
  //
  STARTUPINFO sInfo; 
  ZeroMemory(&sInfo,sizeof(sInfo));
  PROCESS_INFORMATION pInfo; 
  ZeroMemory(&pInfo,sizeof(pInfo));
  sInfo.cb=sizeof(sInfo);
  sInfo.dwFlags=STARTF_USESTDHANDLES;
  sInfo.hStdInput=NULL; 
  sInfo.hStdOutput=wPipe; 
  sInfo.hStdError=wPipe;
  wchar_t command[1024];
  _tcscpy(command,csExecute);

  //Create the process here.
  CreateProcess(0,(LPWSTR)command,0,0,1,NORMAL_PRIORITY_CLASS|CREATE_NO_WINDOW,0,0,&sInfo,&pInfo);
  CloseHandle(wPipe);

  //now read the output pipe here.
  char buf[1000];
  memset(buf,0x0,1000);
  DWORD reDword; 
  CString m_csOutput,csTemp;
  BOOL res;
  do
  {
		res=::ReadFile(rPipe,buf,100,&reDword,0);
		csTemp=buf;
		m_csOutput+=csTemp.Left(reDword);
  }while(res);
  return m_csOutput;
}

static int mb_get_len(NPString src){
    return MultiByteToWideChar(CP_UTF8, 0, src.UTF8Characters,
                               src.UTF8Length, NULL, 0) + 1;
}
static int mb_to_wchar(NPString src, wchar_t *buf, int mb_len){
    int ret = MultiByteToWideChar(CP_UTF8, 0, src.UTF8Characters,
                                  src.UTF8Length, buf, mb_len);
    *(buf + mb_len - 1) = '\0';
    return ret;
}
#if 1
std::string ScriptablePluginObject::devices()
{
    struct sockaddr_in client;
    client.sin_family = AF_INET;
    client.sin_port = htons(5037);
    client.sin_addr.s_addr = inet_addr("127.0.0.1");
    Socket sock = socket(AF_INET, SOCK_STREAM, 0);

    if (connect(sock, (struct sockaddr*)&client, sizeof(client)) != 0) {
        CloseSocket(sock);
        return "Error: could not connect to ADB";
    }

    std::string devices = "000Chost:devices";
    if (send(sock, devices.c_str(), devices.length(), 0) == -1) {
        CloseSocket(sock);
        return "Error: could not send command";
    }

    std::string response;
    char buffer[10240];
    int result;
    do {
        result = recv(sock, &buffer[0], 10240, 0);
        if (result > 0)
            response += std::string(&buffer[0], result);
        else if (result < 0)
            response = "Error: could not read response";
    } while (result != 0);
    CloseSocket(sock);
    return response;
}

#endif

bool ScriptablePluginObject::Invoke(NPObject* obj, NPIdentifier methodName,
                     const NPVariant* args, uint32_t argCount,
                     NPVariant* result) {
  ScriptablePluginObject *thisObj = (ScriptablePluginObject*)obj;
  char* name = npnfuncs->utf8fromidentifier(methodName);

  NPString arg0 = NPVARIANT_TO_STRING(args[0]);

  int	agrlen = mb_get_len(arg0);
	wchar_t *buf = new wchar_t[agrlen];
	mb_to_wchar(arg0, buf, agrlen);


  bool ret_val = false;
  if (!name) {
    return ret_val;
  }
	if (!strcmp(name, kGetDeviceInfo))
	{
			ret_val = true;
	        CString ss = ExecuteExternalFile("c:\\adb.exe","shell cat /system/build.prop");
			delete buf;
			std::string pmodel = GetKeyValue(ss,CString("product.model="));
			std::string pbrand = GetKeyValue(ss,CString("product.brand="));
			std::string pname = GetKeyValue(ss,CString("product.name="));
			std::string pcpu = GetKeyValue(ss,CString("product.cpu"));
			
		    ss =  ExecuteExternalFile("c:\\adb.exe","shell getprop ro.serialno");
			ss = ss.Trim();

			std::string psn = CString2String(ss);
			
			int first = pcpu.find("=");
			pcpu = pcpu.substr(first+1,pcpu.size()-first-1);
			bigit::DeviceInfo devinf;
			devinf.set_brand(pbrand.c_str(),pbrand.size());
			devinf.set_model(pmodel.c_str(),pmodel.size());
			devinf.set_name(pname.c_str(),pname.size());
			devinf.set_sn(psn.c_str(),psn.size());
			devinf.set_cpu(pcpu.c_str(),pcpu.size());
			devinf.set_imei(pname.c_str(),pname.size());
			devinf.set_mac(pname.c_str(),pname.size());
			int size = devinf.ByteSize();
			char* npOutString = (char *)npnfuncs->memalloc(size+ 1);
			memset(npOutString,0x0,size+ 1);
			if (!npOutString)
			  return false;
			devinf.SerializeToArray(npOutString,size);
			STRINGZ_TO_NPVARIANT(npOutString, *result);
	}

	if (!strcmp(name, kGetStorageInfo))
	{
			ret_val = true;
	        CString ss = ExecuteExternalFile("c:\\adb.exe"," shell busybox df -k | busybox grep storage_int");
			delete buf;
			ss = ss.Trim();
			bigit::StorageInfo StorageInfo;
			int first = 0;
			int last = ss.Find(CString(" "),first+1);
			CString total = ss.Mid(first,last-first);
			ss = ss.Right(ss.GetLength() - total.GetLength());
			ss = ss.Trim();

			first = 0;
			last = ss.Find(CString(" "),first+2);
			CString used = ss.Mid(0,last-first);
			ss = ss.Right(ss.GetLength() - used.GetLength());
			ss = ss.Trim();

			first = 0;
			last = ss.Find(CString(" "),first+1);
			CString freed = ss.Mid(first,last);

			std::string stotal = CString2String(total);
			std::string sfree = CString2String(freed);

			//google::protobuf::int32  totalsiz = atoi(stotal.c_str());
			StorageInfo.set_total(stotal.c_str(),stotal.size());
			StorageInfo.set_free(sfree.c_str(),sfree.size());;
			//StorageInfo.set_u(used.c_str(),used.size());
			int size = StorageInfo.ByteSize();
			char* npOutString = (char *)npnfuncs->memalloc(size+ 1);
			memset(npOutString,0x0,size+ 1);
			if (!npOutString)
			  return false;
			StorageInfo.SerializeToArray(npOutString,size);
			STRINGZ_TO_NPVARIANT(npOutString, *result);
	}
  
    if (!strcmp(name, kAaptCommand)) {
		    ret_val = true;
			CString ss = ExecuteExternalFile("",buf);
			delete buf;

			//获取宽字节字符的大小，大小是按字节计算的
			int len = WideCharToMultiByte(CP_UTF8,0,ss,ss.GetLength(),NULL,0,NULL,NULL);
			char* npOutString = (char *)npnfuncs->memalloc(len + 1);
			if (!npOutString)
			  return false;
			//宽字节编码转换成多字节编码
			WideCharToMultiByte(CP_UTF8,0,ss,ss.GetLength(),npOutString,len,NULL,NULL);
			//strcpy(npOutString,"转换成多字节编码");
			npOutString[len+1] = '/0';   //多字节字符以'/0'结束
			//strcpy(npOutString,ss.GetBuffer());
			STRINGZ_TO_NPVARIANT(npOutString, *result);
	}

  if (!strcmp(name, kDoCommand)) 
  {
    ret_val = true;
	CString ss = ExecuteExternalFile("c:\\adb.exe","");
	delete buf;
	//获取宽字节字符的大小，大小是按字节计算的
	int len = WideCharToMultiByte(CP_UTF8,0,ss,ss.GetLength(),NULL,0,NULL,NULL);
    char* npOutString = (char *)npnfuncs->memalloc(len + 1);
    if (!npOutString)
      return false;
	//宽字节编码转换成多字节编码
	WideCharToMultiByte(CP_UTF8,0,ss,ss.GetLength(),npOutString,len,NULL,NULL);
	//strcpy(npOutString,"转换成多字节编码");
	npOutString[len+1] = '/0';   //多字节字符以'/0'结束
	//strcpy(npOutString,ss.GetBuffer());
    STRINGZ_TO_NPVARIANT(npOutString, *result);
  }
  if(!ret_val) 
  {
   // Exception handling. 
    npnfuncs->setexception(obj, "Unknown method");
  }
  npnfuncs->memfree(name);
  return ret_val;
}

bool ScriptablePluginObject::HasProperty(NPObject* obj, NPIdentifier propertyName) {
  return false;
}

bool ScriptablePluginObject::GetProperty(NPObject* obj, NPIdentifier propertyName,
                          NPVariant* result) {
  return false;
}

CPlugin::CPlugin(NPP pNPInstance) :
  m_pNPInstance(pNPInstance),
  m_bInitialized(false),
  m_pScriptableObject(NULL) {
#ifdef _WINDOWS
  m_hWnd = NULL;
#endif
}

CPlugin::~CPlugin() {
  if (m_pScriptableObject)
    npnfuncs->releaseobject((NPObject*)m_pScriptableObject);
#ifdef _WINDOWS
  m_hWnd = NULL;
#endif
  m_bInitialized = false;
}

NPBool CPlugin::init(NPWindow* pNPWindow) {
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

NPBool CPlugin::isInitialized() {
  return m_bInitialized;
}

ScriptablePluginObject * CPlugin::GetScriptableObject() {
  if (!m_pScriptableObject) {
    m_pScriptableObject = (ScriptablePluginObject*)npnfuncs->createobject(m_pNPInstance, &plugin_ref_obj);

    npnfuncs->retainobject((NPObject*)m_pScriptableObject);
  }

  return m_pScriptableObject;
}

#ifdef _WINDOWS
HWND CPlugin::GetHWnd() {
  return m_hWnd;
}
#endif