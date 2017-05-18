# classql
A light-weight Typescript ORM for MySQL basic CRUD that is `database-model-indepedent`.

### What it does not do:
Run TABLE or VIEW creation queries for you.

### What it does do:
Allows you to decorate your Typescript class with a MySQL `TABLE` or `VIEW` name so you can run basic CRUD operations easily.

## Installation
Run `npm install --save classql`

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

/**
 * You can enter the database info as a string or an object:
 * 'mysql://root:root@localhost/my_database_name?debug=true&timeout=1000000'
 */
export const db = new classql.Database({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'my_database_name'
});

/** GET */
// This will return a single object or null if no result can be found.
await db.on(UserAccount).get({ id: 1 });

// This will return an object with the specified field(s) e.g. { email: 'jd@works.io' }
await db.on(UserAccount).get({ id: 1 }, ['email']);


/** GET ALL */
// These queries will return a list of objects or an empty list if none is found:
await db.on(UserAccount)>getAll();
await db.on(UserAccount).getAll({ firstName: 'John' });

// You can also pass an offset or limit option
await db.on(UserAccount).getAll({ limit: 10, offset: 20 });
await db.on(UserAccount).getAll({ firstName: 'John' }, { limit: 10, offset: 20 });


/** DELETE */
await db.on(UserAccount).delete({ firstName: 'John' });


/** CREATE OR UPDATE */
// If no id field exists, the query create an object
// Else, an update query is run
let account = new UserAccount({
  email: 'jd@works.io',
  hashedPassword: 'hasedPassword',
  firstName: 'John',
  lastName: 'Doe'
});
let result = await db.on(UserAccount).save(account);
let id = result.insertId;


// Alternatively, if you want to enter prepared sql statement, just do:
db.query('SELECT * FROM USER_ACCOUNTS WHERE id > 5').then(doSth).catch(doSthElse);

```
