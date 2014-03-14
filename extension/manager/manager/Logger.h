#pragma once

namespace bigit
{
class Logger
{
public:
	Logger(void);
	~Logger(void);

public:
	static void Debug(char* format,...);
	static void Info(char* format,...);
	static void Warn(char* format,...);
	static void Fatal(char* format,...);

};
};

