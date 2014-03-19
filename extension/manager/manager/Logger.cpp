#include "Logger.h"
 
#include "log4cpp\Category.hh"
#include "log4cpp\Appender.hh"
#include "log4cpp\Layout.hh"
#include "log4cpp\FileAppender.hh"
#include "log4cpp\BasicLayout.hh"
#include "log4cpp\PatternLayout.hh"


namespace bigit{
 
log4cpp::Category& root = log4cpp::Category::getRoot();  
bool logger_inited = false;

struct _LoggerInit
{
	_LoggerInit()
	{
		log4cpp::Appender* pFileAppender;

		pFileAppender = new log4cpp::FileAppender("fileLog","bigit.log"); 
 
		log4cpp::PatternLayout* pLayout = new log4cpp::PatternLayout();
		pLayout->setConversionPattern("%d: %p %c %x: %m%n");

		pFileAppender->setLayout(pLayout);
		
		root.addAppender(pFileAppender);
		root.setPriority(log4cpp::Priority::DEBUG); 
	}
	~_LoggerInit()
	{
		root.shutdown();
	}
} __loggerinit;

Logger::Logger(void)
{
}


Logger::~Logger(void)
{
}

void Logger::Debug(char* format,...)
{
	char szLog[2048];
	va_list args; 

	va_start(args, format);
	_vsnprintf(szLog, 2046, format, args); 
	va_end(args); 
	root.debug(szLog);
}

void Logger::Info(char* format,...)
{
	char szLog[2048];
	va_list args; 

	va_start(args, format);
	_vsnprintf(szLog, 2046, format, args); 
	va_end(args); 
	root.info(szLog);
}

void Logger::Warn(char* format,...)
{
	char szLog[2048];
	va_list args; 

	va_start(args, format);
	_vsnprintf(szLog, 2046, format, args); 
	va_end(args); 
	root.warn(szLog);
	
}

void Logger::Fatal(char* format,...)
{
	char szLog[2048];
	va_list args; 

	va_start(args, format);
	_vsnprintf(szLog, 2046, format, args); 
	va_end(args); 
	root.fatal(szLog);
}
}