# auth_module

Authentication module


## Git related rules

git url : https://github.com/Auth-Module/Auth

### for first time

first check your branch name github by visiting : https://github.com/Auth-Module/Auth/branches <br />
you can check available branch names. <br />

current available branch names are :
1. subhadip :  https://github.com/Auth-Module/Auth/tree/subhadip
2. divyam : https://github.com/Auth-Module/Auth/tree/divyam
3. harshit : https://github.com/Auth-Module/Auth/tree/harshit
4. sanjay : https://github.com/Auth-Module/Auth/tree/sanjay
5. shammi : https://github.com/Auth-Module/Auth/tree/shammi
6. main : < we can not push code to main without code review >

#### for the first time fetch branch
git fetch origin <remote_branch_name>   <br />
git checkout --track origin/<remote_branch_name> <br />
example code: 

```console
git fetch origin shammi
git checkout --track origin/shammi

```

### sync remort git to local development

##### step 1
first pull recent code from main branch : `git pull --rebase origin main` <br />

##### step 2
do your work or changes in teh project <br />

##### step 3
the push the code by :

```console
git add .
git commit -m " message [jira issue id] "
git push

```

example:

```console
git add .
git commit -m " fix: error fixed [AM-555] "
git push

```

##### step 3
go to your github branch , as per this list:
1. subhadip :  https://github.com/Auth-Module/Auth/tree/subhadip
2. divyam : https://github.com/Auth-Module/Auth/tree/divyam
3. harshit : https://github.com/Auth-Module/Auth/tree/harshit
4. sanjay : https://github.com/Auth-Module/Auth/tree/sanjay
5. shammi : https://github.com/Auth-Module/Auth/tree/shammi

you will see message like : `This branch is x commits ahead of main.`  <br />
click on : `Contribute`  <br />
click on : `Open Pull Request`  <br />
create pull request : by putting some message about the task  <br />
choose Reviewers 


