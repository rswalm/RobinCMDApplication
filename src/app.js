var express = require('express');
var { json, request } = require('express');
var table = require('text-table');
var inquirer = require('inquirer');
var sql = require("mssql");

var app = express();

// config for your database
var config = {
    user: 'robin2',
    password: 'abc',
    server: 'localhost', 
    database: 'RobinCMDDB',
    "options": {
        "encrypt": true,
        "enableArithAbort": true
        }
};

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('select * from Employee', function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            //console.log(recordset);
            
        });
    });

    inquirer.prompt([
        {
            type: 'list', 
            message:'What would you like to do? ',
            name: 'Emps',
            choices: ["View All Employees",
                      "Add Employees",
                      "Update Employees",
                      "Remove Employee",
                      "View All Roles",
                      "Add Role",
                      "Remove Role",
                      "View All Departments",
                      "Add Department",
                      "Remove Department"
                    ]
        }
    ])
    .then(answers=>{
        //console.log('----Selecting option-----');
        //console.log(answers);
        //console.log(answers.Emps);
        if(answers.Emps=='View All Employees'){
                // connect to your database
            sql.connect(config, function (err) {
            
                if (err) console.log(err);

                // create Request object
                var request = new sql.Request();
                
                // query to the database and get the records
                var CustomeQuery = `SELECT e.Id, e.LastName, e.FirstName, r.Title, r.Salary, d.Name AS Department, CONCAT(c.FirstName, ' ',c.LastName) AS Manager
                FROM  Employee AS e
                 INNER JOIN Employee AS c ON c.Id = e.ManagerID
                 LEFT JOIN Role AS r on r.Id = e.RoleID
                 LEFT JOIN Department AS d on r.DepartmentID = d.Id`;
                request.query(CustomeQuery, function (err, recordset) {
                    
                    if (err) console.log(err)

                    // send records as a response
                
                    var ParentArray = new Array();
                        ParentArray.push(['Id','First Name','Last Name','Title','Department','Salary','Manager']);
                    var result = recordset.recordset;
                    var tblArry= new Array();
                    result.forEach((items)=>{
                        ParentArray.push([items.Id,items.FirstName,items.LastName, items.Title, items.Department, items.Salary, items.Manager])
                    });
                    //console.log(tblArry);
                    // var t = table([
                    //     ['Id','First Name','Last Name'],
                    // ]);
                    var t = table(ParentArray);

                    console.log(t);
                    
                });
            });
            
        }else if(answers.Emps=='Add Employees'){

            var RoleList = new Array();
            // connect to your database
            sql.connect(config, function (err) {
                        
                if (err) console.log(err);

                var request = new sql.Request();
            
                // query to the database and get the records
                var CustomeQuery = `SELECT * FROM Role`;
                request.query(CustomeQuery, function (err, recordset) {
                    
                    if (err) console.log(err)
                    var result = recordset.recordset;
                    //console.log(result);
                    result.forEach((items)=>{
                        RoleList.push(items.Title)
                    });                    
                });
            });

            inquirer.prompt([
                {
                    type: 'input', 
                    message:'Enter First Name: ',
                    name: 'FirstName',
                },
                {
                    type: 'input', 
                    message:'Enter Last Name: ',
                    name: 'LastName',
                },
                {
                    type: 'list', 
                    message:'Select Role ',
                    name: 'Role',
                    choices: RoleList
                }
            ]).then(answers=>{
                //console.log(answers.FirstName);
                //console.log(answers.LastName);
                var FirstName = answers.FirstName;
                var LastName = answers.LastName;
                var Role = answers.Role;
                var RoleID;
        
                //console.log(Role);
                sql.connect(config, function (err) {
            
                    if (err) console.log(err);
    
                    // create Request object
                    var request = new sql.Request();


                    var CustomeQuery = `SELECT d.Id, d.Title FROM Role AS d WHERE d.Title='`+Role+`'`;
                    request.query(CustomeQuery, function (err, recordset) {
                        
                        if (err) console.log(err)
                        var result = recordset.recordset;                          
                        RoleID = result[0].Id; 

                    var InsertQuery = `Insert INTO dbo.Employee (FirstName, LastName, RoleID) VALUES ('`+FirstName+`','`+LastName+`',`+RoleID+`)`;

                    request.query(InsertQuery,(err,result)=>{
                        if(err){
                            console.log(err);
                        }
                        //console.log(result);
                        if(result.rowsAffected>0){
                            console.log('\n------->>>>>---New record inserted successfully---<<<<<------------');
                        }
                    })

                   })
                })
            })
          
        }else if(answers.Emps=='Update Employees'){

            sql.connect(config, function (err) {
            
                if (err) console.log(err);

                // create Request object
                var request = new sql.Request();
                
                // query to the database and get the records
                var CustomeQuery = `SELECT e.LastName, e.FirstName
                    FROM Employee AS e`;
                request.query(CustomeQuery, function (err, recordset) {
                    
                    if (err) console.log(err)                
                   //console.log(recordset);
                   var result = recordset.recordset;
                   var EmployeeList = new Array();
                   result.forEach((items)=>{
                    EmployeeList.push(items.FirstName)
                     });
                   inquirer.prompt([
                        {
                            type: 'list', 
                            message:'Provide your details',
                            name: 'Emps',
                            choices: EmployeeList
                        }
                    ]).then(answers=>{
                        //console.log(answers);
                        var FirstNameOfUser = answers.Emps;
                        console.log('----Enter new changes for Employee: '+answers);

                        
                        var RoleList = new Array();
                        // connect to your database
                        sql.connect(config, function (err) {
                                    
                            if (err) console.log(err);

                            var request = new sql.Request();
                        
                            // query to the database and get the records
                            var CustomeQuery = `SELECT * FROM Role`;
                            request.query(CustomeQuery, function (err, recordset) {
                                
                                if (err) console.log(err)
                                var result = recordset.recordset;
                                //console.log(result);
                                result.forEach((items)=>{
                                    RoleList.push(items.Title)
                                });                    
                            });
                        });

                        inquirer.prompt([
                            {
                                type: 'input', 
                                message:'Enter First Name: ',
                                name: 'FirstName',
                            },
                            {
                                type: 'input', 
                                message:'Enter Last Name: ',
                                name: 'LastName',
                            },
                            {
                                type: 'list', 
                                message:'Select Role ',
                                name: 'Role',
                                choices: RoleList
                            }
                        ]).then(answers=>{
                            var FirstName = answers.FirstName;
                            var LastName = answers.LastName;
                            var Role = answers.Role;
                            var RoleID;
                         
                            //console.log(Role);
                            sql.connect(config, function (err) {
                        
                                if (err) console.log(err);
                                // create Request object
                                var request = new sql.Request();

                                var CustomeQuery = `SELECT d.Id, d.Title FROM Role AS d WHERE d.Title='`+Role+`'`;
                                request.query(CustomeQuery, function (err, recordset) {
                                    
                                    if (err) console.log(err)
                                    var result = recordset.recordset;                          
                                    RoleID = result[0].Id; 

                                var updateQuery = `UPDATE Employee SET FirstName ='`+FirstName+`', LastName = '`+LastName+`', RoleID=`+RoleID+` WHERE FirstName ='`+FirstNameOfUser+`'`;
                                //var InsertQuery = "Insert INTO dbo.Employee (FirstName, LastName, RoleID) VALUES ('test','mist',1)";

                                request.query(updateQuery,(err,result)=>{
                                    if(err){
                                        console.log(err);
                                    }
                                    //console.log(result);
                                    if(result.rowsAffected>0){
                                        console.log('\n------->>>>>---Record updated successfully---<<<<<------------');
                                    }
                                })

                            })
                        })
                    })
      
                  })
                });
            });
        }else if(answers.Emps=='Remove Employee'){

            sql.connect(config, function (err) {
            
                if (err) console.log(err);

                // create Request object
                var request = new sql.Request();
                
                // query to the database and get the records
                var CustomeQuery = `SELECT e.LastName, e.FirstName
                    FROM Employee AS e`;
                request.query(CustomeQuery, function (err, recordset) {
                    
                    if (err) console.log(err)

                    // send records as a response
                
                  // console.log(recordset);
                   var result = recordset.recordset;
                   var EmployeeList = new Array();
                   result.forEach((items)=>{
                    EmployeeList.push(items.FirstName)
                     });
                   inquirer.prompt([
                        {
                            type: 'list', 
                            message:'Provide your details',
                            name: 'Emps',
                            choices: EmployeeList
                        }
                    ]).then(answers=>{
                       
                            console.log(answers.Emps);

                            FirstNameOfUser = answers.Emps;
                            //console.log(FirstNameOfUser);

                            sql.connect(config, function (err) {
                        
                                if (err) console.log(err);
                                console.log(FirstNameOfUser);
                                // create Request object
                                var request = new sql.Request();
                                var updateQuery = `DELETE FROM Employee WHERE FirstName = '`+FirstNameOfUser+`'`;
                                //var InsertQuery = "Insert INTO dbo.Employee (FirstName, LastName, RoleID) VALUES ('test','mist',1)";

                                request.query(updateQuery,(err,result)=>{
                                    if(err){
                                        console.log(err);
                                    }
                                    //console.log(result);
                                    if(result.rowsAffected>0){
                                        console.log('\n------->>>>>---Record Removed successfully---<<<<<------------');
                                    }
                                })

                            })
                        
                    })
      
                    
                });
            });
        }else if(answers.Emps=="View All Roles"){
                  // connect to your database
                  sql.connect(config, function (err) {
            
                    if (err) console.log(err);
    
                    // create Request object
                    var request = new sql.Request();
                    
                    // query to the database and get the records
                    var CustomeQuery = `SELECT r.Id, r.Title, r.Salary, d.Name AS Department 
                    FROM Role AS r 
                    LEFT JOIN Department AS d on r.DepartmentID = d.Id`;
                    request.query(CustomeQuery, function (err, recordset) {
                        
                        if (err) console.log(err)
    
                        // send records as a response
                    
                       //console.log(recordset);
                        //console.log(recordset.recordset[0].Id);
                        var ParentArray = new Array();
                            ParentArray.push(['Id','Title','Salary','Department']);
                        var result = recordset.recordset;
                        var tblArry= new Array();
                        result.forEach((items)=>{
                            ParentArray.push([items.Id,items.Title,items.Salary,items.Department])
                        });
                        var t = table(ParentArray);
    
                        console.log(t);
                        
                    });
                });
        }else if(answers.Emps=="Add Role"){

            var DepartmentList = new Array();
            // connect to your database
            sql.connect(config, function (err) {
                        
                if (err) console.log(err);

                var request = new sql.Request();
            
                // query to the database and get the records
                var CustomeQuery = `SELECT * FROM Department`;
                request.query(CustomeQuery, function (err, recordset) {
                    
                    if (err) console.log(err)
                    var result = recordset.recordset;
                    //console.log(result);
                    result.forEach((items)=>{
                        DepartmentList.push(items.Name)
                    });                    
                });
            });

            inquirer.prompt([
                {
                    type: 'input', 
                    message:'Enter Title: ',
                    name: 'Title',
                },
                {
                    type: 'input', 
                    message:'Enter Salary: ',
                    name: 'Salary',
                },
                {
                    type: 'list', 
                    message:'Select Department ',
                    name: 'Department',
                    choices: DepartmentList
                }
            ]).then(answers=>{
  
                var Title = answers.Title;
                var Salary = answers.Salary;
                var Department = answers.Department;
                var DepartmentID;
               
                
                sql.connect(config, function (err) {
            
                    if (err) console.log(err);
                    // create Request object
                    var request = new sql.Request();
                     // query to the database and get the records
                     var CustomeQuery = `SELECT d.Id, d.Name FROM Department AS d WHERE d.Name='`+Department+`'`;
                     request.query(CustomeQuery, function (err, recordset) {
                         
                         if (err) console.log(err)
                         var result = recordset.recordset;                          
                         DepartmentID = result[0].Id;          

                            var InsertQuery = `Insert INTO Role (Title, Salary, DepartmentID) VALUES ('`+Title+`','`+Salary+`',`+DepartmentID+`)`;
                            request.query(InsertQuery,(err,result)=>{
                                if(err){
                                    console.log(err);
                                }
                                //console.log(result);
                                if(result.rowsAffected>0){
                                    console.log('\n------->>>>>---New record inserted successfully---<<<<<------------');
                                }
                            })

                     });

                })
            })
        }else if(answers.Emps=="Remove Role"){
            sql.connect(config, function (err) {
            
                if (err) console.log(err);

                // create Request object
                var request = new sql.Request();
                
                // query to the database and get the records
                var CustomeQuery = `SELECT r.Title
                    FROM Role AS r`;
                request.query(CustomeQuery, function (err, recordset) {
                    
                    if (err) console.log(err)

                    // send records as a response
                
                  // console.log(recordset);
                   var result = recordset.recordset;
                   var RoleList = new Array();
                   result.forEach((items)=>{
                    RoleList.push(items.Title)
                     });
                   inquirer.prompt([
                        {
                            type: 'list', 
                            message:'Provide your details',
                            name: 'Emps',
                            choices: RoleList
                        }
                    ]).then(answers=>{
                       
                            console.log(answers.Emps);

                            RoleTitleToRemove = answers.Emps;
                            //console.log(FirstNameOfUser);

                            sql.connect(config, function (err) {
                        
                                if (err) console.log(err);
                                console.log(RoleTitleToRemove);
                                // create Request object
                                var request = new sql.Request();
                                var updateQuery = `DELETE FROM Role WHERE Title = '`+RoleTitleToRemove+`'`;
                                //var InsertQuery = "Insert INTO dbo.Employee (FirstName, LastName, RoleID) VALUES ('test','mist',1)";

                                request.query(updateQuery,(err,result)=>{
                                    if(err){
                                        console.log(err);
                                    }
                                    //console.log(result);
                                    if(result.rowsAffected>0){
                                        console.log('\n------->>>>>---Record Removed successfully---<<<<<------------');
                                    }
                                })

                            })
                        
                    })
                    
                });
            });
        }else if(answers.Emps=="View All Departments"){
            sql.connect(config, function (err) {
            
                if (err) console.log(err);

                // create Request object
                var request = new sql.Request();
                
                // query to the database and get the records
                var CustomeQuery = `SELECT d.Id, d.Name
                    FROM Department AS d`;
                request.query(CustomeQuery, function (err, recordset) {
                    
                    if (err) console.log(err)

                    // send records as a response
                
                    var ParentArray = new Array();
                        ParentArray.push(['Id','Department']);
                    var result = recordset.recordset;
                    var tblArry= new Array();
                    result.forEach((items)=>{
                        ParentArray.push([items.Id,items.Name])
                    });
    
                    var t = table(ParentArray);

                    console.log(t);
                    
                });
            });
        }else if(answers.Emps=="Add Department"){

            inquirer.prompt([
                {
                    type: 'input', 
                    message:'Enter Department: ',
                    name: 'Department',
                }
            ]).then(answers=>{
                //console.log(answers.FirstName);
                //console.log(answers.LastName);
                var Department = answers.Department;

                //console.log(Role);
                sql.connect(config, function (err) {
            
                    if (err) console.log(err);
    
                    // create Request object
                    var request = new sql.Request();

                    var InsertQuery = `Insert INTO Department (Name) VALUES ('`+Department+`')`;

                    request.query(InsertQuery,(err,result)=>{
                        if(err){
                            console.log(err);
                        }
                        //console.log(result);
                        if(result.rowsAffected>0){
                            console.log('\n------->>>>>---New record inserted successfully---<<<<<------------');
                        }
                    })

                   
                })
            })
        }else if(answers.Emps=="Remove Department"){
            sql.connect(config, function (err) {
            
                if (err) console.log(err);

                // create Request object
                var request = new sql.Request();
                
                // query to the database and get the records
                var CustomeQuery = `SELECT d.Name
                    FROM Department AS d`;
                request.query(CustomeQuery, function (err, recordset) {
                    
                    if (err) console.log(err)

                    // send records as a response
                
                  // console.log(recordset);
                   var result = recordset.recordset;
                   var DepartmentList = new Array();
                   result.forEach((items)=>{
                    DepartmentList.push(items.Name)
                     });
                   inquirer.prompt([
                        {
                            type: 'list', 
                            message:'Provide your details',
                            name: 'Emps',
                            choices: DepartmentList
                        }
                    ]).then(answers=>{
                       
                            console.log(answers.Emps);

                            DepartmentToRemove = answers.Emps;
                            //console.log(FirstNameOfUser);

                            sql.connect(config, function (err) {
                        
                                if (err) console.log(err);
                                console.log(DepartmentToRemove);
                                // create Request object
                                var request = new sql.Request();
                                var updateQuery = `DELETE FROM Department WHERE Name = '`+DepartmentToRemove+`'`;
                                //var InsertQuery = "Insert INTO dbo.Employee (FirstName, LastName, RoleID) VALUES ('test','mist',1)";

                                request.query(updateQuery,(err,result)=>{
                                    if(err){
                                        console.log(err);
                                    }
                                    //console.log(result);
                                    if(result.rowsAffected>0){
                                        console.log('\n------->>>>>---Record Removed successfully---<<<<<------------');
                                    }
                                })

                            })
                        
                    })
                    
                });
            });
        }
    
    });
    

var server = app.listen(5000, function () {
    console.log('Server is running..');
});