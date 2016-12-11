var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);

connection.query('CREATE DATABASE ' + dbconfig.database);

connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.branch_table + '` ( \
    `b_id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `branchname` VARCHAR(50) NOT NULL, \
    `address` VARCHAR(50) NOT NULL, \
    `city` VARCHAR(50) NOT NULL, \
    `p_code` VARCHAR(50) NOT NULL, \
    `contact_no` VARCHAR(50) NOT NULL, \
    PRIMARY KEY (`b_id`), \
    UNIQUE INDEX `id_UNIQUE` (`b_id` ASC) \
)');


connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.customer_table + '` ( \
    `c_id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `first_name` VARCHAR(50) NOT NULL, \
    `last_name` VARCHAR(50) NOT NULL, \
    `address` VARCHAR(50) NOT NULL, \
    `city` VARCHAR(50) NOT NULL, \
    `p_code` VARCHAR(50) NOT NULL, \
    `email` VARCHAR(50) NOT NULL, \
    `contact_no` VARCHAR(50) NOT NULL, \
    `age` INT,\
	  `b_id` INT UNSIGNED NOT NULL,\
    PRIMARY KEY (`c_id`), \
    UNIQUE INDEX `id_UNIQUE` (`c_id` ASC), \
    INDEX (`b_id`),\
    FOREIGN KEY (`b_id`) REFERENCES `my_bank`.`branch`(`b_id`)\
)');


connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.account_table + '` ( \
    `a_id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `account_number` INT NOT NULL, \
    `acc_type` VARCHAR(9) NOT NULL, \
    `balance` DECIMAL(10,2), \
    `c_id` INT UNSIGNED NOT NULL, \
    PRIMARY KEY (`a_id`), \
    UNIQUE INDEX `id_UNIQUE` (`a_id` ASC), \
    INDEX (`c_id`),\
    FOREIGN KEY (`c_id`) REFERENCES `my_bank`.`customer`(`c_id`)\
)');


connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.transaction_table + '` ( \
    `t_id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `type` VARCHAR(50) NOT NULL, \
    `amount` INT NOT NULL, \
    `time_stamp` timestamp NOT NULL, \
    `a_id` INT UNSIGNED NOT NULL, \
    PRIMARY KEY (`t_id`), \
    UNIQUE INDEX `id_UNIQUE` (`t_id` ASC), \
    INDEX (`a_id`),\
    FOREIGN KEY (`a_id`) REFERENCES `my_bank`.`account`(`a_id`)\
)');

console.log('Success: Database Created!')

connection.end();