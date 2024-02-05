---
author: Nithissh S
pubDatetime: 2023-06-12
modDatetime: 2023-06-12
title: Sau - HTB
slug: sau-htb
featured: true
draft: false
tags:
  - HTB
description:
  Easy level CTF lab machine of the HackTheBox platform running Linux containing public exploits, SSRF, RCE.
---

## Enumeration Phase

Let's start by enumerating the machines with nmap:

```sh
sudo nmap -sC -sV -oN inital.nmap 10.10.11.224
Nmap scan report for 10.10.11.224
Host is up (0.079s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE    SERVICE VERSION
22/tcp open     ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 aa:88:67:d7:13:3d:08:3a:8a:ce:9d:c4:dd:f3:e1:ed (RSA)
|   256 ec:2e:b1:05:87:2a:0c:7d:b1:49:87:64:95:dc:8a:21 (ECDSA)
|_  256 b3:0c:47:fb:a2:f2:12:cc:ce:0b:58:82:0e:50:43:36 (ED25519)
80/tcp filtered http
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.87 seconds
Seeing the result, we see that port 80 is filtered which means we cant access it from the outside, let's do a full port scan using (-p-), to see if there is more open ports.
```

Seeing the result, we see that port 80 is filtered which means we cant access it from the outside, let's do a full port scan using **(-p-)**, to see if there is more open ports.

```sh
$ nmap -sS -sC -sV -T4 -p- 10.10.11.224

PORT STATE SERVICE VERSION
22/tcp open ssh OpenSSH 8.2p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
| 3072 aa8867d7133d083a8ace9dc4ddf3e1ed (RSA)
| 256 ec2eb105872a0c7db149876495dc8a21 (ECDSA)
|_ 256 b30c47fba2f212ccce0b58820e504336 (ED25519)
80/tcp filtered http
8338/tcp filtered unknown
55555/tcp open unknown
| fingerprint-strings:
| FourOhFourRequest:
| HTTP/1.0 400 Bad Request
| Content-Type: text/plain; charset=utf-8
| X-Content-Type-Options: nosniff
| Date: Mon, 11 Sep 2023 15:15:13 GMT
| Content-Length: 75
| invalid basket name; the name does not match pattern: ^[wd-_\.]{1,250}$
| GenericLines, Help, Kerberos, LDAPSearchReq, LPDString, RTSPRequest, SSLSessionReq, TLSSessionReq, TerminalServerCookie:
| HTTP/1.1 400 Bad Request
| Content-Type: text/plain; charset=utf-8
| Connection: close
| Request
| GetRequest:
| HTTP/1.0 302 Found
| Content-Type: text/html; charset=utf-8
| Location: /web
| Date: Mon, 11 Sep 2023 15:14:45 GMT
| Content-Length: 27
| href="/web">Found</a>.
| HTTPOptions:
| HTTP/1.0 200 OK
| Allow: GET, OPTIONS
| Date: Mon, 11 Sep 2023 15:14:46 GMT
|_ Content-Length: 0
```

Doing so, we see we have 55555 port open, let's try accessing it from the browser:


![](../../assets/images/sau-1.png)


We see basket request service, with the version **1.2.1**.

After searching and reading about baskets, we see that they are used to collect HTTP requests and inspecting them, but they are vulnerable to SSRF (server side request forgery) because the user can forward the response to where he wants, and this can give access to restricted service on the local network of the server.

Upon creating a basket, we can see that we can do some settings, one of them is the **"forward url"**, which specifies the url that the requests are made to this basket should be forwarded to, in other words, where should the request go.

![](../../assets/images/sau-2.png)


Let's try to make the request get forwarded to us, and let's open port 80 using netcat to test for connectivity: So we set up our listener **sudo nc -lnvp 80**, then let's make a request to `http://10.10.11.224:55555/<BASKET NAME>/anything`, and upon doing so:

![](../../assets/images/sau-3.png)


## User Flag

As you know We've successfully established a connection!

Recall the previously identified filtered port 80? Let's attempt to prompt the server to request that specific website and examine the obtained results.

Now, let's configure our basket accordingly and proceed to access the basket URL.


![](../../assets/images/sau-4.png)


And now when we go there:


![](../../assets/images/sau-5.png)


So, guess what? We found out that the mailtrail app is rocking version **0.53**, and it's got this cool vulnerability that we can totally exploit for a **Remote Code Execution (RCE)**. Time to grab a shell on the box!

After some digging, we figured out that it's playing nice with command injection, especially in the **username** field during login. So, we just casually threw in some commands from the command line to make things interesting. Let the hacking games begin!

```sh
curl <BASKET URL> --data 'username=`COMMAND HERE`'
```

To make things super easy, we're going to use a Proof of Concept (PoC) that we found on GitHub. Here's the link – [Exploit](https://github.com/DcardosoGH/Maltrail-0.53-RCE-/blob/main/exploit.py)

With this nifty PoC, we just need to feed it our listening IP and port, hit send, and voila – we've got a shell coming our way! It's like hacking made simple. Let's give it a shot and see the magic happen.



![](../../assets/images/sau-6.png)


We got our user flag in our **user.txt**


![](../../assets/images/sau-7.png)


## Privilege Escalation

The first thing to check is **sudo -l**, when we do so, we see the following:


![](../../assets/images/sau-8.png)


Guess what? We can check out a specific service status in `systemctl`, and the default viewer for that is less. Now, here's the cool part – not everyone knows that you can actually run system commands in less! Let's try this out:

When we pull up the page, just hit !bash, and just like that, we're looking at a root shell. It's like unlocking a secret door – pretty slick, huh? Let's give it a whirl and see what unfolds.


![](../../assets/images/sau-9.png)
