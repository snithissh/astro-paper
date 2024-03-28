---
author: Nithissh S
pubDatetime: 2024-03-28
modDatetime: 2024-03-28
title: Reflected XSS into HTML context with most tags and attributes blocked
slug: reflected-xss-into-html-context-with-most-tags-and-attributes-blocked
featured: false
draft: false
tags:
  - XSS
  - Burp Certified Practitioner
description:
  In our exploration of the application's search functionality, we encountered tag restrictions while attempting to inject <img> elements. Leveraging the <body> tag with an onresize attribute helped bypass these restrictions. Crafting a payload suitable for delivery via the exploit server, we ensured successful execution, ultimately solving the lab by exploiting the stored DOM-based XSS vulnerability.
---

# Intro 

This lab contains a reflected XSS vulnerability in the search functionality but uses a web application firewall (WAF) to protect against common XSS vectors

## Solution

In the search functionality of this application, I've entered the following payload `test"><h2>XSS` to check on how the application evaluting the input and the `<h2>` got executed in a newline 

![](../../assets/images/portswigger/XSS/apprentice/xss-48.png)


When entering the complete payload like `test"><img src=x onerror=alert(1)>` in the search functionality and responded with **"No Tags allowed"**

![](../../assets/images/portswigger/XSS/apprentice/xss-49.png)


Now I assume that the `<img>` tag is blocked what's the other alternative like I remember we have a `<body>` tag and with the following payload `<body onerror=alert(1) onload=/>` we have bypassed the tag error but we do have a attribute error now 


![](../../assets/images/portswigger/XSS/apprentice/xss-50.png)


In our case, `onerror` is the attribute and in order to solve it completely with the following payload `"><body onresize=print()>` the request responds with a 200 status code 

![](../../assets/images/portswigger/XSS/apprentice/xss-51.png)


The payload is working right ?, Now let's create a payload which is deliverable to the victim through the exploit server 

**Payload to deliver to victim**

```
<iframe src="https://0ae50081041cae9b809249b1001d0007.web-security-academy.net/?search=%22%3E%3Cbody%20onresize=print()%3E" onload=this.style.width='100px'>
```

Put the following payload into the exploit server in the body data and click on store and then deliver the exploit to the client.. Now the lab will be solved


![](../../assets/images/portswigger/XSS/apprentice/xss-52.png)