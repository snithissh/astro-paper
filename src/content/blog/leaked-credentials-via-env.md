---
author: Nithissh S
pubDatetime: 2023-09-13
modDatetime: 2023-09-13
title: Leaked Database and SMTP credentials through .env file
slug: leaked-database-and-smtp-credentials-through-env-file
featured: true
draft: false
tags:
  - BugBounty
description:
  Identifies a bug in a self-driving car service's bug bounty program. They find a subdomain exposing a Laravel .env file due to Azure misconfigurations. Despite a 403 error, they exploit the vulnerability, gaining access to sensitive data. The program manager acknowledges the finding's validity but limits further escalation
---
## Introduction

Let me share with you the background of this bug bounty program. This bug bounty program is hosted independently and is built around the concept of offering self-driving cars as a service, along with providing marketing and digital solutions for drivers. While conducting reconnaissance on our target, we stumbled upon a subdomain. During our content discovery process on this subdomain, we encountered a **403 error** when attempting to access the .env file. However, it’s worth noting that there are certain restrictions in place when directly accessing their CNAME record, for instance, which is hosted on Azure and appears as ***.azurewebsites.com**. Interestingly, there are no such restrictions in place, allowing us to successfully access the .env file.

## Exploiting this Vulnerability

After recon, Found a subdomain where it is backend framework is meant to be laravel. Once after finding the subdomain, I have started doing content discovery on to the subdomain and found that **.env** file got disclosed through **ffuf**


![](../../assets/images/leak-1.png)


Now when we are opening our .env path in our browser and well it shows that we got a forbidden status


![](../../assets/images/leak-2.png)


Then how we exploited this issue, while there might be restrictions at the domain level like lets assume they might have placed restrictions at the *.example.com. But what about the CNAMEs or what about the hosting services like AWS or Azure. If you read my first blog, where the customer data got disclosed through a server which is hosted on EC2 instances. Same applies here, where check the cname record they have provided something like exampleapp.azurewebsites.net

```sh
root@DESKTOP-4SC48HP:/mnt/c/Users/nithi# dig example.com

; <<>> DiG 9.18.12-0ubuntu0.22.04.2-Ubuntu <<>> example.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 63749
;; flags: qr rd ad; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 0
;; WARNING: recursion requested but not available

;; QUESTION SECTION:
;example.com.                   IN      CNAME   exampleapp.azurewebsites.net

;; ANSWER SECTION:
example.com.            0       IN      A       13.69.68.62

;; Query time: 60 msec
;; SERVER: 172.23.224.1#53(172.23.224.1) (UDP)
;; WHEN: Fri Sep 08 04:14:48 PDT 2023
;; MSG SIZE  rcvd: 56
```

Now when you visit the exampleapp.azurewebsites.net on the browser and It does had the same response as same as the main website just like a mirrored site and opening the .env file suprisingly it didn’t had a restriction and we can able to view all the environment variables


![](../../assets/images/leak-3.png)


## Conclusion

We can also go further about the exploiting both the database and SMTP with those credentials but this program has certain limitations in order to make the proof of concept. In this situation, Where I had discussion with the program manager and they have informed that it is valid finding and Informed that don’t escalate further