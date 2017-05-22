# classql
A light-weight Node.js Typescript ORM for MySQL basic CRUD that is database-model-indepedent.

### What it does not do:
Run TABLE or VIEW creation queries for you.

### What it does do:
Allows you to decorate your Typescript class with a MySQL TABLE or VIEW name so you can run basic CRUD operations easily.

## Installation
`npm install --save classql`

## Example Use
Say you have a MySQL TABLE or VIEW:

```sql
CREATE TABLE USER_ACCOUNTS (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(45) NOT NULL,
  hashedPassword VARCHAR(100) NOT NULL,
  firstName VARCHAR(20) NOT NULL,
  lastName VARCHAR(20) NOT NULL
)
```

```typescript
import * as classql from 'classql';

@classql.model('USER_ACCOUNTS')
class UserAccount {
  id: number;
  email: string;
  hashedPassword: string;
  firstName: string;
  lastName: string;
}

// Create MySQL connection:
let db = new classql.Database({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'my_database_name'
});

// Or:
let db = new classql.Database('mysql://root:root@localhost/my_database_name?debug=true&timeout=1000000');


/** GET */
// Returns a single object or null:
await db.on(UserAccount).get({ id: 1 });

// Returns an object with any specified field(s) e.g. { email: 'jd@works.io' }
await db.on(UserAccount).get({ id: 1 }, ['email']);


/** GET ALL */
// Returns a list of objects or an empty list:
await db.on(UserAccount).getAll();
await db.on(UserAccount).getAll({ firstName: 'John' });

// To pass offset or limit option:
await db.on(UserAccount).getAll({ limit: 10, offset: 20 });
await db.on(UserAccount).getAll({ firstName: 'John' }, { limit: 10 });


/** DELETE */
// Delete any matched field(s):
await db.on(UserAccount).delete({ id: 5 });


/** CREATE OR UPDATE */
// If no id field exists, this method creates an object.
// Otherewise, it will update an existing tuple.
let account = new UserAccount({
  email: 'jd@works.io',
  hashedPassword: 'hasedPassword',
  firstName: 'John',
  lastName: 'Doe'
});
let result = await db.on(UserAccount).save(account);
let id = result.insertId;


/** CREATE ALL OR UPDATE ALL */
// If no id field exists on every object in a list, this method runs INSERT query.
// Otherwise, it will run INSERT and ON DUPLICATE UPDATE.
let items = [
  new UserAccount({ ... }), new UserAccount({ ... }), new UserAccount({ ... })
];
await db.on(UserAccount).saveAll(items);


// Alternatively, to enter prepared sql statement just do:
db.query('SELECT * FROM USER_ACCOUNTS WHERE id > 5').then(doSth).catch(doSthElse);


/** COUNT */
// Returns the number of result counted e.g. 12
await db.on(UserAccount).count({ name: 'John' });

```
