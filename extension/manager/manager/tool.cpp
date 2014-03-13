#include "Tool.h"

#include <TinyThread\fast_mutex.h>
#include <TinyThread\tinythread.h>

 using namespace tthread;

string trim(const string &str)
{
    string::size_type pos = str.find_first_not_of(' ');
    if (pos == string::npos)
    {
        return str;
    }
    string::size_type pos2 = str.find_last_not_of(' ');
    if (pos2 != string::npos)
    {
        return str.substr(pos, pos2 - pos + 1);
    }
    return str.substr(pos);
}

int split(const string &str, std::vector<string> &ret_, string sep )
{
    if (str.empty())
    {
        return 0;
    }

    string tmp;
    string::size_type pos_begin = str.find_first_not_of(sep);
    string::size_type comma_pos = 0;

    while (pos_begin != string::npos)
    {
        comma_pos = str.find(sep, pos_begin);
        if (comma_pos != string::npos)
        {
            tmp = str.substr(pos_begin, comma_pos - pos_begin);
            pos_begin = comma_pos + sep.length();
        }
        else
        {
            tmp = str.substr(pos_begin);
            pos_begin = comma_pos;
        }

        if (!tmp.empty())
        {
            ret_.push_back(tmp);
            tmp.clear();
        }
    }
    return 0;
}

string replace(const string &str, const string &src, const string &dest)
{
    string ret;

    string::size_type pos_begin = 0;
    string::size_type pos       = str.find(src);
    while (pos != string::npos)
    {
        //   cout << "replacexxx:" << pos_begin << " " << pos << "\n";
        ret.append(str.data() + pos_begin, pos - pos_begin);
        ret += dest;
        pos_begin = pos + 1;
        pos       = str.find(src, pos_begin);
    }
    if (pos_begin < str.length())
    {
        ret.append(str.begin() + pos_begin, str.end());
    }
    return ret;
}

#ifdef UNCODE
std::string CString2String(CString _input)
{

    int ansiLen = WideCharToMultiByte(CP_ACP, NULL, _input, wcslen(_input), NULL, 0, NULL, NULL);
    char *_Chars = new char[ansiLen + 1];
    memset(_Chars, 0x0, ansiLen + 1);
    WideCharToMultiByte(CP_ACP, NULL, _input, wcslen(_input), _Chars, ansiLen, NULL, NULL);
    _Chars[ansiLen] = '\0';
    std::string output = _Chars;
    delete[] _Chars;

    return output;
}
#else
std::string CString2String(CString _input)
{
    if(_input == "")
    {
        return"";
    }
    USES_CONVERSION;
    return T2A((LPTSTR)(LPCTSTR)_input);
}
#endif

std::string GetKeyValue(CString all, CString key)
{
    //  all = all.Trim();
    int first = all.Find(key);
    if(first < 1)
        return std::string("nofound");
    int last  = all.Find(CString("\x0d"), first);
    CString value = all.Mid(first + key.GetLength(), last - first - key.GetLength());
    std::string stdvatle =  CString2String(value);
    return  stdvatle;
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
            if(start + 1 == p)
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
    memmove(str, start, end - start);
    *(str + (int)end - (int)start) = 0;
};

fast_mutex gFastMutex;

CString ExecuteExternalFile(CString csExeName, CString csArguments)
{
    CString csExecute;
    csExecute = csExeName + " " + csArguments;

	lock_guard<fast_mutex> lock(gFastMutex);

    SECURITY_ATTRIBUTES secattr;
    ZeroMemory(&secattr, sizeof(secattr));
    secattr.nLength = sizeof(secattr);
    secattr.bInheritHandle = TRUE;

    HANDLE rPipe, wPipe;

    //Create pipes to write and read data
    CreatePipe(&rPipe, &wPipe, &secattr, 0);
    //
    STARTUPINFO sInfo;
    ZeroMemory(&sInfo, sizeof(sInfo));
    PROCESS_INFORMATION pInfo;
    ZeroMemory(&pInfo, sizeof(pInfo));
    sInfo.cb = sizeof(sInfo);
    sInfo.dwFlags = STARTF_USESTDHANDLES;
    sInfo.hStdInput = NULL;
    sInfo.hStdOutput = wPipe;
    sInfo.hStdError = wPipe;
    TCHAR command[1024];
    _tcscpy(command, csExecute);

    //Create the process here.
    CreateProcess(0, (LPSTR)command, 0, 0, 1, NORMAL_PRIORITY_CLASS | CREATE_NO_WINDOW, 0, 0, &sInfo, &pInfo);
    CloseHandle(wPipe);

    //now read the output pipe here.
    char buf[10240];
    memset(buf, 0x0, 10240);
    DWORD reDword;
    CString m_csOutput, csTemp;
    BOOL res;
    do
    {
        res =::ReadFile(rPipe, buf, 100, &reDword, 0);
        csTemp = buf;
        m_csOutput += csTemp.Left(reDword);
    }
    while(res);
    return m_csOutput;
}