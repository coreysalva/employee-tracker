truncate department;
INSERT department(name) values ("Frontend");
INSERT department(name) values ("Backend");
INSERT department(name) values ("Management");
INSERT department(name) values ("HR");

truncate role;
insert role(title, salary, department_id) values ("Front-End Developer", 75000.00, 1);
insert role(title, salary, department_id) values ("Back-End Developer", 85000.00, 2);
insert role(title, salary, department_id) values ("UI/UX Designer", 70000.00, 1);
insert role(title, salary, department_id) values ("Database Specialist", 90000.00, 2);
insert role(title, salary, department_id) values ("Human Resources", 80000.00, 3);
insert role(title, salary, department_id)  values ("General Manager", 80000.00, 4);


truncate employee;
insert employee(first_name, last_name, role_id) values ("Corey", "Salva", 6);
insert employee(first_name, last_name, role_id) values ("Bill", "Gates", 6);
insert employee(first_name, last_name, role_id, manager_id) values ("Tom", "Cruise", 1, 1);
insert employee(first_name, last_name, role_id, manager_id) values ("Bill", "Mathison", 2, 2);

SELECT * FROM employee LEFT JOIN role ON role.id = employee.role_id WHERE role.title = 'General Manager';

SELECT * FROM role;