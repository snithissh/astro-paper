---
author: Nithissh S
pubDatetime: 2024-02-12
modDatetime: 2024-02-12
title: Identify Account ID for the Public S3 Bucket
slug: lab-identify-account-id-from-public-s3-bucket
featured: false
draft: false
tags:
  - Pwnedlabs
  - Cloud Pentest
description:
  Simulation of identifying the Account IDs of AWS accounts through the public s3 bucket by exploiting the misconfiguration on s3 bucket's IAM policy
---


## Identify Account ID for the Public S3 Bucket

As an initial entry endpoints we have been provided with the following details 

  

| IP Address | 54.204.171.32 |
| --- | --- |
| AWS ACCESS KEY | AKIAWHEOTHRFW4CEP7HK |
| AWS SECRET ACCESS KEY | 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 |

  

Before even we are starting out the challenge, we can looking into the fundamentals of understanding `Account ID`  and How we can understand and exploit this misconfiguration

  

### Short intro on how Account ID works

Account ID is 12 Digital Number like `1234567891234`  which helps in identifying the AWS accounts and we can also identify resource aligned with it through arn strings ( eg. `arn:aws:iam::1234567891234:role/dev` ) where the Account ID is `1234567891234` 

  

### Outro of understanding how we can enumerate

- Every AWS resource including s3 will belong to particular AWS account which will be identified through Account ID 
- Usually IAM helps in restricting access to resources on AWS by determining this role will access to resources they were allowed or if there is no access then they will throw `access denied` error
- Then they have introduced new resource based policy which is `S3:ResourceAccount` where you can able to specify that this particular Account  should have access to s3 bucket.. only Account with access to resources will be allowed or else the access will be restricted 
- In order to make a verification, For eg. Let's assume we have an account with an account ID `123412341234` have access to s3 bucket called `devtest`.. due to `s3:ResourceAccount` Policy if you try to access the same s3 bucket from a different account with account ID `123412341235` we won't able to access it.. It will be accessible only when you have right account ID

  

### Solution to the challenge 

  

With the following IP addresss `54.204.171.32`  we have an HTTP application which looks like a ecommerce application where they fetches the image from the following s3 bucket `mega-big-tech.s3.amazonaws.com` 

  

![](../../assets/images/research/identity-1.png)

  

In the mentioned s3 bucket, we can able to get the object which is image files and when opening the s3 bucket link directly, list out the objects in the bucket.. then my understanding is assume that for this s3 bucket we have two policies had been implemented which is `GetObject`  and `ListBucket`

  

#### Example IAM Policy being implemented on mega-big-tech s3 bucket 

  

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Enum",
            "Effect": "Allow",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::mega-big-tech/*"
        },
        {
            "Sid": "Enum1",
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::mega-big-tech"
        }
    ]
}
```

  

Before even going into main phase of exploitation, we need to some detail on our s3 bucket which is to get the region and for that we can use `curl`  and the region is on `us-east-1`  which is by default 

  

```sh
nits@FWS-CHE-LT-8869 09-02-2024 % curl -I "https://mega-big-tech.s3.amazonaws.com"
HTTP/1.1 200 OK
x-amz-id-2: dDHTbab4SDDNMz0NhYu1Qs48Ei+PaWgxNQ71tMXQLAluCkt8MzahXyI/tydcV6wsaZBr4bJL7JE=
x-amz-request-id: 75XY0KYZ4EP7TK44
Date: Mon, 12 Feb 2024 05:50:31 GMT
x-amz-bucket-region: us-east-1
x-amz-access-point-alias: false
Content-Type: application/xml
Server: AmazonS3
```

  

Now, lets configure the AWS credentials as initially provided and let’s run `aws sts get-caller-identity`  which reveals that the credential belongs to `s3user`  

  

```sh
nits@FWS-CHE-LT-8869 09-02-2024 % aws sts get-caller-identity --profile leakybucket
{
    "UserId": "AIDAWHEOTHRF62U7I6AWZ",
    "Account": "427648302155",
    "Arn": "arn:aws:iam::427648302155:user/s3user"
}
```

  

With the current credentials, we don’t access to the s3 bucket where we have already mentioned that this validation will be based on your account and account ID 

  

```sh
nits@FWS-CHE-LT-8869 09-02-2024 % aws s3 ls s3://mega-big-tech --profile leakybucket

An error occurred (AccessDenied) when calling the ListObjectsV2 operation: Access Denied
```

  

Assume we have another role called `LeakyBucket`  we can check this account against the s3 bucket called `mega-big-tech`  and bruteforce their `Account ID`  using a tool [s3-account-search](https://github.com/WeAreCloudar/s3-account-search "https://github.com/WeAreCloudar/s3-account-search")

  

```sh
nits@FWS-CHE-LT-8869 09-02-2024 % s3-account-search arn:aws:iam::427648302155:role/LeakyBucket mega-big-tech
Starting search (this can take a while)
found: 1
found: 10
found: 107
found: 1075
found: 10751
found: 107513
found: 1075135
found: 10751350
found: 107513503
found: 1075135037
found: 10751350379
found: 107513503799
```

  

Breaking down of the above command, we have same arn id with assuming a role called `LeakyBucket`  against the s3 bucket called `mega-big-tech`  and found that the account ID is  `107513503799`  is identified as flag 

  

### Further Possible Escalation with the Account ID 

  

Now in our AWS console, Go for the region as `us-east-1`  and sometimes you need to change it in console if you are like me where I’m from india it will be in `ap-southeast-1`


![](../../assets/images/research/identity-2.png) 

  

In the EC2 service, we have a ability to look into the public snapshots ( Kind of snapshots provided by public or sometimes due to misconfiguration made by account by search through Account ID ) For our scenario, we made search with the following account ID `107513503799`  and found that public EBS snapshot available 

  

![](../../assets/images/research/identity-3.png)
