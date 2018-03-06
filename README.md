# FCS - Firefighter Communication System

The Firefighter Communication System is a web application to allow for more secure and advanced communication between firefighters when on a job. This web application is paired with a Wireless LAN to create the entire system.

This is our Senior Design Project, the culminating project for the Engineering department at Santa Clara University

## Getting Started

Follow the following instructions to download the necessary software, and install the proper dependencies to ensure the system runs on your machine.

### Prerequisites

1. Clone or download the repository to your local machine
2. Download and install Node.js
  - to see if it is properly installed, type node -v into your terminal/command prompt
3. Download and install npm (or your preferred package manager)
  - to see if it is properly installed, type node -v into your terminal/command prompt
4. Navigate into the root directory of the repo on your local machine
5. Enter the following command into your command prompt 
```
C:\FCS> installations
```
This will run the installations.bat batch file, downloading the correct Node.js, Socket.io, and Express.js dependencies you need.

### Adding the SSL Certificate 

NOTE: These next few steps are VERY important!

1. In order for the application to work, the server must be a secure https server, and therefore must have an SSL certificate.
2. Navigate to the root directory and create a folder called "www_firefightercomm_com_ssl_cert"
```
C:\FCS>mkdir www_firefightercomm_com_ssl_cert
```
3. Navigate into this directory
4. Obtain the following 3 files from your admin:
  - private-key.key
  - www_firefightercomm_com.ca-bundle
  - www_firefightercomm_com.crt
  - www_firefightercomm_com.cp7b
5. Place these files into the www_firefightercomm_com_ssl_cert directory 

### Running the node express server

Navigate into the root directory of the repo on your local machine and enter the following command into your command prompt
```
C:\FCS>node app.js
```
If you have followed the steps correctly, and everything is installed properly, this will start the server and you should se the following message appear below the command you typed in:
```
C:\FCS>node app.js
Server listening on: https://localhost:8080
```

### Using the system

Now that the server is running, anyone connected to the same LAN can access the application.
To do so, open your chrome web browser, and navigate to https://<ipaddress>:8080
To determine the IP Address that the server is running on, open a NEW command prompt on the machine running the server, and type the following command (on a Windows Machine)
```
C:\FCS>ipconfig
```
This command will list lots of information about the local machine. 
To find the correct IP Address, find the section labeled "Wireless LAN adapter Wi-Fi:". Within that section find the key labeled "IPv4 Address". The value at the end of that line is the IP Address you need to enter into the url as noted above.

After you go to that url, the browser will ask to use your microphone. Click Allow and you will be brought to the main screen.

That's IT!!

## Acknowledgments

Contributors:
* Nick Goodpaster
* Griffin Moede
* Steven Booth
* JP Hurley
