# Fireabse IOT Starter
Lucien Brule <brulel@rpi.edu>

> Make your IoT project easier to make.

# Getting Started

*please read each step and all options before continuing*

### From GUI (ie: Windows)
1. clone this repository
  - try using [GitHub Desktop](https://desktop.github.com/)
		or [Atlassian Source Tree](https://www.sourcetreeapp.com/).
2. open the project root directoy
	- ie: ```/Users/YourUsername/Something/firebase-iot-starter```
	- You can use  [Window File Explorer](https://en.wikipedia.org/wiki/File_Explorer)
3. copy your project firebase config and paste it in ```app/config/config.js```
	- you can do this by right clicking in this folder and making a new text file.
	- save this text file as all files and then end the file extension as .js


### From CLI (ie: bash)

1. clone this repository
2. firebase init in the project root

# Deploying:

### GUI Version (ftp)

1. Connect to your ftp server
	- Download [FileZilla](https://filezilla-project.org/) , an FTP client
	- if you're an RPI student you can use: ```yourrcsid@rcs.rpi.edu``` , port 22
	- this will host your web app at ```homepages.rpi.edu/~yourrcsid```
2. upload the app folder

### CLI Version (firebase deploy)
1. run ```firebase deploy```
