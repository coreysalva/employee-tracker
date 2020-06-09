DROP DATABASE IF EXISTS employee_trackerDB;

CREATE DATABASE employee_trackerDB;

USE employee_trackerDB;

CREATE TABLE department (
	id INT auto_increment NOT NULL,
    name VARCHAR(30),
    primary key (id)
);

CREATE TABLE role (
	id INT NOT NULL auto_increment,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INT,
    primary key (id)
);

CREATE TABLE employee (
	id INT NOT NULL auto_increment,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT,
    primary key (id)
);


USE employee_trackerDB;
SET SQL_SAFE_UPDATES = 0;

-- All employees
SELECT e.id AS e_id, CONCAT(e.first_name, " ", e.last_name) AS e_name, role.title AS title, department.name AS department, role.salary AS salary, CONCAT(m.first_name, " ", m.last_name) AS m_name
FROM employee AS e INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id LEFT JOIN employee AS m ON e.manager_id = m.id;

-- Employees By Department
SELECT e.id AS e_id, CONCAT(e.first_name, ' ', e.last_name) AS e_name, d.name AS department
FROM employee AS e INNER JOIN role AS r ON e.role_id = r.id INNER JOIN department AS d ON r.department_id = d.id;

-- Employee by manager
SELECT e.id AS e_id, CONCAT(e.first_name, ' ', e.last_name) AS e_name, CONCAT(m.first_name, ' ', m.last_name) AS m_name
FROM employee AS e INNER JOIN employee AS m ON e.manager_id = m.id;


-- GET employees (managers)
SELECT DISTINCT CONCAT(m.first_name, ' ', m.last_name) AS m_name FROM employee AS m RIGHT JOIN employee AS e ON m.id = e.manager_id WHERE CONCAT(m.first_name, ' ', m.last_name) is not null;

SELECT CONCAT(m.first_name, ' ', m.last_name) AS m_name, role.title FROM employee AS m LEFT JOIN role ON role.title = 'General Manager';

-- update employees manager
SELECT * FROM employee;
UPDATE employee AS e, employee AS m SET e.manager_id = m.id WHERE CONCAT(e.first_name, ' ', e.last_name) = "John Doe" AND CONCAT(m.first_name, ' ', m.last_name) = "John Marston";
SELECT * FROM employee;
