---
author: Nithissh S
pubDatetime: 2024-02-09
modDatetime: 2024-02-09
title: Stored XSS into anchor href attribute with double quotes HTML-encoded
slug: stored-xss-anchor-href-double-quotes-html-encoded
featured: false
draft: false
tags:
  - XSS
  - Burp Certified Practitioner
description:
   This lab contains a stored cross-site scripting vulnerability in the comment functionality. To solve this lab, submit a comment that calls the alert function when the comment author name is clicked. 
---

## Intro 

 This lab contains a stored cross-site scripting vulnerability in the comment functionality. To solve this lab, submit a comment that calls the alert function when the comment author name is clicked. 

## Solution

In this lab, we have functionality to comment on that blog where we comment on any name and email address


![](../../assets/images/portswigger/XSS/apprentice/xss-29.png)


Once after submiiting for a comment and found that `name` being taken as a `author` reflected inside the `href` attribute 


![](../../assets/images/portswigger/XSS/apprentice/xss-30.png)



Now adding the following payload `javascript:alert(1)` as a value inside `Website` field and lab is solved 


![](../../assets/images/portswigger/XSS/apprentice/xss-31.png)



Well, Clicking on the hyperlink and executes the payload


![](../../assets/images/portswigger/XSS/apprentice/xss-32.png)