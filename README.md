# Simple-Cisco-HTML-Homepage

This project aims to create a simple status webpage for Cisco Catalyst switches. These switches have internal webservers with simple [server side includes](https://www.cisco.com/c/en/us/td/docs/ios/fundamentals/configuration/guide/TIPs_Conversion/cf_15_1s_book/web_based_cfg.html#wp1012078), giving a pseudo dynamic webpage functionality. However the original files included in Cisco's IOS does not work with any modern browsers. There are still many older Catalyst switches in the market.

## How does it work?
Using Cisco's SSI instructions in the SHTML files, text from the CLI can be served over HTTP. The output lines of these instructions are parsed in JavaScript to create the webpage at load time.

## Security Considerations
Cisco's SSI exposes the URL to use almost any IOS command. Care should be taken no to do anything destructive from the [URL](https://www.cisco.com/c/en/us/td/docs/ios/fundamentals/configuration/guide/TIPs_Conversion/cf_15_1s_book/web_based_cfg.html#wp1012976).

## Installation
Assuming [ip http server](https://www.cisco.com/c/en/us/td/docs/ios/fundamentals/configuration/guide/TIPs_Conversion/cf_15_1s_book/web_based_cfg.html#wp1000946) is on and old html files are deleted.

 1. Download a copy of this repo
 2. Use a TFTP server such as https://tftpd32.jounin.net/
 3. Load the files to you switch's html folder
	 3.1. Switch#cd c3750-ipbasek9-mz.XXX-XX.XXXX/html 
	 3.2. Switch#copy tftp: xhome.htm
	 3.3. Switch#copy tftp: xhome.shtml
	 3.4. Switch#copy tftp: script.js
	 3.5. Switch#copy tftp: stylesheet.css
4. Browse to your switch's IP in a web browser
