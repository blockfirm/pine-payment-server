Pine Payment Server
===================

[![GitHub Release](https://img.shields.io/github/release/blockfirm/pine-payment-server.svg?style=flat-square)](https://github.com/blockfirm/pine-payment-server/releases)
[![Build Status](https://img.shields.io/travis/blockfirm/pine-payment-server.svg?branch=master&style=flat-square)](https://travis-ci.org/blockfirm/pine-payment-server)
[![Coverage Status](https://img.shields.io/coveralls/blockfirm/pine-payment-server.svg?style=flat-square)](https://coveralls.io/r/blockfirm/pine-payment-server)

This is an implementation of the [Pine](https://pinewallet.co) Payment Protocol - a second layer protocol on top
of bitcoin for sending payments using human-readable payment addresses similar to email addresses. It doesn't
change the way transactions are made or stored on the bitcoin network and blockchain. The server only handles
anonymous user profiles and the exchange of bitcoin addresses and signed transactions in a decentralized,
secure and private manner.

## Table of Contents

* [Dependencies](#dependencies)
* [Getting started](#getting-started)
* [Setting up the database](#setting-up-the-database)
* [API Docs](#api)
  * [Endpoints](#endpoints)
  * [Error handling](#error-handling)
  * [Rate limiting](#rate-limiting)
* [Contributing](#contributing)
* [Licensing](#licensing)

## Dependencies

* [Node.js](https://nodejs.org) and [Restify](http://restify.com) for creating the REST API
* [MariaDB](https://mariadb.org) or another SQL database for persistent storage
* [Redis](https://redis.io) for caching

## Getting started

1. Clone this repo:
    ```
    $ git clone https://github.com/blockfirm/pine-payment-server.git
    $ cd pine-payment-server
    ```
2. Install dependencies:
    ```
    $ npm install
    ```
3. Install a database by following the steps in [Setting up the database](#setting-up-the-database)
5. Start the server in development mode:
    ```
    $ npm run dev
    ```
6. Or build it and run in production mode:
    ```
    $ npm run build
    $ npm start
    ```

## Setting up the database

You can use any database of MariaDB (recommended), MySQL, SQLite, Postgres, and MS SQL.

### Create a new database

Once you have installed the database server you need to create a new database.
This is how you can do it with MariaDB:

```
$ mysql -uroot
> CREATE DATABASE pine_payment_server;
```

### Create a new user

Then create a new user to be used by the Pine Payment Server:

```
$ mysql -uroot
> CREATE USER 'pine'@'localhost' IDENTIFIED BY '<password>';
> GRANT ALL ON pine_payment_server.* TO 'pine'@'localhost';
> FLUSH PRIVILEGES;
> exit
```

*Don't forget to enter a strong password instead of `<password>`.*

### Configure Pine Payment Server

Open `src/config.js` and in the `database` section, set `dialect` to `'mysql'` and then
set the username and password for the database you created in the previous steps.

### Install a client library

If you're using a database other than MariaDB or MySQL you'll need to install a client library
for that database:

* Postgres: `npm install pg pg-hstore`
* SQLite: `npm install sqlite3`
* MS SQL: `npm install tedious`

## API

### Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | [/v1/info](#get-v1info) | Get information about the server |
| GET | [/v1/users](#get-v1users) | Search for users by username |
| GET | [/v1/users/:id](#get-v1usersid) | Get a user by ID |
| POST | [/v1/users](#post-v1users) | Create a new user |

### `GET` /v1/info

Returns information about the server.

#### Returns

```
{
    "isOpenForRegistrations": true (bool) Whether or not the server is open for registrations
}
```

### `GET` /v1/users

Endpoint to search for users by username.

#### Query String Parameters

| Name | Type | Description |
| --- | --- | --- |
| username | *string* | Required. Comma-separated list of usernames to search for. Maximum 50 usernames per request |

#### Returns

```
[
    {
        "id": "", (string) User ID - a hash 160 of the user's public key
        "publicKey": "", (string) A public key encoded as base58check
        "username": "", (string) Username of the user
        "displayName": "" (string) Display name of the user
    },
    ...
]
```

### `GET` /v1/users/:id

Endpoint to get a user by ID.

#### Returns

```
{
    "id": "", (string) User ID - a hash 160 of the user's public key
    "publicKey": "", (string) A public key encoded as base58check
    "username": "", (string) Username of the user
    "displayName": "" (string) Display name of the user
}
```

### `POST` /v1/users

Endpoint to create a new user.

#### Body

As JSON:

| Name | Type | Description |
| --- | --- | --- |
| id | *string* | User ID - A base58check-encoded hash 160 (`ripemd160(sha256(publicKey))`) of user's public key |
| publicKey | *string* | A public key encoded as base58check |
| username | *string* | Username of the user. Lowercase `a-z`, `0-9`, `_`, and `.` |
| displayName | *string* | Display name of the user. Maximum 50 characters |
| signature | *string* | Signature of the username using user's private key (`secp256k1.sign(sha256(sha256(username)), privateKey).toBase64()` with recovery) |

#### Returns

Returns the created user as JSON.

### Error handling

Errors are returned as JSON in the following format:

```json
{
    "error": "<error message>"
}
```

### Rate limiting

The API is rate limited to 1 request per second with bursts up to 10 requests. The rate limiting is
based on the [Token Bucket](https://en.wikipedia.org/wiki/Token_bucket) algorithm and can be configured
in `src/config.js` at `api.rateLimit`.

The limit is per IP number, so if your server is behind a reverse proxy or similar you must change the
config to rate limit by the `X-Forwarded-For` header instead of the actual IP:

```js
rateLimit: {
  ...
  ip: false,
  xff: true
  ...
}
```

## Contributing

Want to help us making Pine better? Great, but first read the
[CONTRIBUTING.md](CONTRIBUTING.md) file for instructions.

## Licensing

Pine Payment Server is licensed under the Apache License, Version 2.0.
See [LICENSE](LICENSE) for full license text.
