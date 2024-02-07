---
author: Nithissh S
pubDatetime: 2024-02-07
modDatetime: 2024-02-07
title: Stored XSS into HTML context with nothing encoded
slug: stored-xss-into-html-context-with-nothing-encoded
featured: false
draft: false
tags:
  - XSS
  - Burp Certified Practitioner
description:
  Writeup of one portswigger XSS lab in an apprentice level where we don't need any encoding but with a simple XSS payload by adding comment on the blog post 
---

## Intro

In this writeup, we'll explore a PortSwigger XSS lab at an apprentice level, focusing on exploiting stored XSS into an HTML context without the need for encoding. The lab simulates a blog forum where authors can post their blogs. By exploiting a vulnerability in the comment functionality, we'll demonstrate how a simple XSS payload can be injected and executed.


## Solution

Once after spinning the lab, The website looks like a blog forum where the authors can post their own blog 



![](../../assets/images/portswigger/XSS/apprentice/xss-5.png)



In the blog forum, after clicking the `view post` we have a functionality to comment on that post 



![](../../assets/images/portswigger/XSS/apprentice/xss-6.png)



Determing the input field might be vulnerable to stored XSS.. I've tried injecting it with random html payloads like `"><h2>XSS` on all the fields and fortunately the **comment** field is vulnerable to a stored HTML Injection in our case 


![](../../assets/images/portswigger/XSS/apprentice/xss-7.png)


observing the source, we have breaken out of `<p>` tag and our rest of the `<h2>` payload got injected 


![](../../assets/images/portswigger/XSS/apprentice/xss-8.png)


Confirming that we will build a XSS payload `test"><img src=x onerror=confirm(document.domain)>` which will break `<p>` tag and execute the rest of `<img>` tag and our payload will get executed 


![](../../assets/images/portswigger/XSS/apprentice/xss-9.png)