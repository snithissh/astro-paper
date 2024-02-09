---
author: Nithissh S
pubDatetime: 2024-02-09
modDatetime: 2024-02-09
title:  DOM XSS in AngularJS expression with angle brackets and double quotes HTML-encoded
slug: dom-xss-angularjs-expression-angle-brackets-double-quotes-html-encoded
featured: false
draft: false
tags:
  - XSS
  - Burp Certified Practitioner
description:
    This lab contains a DOM-based cross-site scripting vulnerability in a AngularJS expression within the search functionality.
---

## Intro

This lab contains a DOM-based cross-site scripting vulnerability in a AngularJS expression within the search functionality.

AngularJS is a popular JavaScript library, which scans the contents of HTML nodes containing the ng-app attribute (also known as an AngularJS directive). When a directive is added to the HTML code, you can execute JavaScript expressions within double curly braces. This technique is useful when angle brackets are being encoded. 


## Solution

In this lab, we do have a search functionality and looking into the source of the page and found that the angular JS being used versionn `1.7.7`


![](../../assets/images/portswigger/XSS/apprentice/xss-38.png)


After doing R&D about this specific XSS with an angular bracket and for example, In the search field entering the following payload `{{1 + 1}}` results in `2` 


![](../../assets/images/portswigger/XSS/apprentice/xss-39.png)


Great, I've found the following payload somewhere on internet `{{constructor.constructor('alert(1)')()}}` where through constructor we can pop an alert and Entered the following payload on search and triggers an XSS and the lab is solved 


![](../../assets/images/portswigger/XSS/apprentice/xss-40.png)