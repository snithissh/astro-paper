---
author: Nithissh S
pubDatetime: 2024-03-28
modDatetime: 2024-03-28
title:  Stored DOM XSS 
slug: stored-dom-xss
featured: false
draft: false
tags:
  - XSS
  - Burp Certified Practitioner
description:
    This lab demonstrates a stored DOM vulnerability in the blog comment functionality. To solve this lab, exploit this vulnerability to call the alert() function. 
---

# Intro 

This lab is kind of looks like blog forum where we have a functionality to comment on each blog and our challenge is to exploit a stored DOM based XSS on that feature and trigger an `alert()` to solve the lab 

## Solution 

The functionality which they have mentioned in the challenge is to exploit the blog comment functionality which looks like as follows

![](../../assets/images/portswigger/XSS/apprentice/xss-44.png)


Now, In the `Comment` field as always tried the enter the following payload `test"><h2>XSS` and analysing the response resulted in reflecting inside `<p>` tag 


![](../../assets/images/portswigger/XSS/apprentice/xss-45.png)


Now, I was able to escape the `<p>` with the simple payload `test<><img>` which is closes the `<p>` and opens the `<img>` in new line 


![](../../assets/images/portswigger/XSS/apprentice/xss-46.png)


Great, and now with the complete payload `test<><img src =x onerror=alert(1)>` and we were able to trigger an `alert()` function and with that lab is solved 


![](../../assets/images/portswigger/XSS/apprentice/xss-47.png)
