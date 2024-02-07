---
author: Nithissh S
pubDatetime: 2024-02-07
modDatetime: 2024-02-07
title: DOM XSS in innerHTML sink using source location.search
slug: dom-xss-innerhtml-location-search
featured: false
draft: false
tags:
  - XSS
  - Burp Certified Practitioner
description:
  This lab contains a DOM-based cross-site scripting vulnerability in the search blog functionality. It uses an innerHTML assignment, which changes the HTML contents of a div element, using data from location.search. 
---

## Intro

This lab contains a DOM-based cross-site scripting vulnerability in the search blog functionality. It uses an innerHTML assignment, which changes the HTML contents of a div element, using data from location.search. 

## Solution

It's like same lab as previous, In the search we can enter the following payload like `"><h2>XSS` and observed that `"` actually broken `<span>` tag and executed the HTML tag 


![](../../assets/images/portswigger/XSS/apprentice/xss-15.png)


Well, In that case with the following payload `"><img src=x onerror=alert(1)>` where `"` will actually break the `<span>` tag and rest of the `<img>` tag will get executed 


![](../../assets/images/portswigger/XSS/apprentice/xss-16.png)


The XSS pops up 


![](../../assets/images/portswigger/XSS/apprentice/xss-17.png)