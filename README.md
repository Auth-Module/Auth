## project 

we have 2 main part in the project
1. Auth app 
2. Helper apps by docker-compose ( like DB , App1 , App2 for testing)


### run docker-compose file

run : `docker-compose up -d` <br>
this will run 
1. MySQL server
2. PhpMyAdmin 
3. test app1 (written in Nodejs)
4. test app2 (written in Python)
5. test app3 (static website - by Nginx)


# Auth App

the Main project is in folder : auth_app <br>
the documentation for auth app , is in folder :  auth_app <br>
** before running the authapp , we will run other test app.

get into folder : auth_app <br>
run command: `npm install`  <br>
run command: `npm run start`  <br>



## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)