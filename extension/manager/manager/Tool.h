
#ifndef TOOL_h_
#define TOOL_h_

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


using namespace std;

#define ADB_COMMAND_PATH  "c:\\adb.exe"

CString ExecuteExternalFile(CString csExeName, CString csArguments);

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

int split(const string &str, vector<string> &ret_, string sep = ",")
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

void GetDataThread(void *aArg);
void Run(void *aArg);
#endif