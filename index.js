const inquirer = require("inquirer");
const mysql = require("mysql");
const figlet = require("figlet");

setDBConnection = () => {
    return mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "nodeuser",
        password: "nodeuser",
        database: "employee_trackerDB"
    });
}

startQuestions = async () => {

    let connection = setDBConnection();

    let operationChoices = [ "VIEW", "ADD", "UPDATE"];
    let viewChoices = ["View All Employees", "View All Employees by Department", "View All Employees by Manager", "View Roles", "View Departments"];
    let addChoices = ["Add Employee", "Add Role", "Add Department"];
    let updateChoices = ["Update Employee Role", "Update Employee Managers"];

    let res = await showChoicePrompt(operationChoices);

    //Handle options
    switch(res){
        case "VIEW":
            res = await showChoicePrompt(viewChoices, "What would you like to do?");
            break;
        case "ADD":
            res = await showChoicePrompt(addChoices, "What would you like to do?");
            break;
        case "UPDATE":
            res = await showChoicePrompt(updateChoices, "What would you like to do?");
            break;
        default:
            startQuestions();
    }

    handleSelection(res, connection);
}

handleSelection = (userChoice, connection) => {

    switch(userChoice){
        //View
        case "View All Employees":
            viewAllEmployees(connection);
            break;
        case "View All Employees by Department":
            viewEmployeeByDepartment(connection);
            break;
        case "View All Employees by Manager":
            viewEmployeeByManager(connection);
            break;
        case "View Roles":
            viewRoles(connection);
            break;
        case "View Departments":
            viewDepartments(connection);
            break;

        //Add
        case "Add Employee":
            addEmployee(connection);
            break;
        case "Add Role":
            addRole(connection);
            break;
        case "Add Department":
            addDepartment(connection);
            break;

        //Update
        case "Update Employee Role":
            updateEmployeeRole(connection);
            break;
        case "Update Employee Managers":
            updateEmployeeManager(connection);
            break;
        default:
            console.log("Invalid Selection");
    }
}

viewAllEmployees = (connection) => {
    let query = "SELECT e.id AS e_id, CONCAT(e.first_name, ' ', e.last_name) AS e_name, role.title AS title, department.name AS department, role.salary AS salary, CONCAT(m.first_name, ' ', m.last_name) AS m_name FROM employee AS e INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id LEFT JOIN employee AS m ON e.manager_id = m.id";
    handleGetConnection(connection, query);
}

showChoicePrompt = (choices, message) => {
    return new Promise((resolve, reject) => {
        inquirer.prompt({
            type: "list",
            choices: choices,
            message: message,
            name: "userChoice"
        }).then(res => {
            if(res){
                resolve(res.userChoice);
            }
            else{
                reject("Error: Could not retrieve question data");
            }
        });
    });
}

getData = async (query, connection) => {

    return new Promise((resolve, reject) => {

        connection.query(query, (err,res)=> {
            if(err){
                reject(err);
            }
            else{
                resolve(res);
            }
        });
    });
}

viewEmployeeByDepartment = (connection) => {
    let query = "SELECT e.id AS e_id, CONCAT(e.first_name, ' ', e.last_name) AS e_name, d.name AS department FROM employee AS e INNER JOIN role AS r ON e.role_id = r.id INNER JOIN department AS d ON r.department_id = d.id";
    handleGetConnection(connection, query);
}

viewEmployeeByManager = (connection) => {
    let query = "SELECT e.id AS e_id, CONCAT(e.first_name, ' ', e.last_name) AS e_name, CONCAT(m.first_name, ' ', m.last_name) AS m_name FROM employee AS e INNER JOIN employee AS m ON e.manager_id = m.id";
    handleGetConnection(connection, query);
}

viewRoles = (connection) => {
    let query = "SELECT * FROM role";
    handleGetConnection(connection, query);
}

viewDepartments = (connection) => {
    let query = "SELECT * FROM department";
    handleGetConnection(connection, query);
}

addEmployee = (connection) => {

    let newEmployeeInfo = {};

    inquirer.prompt([
        {
            type: "input",
            message: "Please enter the employee's First name:",
            name: "firstName"
        },
        {
            type: "input",
            message: "Please enter the employees Last name:",
            name: "lastName"
        }
    ]).then(async res => {

        newEmployeeInfo.firstName = res.firstName;
        newEmployeeInfo.lastName = res.lastName;

            let response = await getData("SELECT r.id AS r_id, r.title AS r_title FROM role AS r", connection);

            let role_list = [];

            response.forEach(e => role_list.push({id: e.r_id, name: e.r_title}));

            let newRole = await showChoicePrompt(role_list, "Please enter the employees role:");

            for(let i=0;i<role_list.length;i++){
                if(role_list[i].name == newRole){
                    newEmployeeInfo.role = role_list[i];
                    break;
                }
            }

                let managers = await getData(`SELECT CONCAT(m.first_name, ' ', m.last_name) AS m_name, m.id AS m_id FROM employee AS m LEFT JOIN role ON role.id = m.role_id WHERE role.title = '${'General Manager'}'`,connection);
         
                let m_list = [];

                managers.forEach(e => m_list.push({id: e.m_id, name: e.m_name}));

                let new_manager = await showChoicePrompt(m_list, "Please assign a manager:");

                for(let i=0;i<m_list.length;i++){
                    if(m_list[i].name == new_manager){
                        newEmployeeInfo.manager_id = m_list[i].id;
                        break;
                    }
                }

                    connection.query("INSERT INTO employee SET ?",[
                        {
                            first_name: newEmployeeInfo.firstName,
                            last_name: newEmployeeInfo.lastName,
                            role_id: newEmployeeInfo.role.id,
                            manager_id: newEmployeeInfo.manager_id
                        }
                    ], (err,res) => {
                        if(err)throw err;

                        console.log("Employee Added!");
                        viewAllEmployees(connection);
                    });
                    
                });
}
  

addRole = (connection) => {

    let newRole = {};

    inquirer.prompt([
        {
            type: "input",
            message: "Please enter the title of the role:",
            name: "roleTitle"
        },
        {
            type: "input",
            message: "Please enter the salary of the role:",
            name: "roleSalary"
        }
    ]).then(async res => {

        newRole.title = res.roleTitle;
        newRole.salary = res.roleSalary;

        let response = await getData("SELECT d.name AS d_title, d.id AS d_id FROM department AS d",connection);
        let d_list = [];
        response.forEach(e => d_list.push({value: e.d_id, name: e.d_title}));

        let departmentId = await showChoicePrompt(d_list, "Which department is this role apart of?");

        connection.query("INSERT INTO role SET ?", [
            {
                title: newRole.title,
                salary: newRole.salary,
                department_id: departmentId
            }
        ], (err, res) => {
            if(err)throw err;

            console.log("Success!");
            viewRoles(connection);
        });
    });
}

addDepartment = (connection) => {
    inquirer.prompt({
        type: "input",
        message: "Please enter the name of the department:",
        name: "departmentName"
    }).then(res => {

        connection.query("INSERT INTO department SET ?", [
            {
                name: res.departmentName
            }
        ], (err,res) => {
            if(err)throw err;

            console.log("success!");
            viewDepartments(connection);
        });
    });
}

updateEmployeeManager = async (connection) => {

        let res = await getData("SELECT CONCAT(e.first_name, ' ', e.last_name) AS e_name, e.id AS e_id FROM employee AS e", connection);
        let e_list = [];

        res.forEach(e => e_list.push({id: e.e_id, name: e.e_name}));

        let employeeToChange = await showChoicePrompt(e_list, "Which employee' manager would you like to change?");
        let response = await getData(`SELECT CONCAT(m.first_name, ' ', m.last_name) AS m_name, m.id AS m_id FROM employee AS m LEFT JOIN role ON role.id = m.role_id WHERE role.title = '${'General Manager'}' `,connection);
        let m_list = [];

            response.forEach(e => m_list.push({id: e.m_id, name: e.m_name}));
            let new_manager = await showChoicePrompt(m_list, "Please assign a manager:");

            m_list.forEach(e => {
                if(e.name == new_manager){
                    new_manager = e;
                }
            });

            connection.query(`UPDATE employee AS e, employee AS m SET e.manager_id = m.id WHERE CONCAT(e.first_name, ' ', e.last_name) = '${employeeToChange}' AND CONCAT(m.first_name, ' ', m.last_name) = '${new_manager.name}'`, (err,res) => {
                if(err) throw err;
                console.log("Manager updated!");
                viewAllEmployees(connection);
            });
}

updateEmployeeRole = async (connection) => {

        let res = await getData("SELECT CONCAT(e.first_name, ' ', e.last_name) AS e_name, e.id AS e_id FROM employee AS e", connection);
        
        let e_list = [];

        res.forEach(e => e_list.push(e.e_name));

        let employeeToChange = await showChoicePrompt(e_list, "Which employee' role would you like to change?");

        let response = await getData("SELECT r.title AS r_title, r.id AS r_id FROM role AS r",connection);

        let role_list = [];
        response.forEach(e => role_list.push({id: e.r_id, name: e.r_title}));

        let newRole = await showChoicePrompt(role_list, "What is their new role?");

        role_list.forEach(e => {
            if(e.name == newRole){
                connection.query(`UPDATE employee AS e SET e.role_id = '${e.id}' WHERE CONCAT(e.first_name, ' ', e.last_name) = '${employeeToChange}'`, (err, res) => {
                    if(err)throw err;
                    console.log("Role Updated!");
                    viewAllEmployees(connection);
                });
            }
        });
}

handleGetConnection = async (connection, query) => {
    
    let res = await getData(query, connection);

    console.table(res);

    restartQuestions(connection);
}

restartQuestions = (connection) =>{
    connection.end();
    startQuestions();
}

init = () => {

    console.log(figlet.textSync("Employee Tracker"));
    startQuestions();
}

init();