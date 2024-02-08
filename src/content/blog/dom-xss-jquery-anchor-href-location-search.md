---
author: Nithissh S
pubDatetime: 2024-02-08
modDatetime: 2024-02-08
title: DOM XSS in jQuery anchor href attribute sink using location.search source
slug: dom-xss-jquery-anchor-href-location-search
featured: false
draft: false
tags:
  - XSS
  - Burp Certified Practitioner
description:
  This lab contains a DOM-based cross-site scripting vulnerability in the submit feedback page. It uses the jQuery library's $ selector function to find an anchor element, and changes its href attribute using data from location.search.  
---

## Intro

This lab contains a DOM-based cross-site scripting vulnerability in the submit feedback page. It uses the jQuery library's $ selector function to find an anchor element, and changes its href attribute using data from location.search. 

 To solve this lab, make the "back" link **alert(document.domain)**. 

## Solution

Like a previous labs where we faced a blog forum but in this lab, we have an additional feature called `Submit feedback`


![](../../assets/images/portswigger/XSS/apprentice/xss-18.png)


Once after going the `Submit feedback` feature we have new parameter called `?returnPath=` 


![](../../assets/images/portswigger/XSS/apprentice/xss-19.png)


For an instance in the `returnPath` parameter, I've entered a random text something like my name `nithissh` where it is reflected in the response inside `href` attribute 


![](../../assets/images/portswigger/XSS/apprentice/xss-20.png)


Since it is getting reflected inside `href` tag we can add the following payload which `javascript:alert(document.cookie)` on to the `?returnPath=` parameter as an value and after sending the request, our lab is solved


![](../../assets/images/portswigger/XSS/apprentice/xss-21.png)