# TimeBook-Serverless-API
[![CI dev](https://github.com/japanrecruitment/TimeBook-API/actions/workflows/dev.yml/badge.svg)](https://github.com/japanrecruitment/TimeBook-API/actions/workflows/dev.yml)

## Install

### Clone this repo

```
git clone https://github.com/Japan-Recruitment-Group/TimeBook-Serverless-API.git
```

### Install dependencies

```
yarn
```

### Run locally

```
yarn local
```

## Working with prisma

### Formatting schema file

When you make changes to prisma schema `prisma/schema.prisma` file it is differently formatted than other file types. Such as the indentations does not use the same settings as our code does. If you want to format the schema file then the prisma has a neat helper command to do that for you.

```
npx prisma format
```

Use this command to auto format your prisma file.

### Migrating schema changes to the Database

When you make changes to prisma schema file you might want to migrate it to the database as well. Use the following command to do so.

```
npx prisma migrate dev
```

### Seeding data the Database

For seeds we use array of basic javascript objects as our data that corresponds to the table. See file `prisma/seeds/users.ts` for reference. It exports an array of data called `users` of type `Partial<User>[]` and a dataProcessor function called `userProcessor` which takes `User` and return `User`. The dataProcessor function is the callback function used in the map of processing each record of `users` array. The dataProcessor argument could also be `none` if there's no processing needed for the given seed data.

Once you add necessary seed data to the schema and also added `seedTable()` function to the `seed.ts` file you're ready to run the seed command.

Use the following command for executing the seeds

```
npx prisma db seed --preview-feature
```

The seed command for prisma is still a work in progress so needs `--preview-feature` flag.
