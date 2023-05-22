# Thor Open Music API Backend

### Requirements

-   Javascript
-   NodeJS version : >= 16.15.1
-   NPM version : >= 8.11.0
-   PostgreSQL

### How to run project

-   After cloning this project, run the following command to install all resource needed listed in package.json .

```bash
  npm install
```

-   Start setup the environment variable by running the following command and adjust things like database name, user, and password.

```bash
  cp .env.example .env
```

-   After setting the environment, run the following command to run migration to database .

```bash
  npm run migrate up
```

-   Finally, you can run the project on your local environtment by running the following command

```bash
  npm run start-dev
```
