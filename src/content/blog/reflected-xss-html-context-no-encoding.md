---
author: Nithissh S
pubDatetime: 2024-02-06
modDatetime: 2024-02-06
title: Reflected XSS into HTML context with nothing encoded
slug: reflected-xss-html-context-no-encoding
featured: true
draft: false
tags:
  - XSS
  - Burp Certified Practitioner
description:
  Writeup of one portswigger XSS lab in an apprentice level where we don't need any encoding but with a simple XSS payload
---

## Intro

Welcome to our pod! Today, we're tackling XSS vulnerabilities in HTML contexts with no encoding. Our blog forum allows users to post, with featured blogs showcased on top. We'll test this vulnerability by injecting simple HTML like `<h2>XSS` and then escalate with an XSS payload like `<img src=x onerror=confirm(1)>` to see if execution occurs. Let's dive in!"

## Solution

This is a blog forum where the users may post and featured blogs are appears on the top 

![](../../assets/images/portswigger/XSS/apprentice/xss-1.png)


If we search for the random text like for our `XSS`  i’m searching and it is getting reflected in the response through the `?search=`  parameter 


![](../../assets/images/portswigger/XSS/apprentice/xss-2.png)


Ok, awesome let’s try for a simple HTML Injection payload and let’s see if there is any execution and for the example I’m trying `<h2>XSS`  where XSS text appears as a **Heading 2**


![](../../assets/images/portswigger/XSS/apprentice/xss-3.png)


Now let’s try for an XSS payload like `<img src=x onerror=confirm(1)>`  where the payload executes and if the error appear there will be a xss popup and lab will be solved 


![](../../assets/images/portswigger/XSS/apprentice/xss-4.png)

## Takeaway

XSS vulnerabilities in HTML contexts without encoding can lead to malicious code execution. Always sanitize user input to prevent such attacks

