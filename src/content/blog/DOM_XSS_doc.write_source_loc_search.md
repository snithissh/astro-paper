---
author: Nithissh S
pubDatetime: 2024-02-07
modDatetime: 2024-02-07
title: DOM XSS in document.write sink using source location.search
slug: DOM-XSS-doc-write-source-loc-search
featured: false
draft: false
tags:
  - XSS
  - Burp Certified Practitioner
description:
  This lab features a DOM-based XSS vulnerability in the search query, utilizing the document.write function to output data. The function is invoked with data from location.search, controllable via the website URL. To solve the lab, execute an XSS attack triggering the alert function.
---

## Intro 


This lab contains a DOM-based XSS in the search query. It uses document.write function to writes data out to the page. The function is called with data from location.search, which you can control using the website URL.


## Solution

The spinned instance looks like what we faced in our reflected XSS but this is different case where we have exploit dom XSS here in the search tab 


![](../../assets/images/portswigger/XSS/apprentice/xss-10.png)



Using DOM invader, we can update our canary somethings like `xss` and let's see whether it meets in source sinks 


![](../../assets/images/portswigger/XSS/apprentice/xss-11.png)



Analysing the dom invader tab in chromium, the canary is being ended inside `<img>` tag where we have break it in order to trigger an XSS


![](../../assets/images/portswigger/XSS/apprentice/xss-12.png)


With the actual HTML payload `"><h2>XSS` where we indeed break the image tag and our HTML tag got executed 


![](../../assets/images/portswigger/XSS/apprentice/xss-13.png)


It works right !!! and Now we with the following `"><svg onload=confirm(1)>` we break out of the `<img>` tag and our payload will get executed 

![](../../assets/images/portswigger/XSS/apprentice/xss-14.png)