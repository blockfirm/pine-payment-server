Pine Payment Server
===================

[![GitHub Release](https://img.shields.io/github/release/blockfirm/pine-payment-server.svg?style=flat-square)](https://github.com/blockfirm/pine-payment-server/releases)
[![Build Status](https://img.shields.io/travis/blockfirm/pine-payment-server.svg?branch=master&style=flat-square)](https://travis-ci.org/blockfirm/pine-payment-server)
[![Coverage Status](https://img.shields.io/coveralls/blockfirm/pine-payment-server.svg?style=flat-square)](https://coveralls.io/r/blockfirm/pine-payment-server)

This is an implementation of the [Pine](https://pine.pm) Payment Protocol - a second layer protocol on top
of bitcoin for sending payments using human-readable payment addresses similar to email addresses. It doesn't
change the way transactions are made or stored on the bitcoin network and blockchain. The server only handles
anonymous user profiles and the exchange of bitcoin addresses and signed end-to-end encrypted transactions in
a decentralized, secure and private manner.

## Table of Contents

* [Dependencies](#dependencies)
* [Getting started](#getting-started)
* [Setting up the database](#setting-up-the-database)
* [Setting up a domain name](#setting-up-a-domain-name)
  * [Configure your DNS](#configure-your-dns)
  * [Configure SSL](#configure-ssl)
  * [Test your setup](#test-your-setup)
* [Setting up push notifications](#setting-up-push-notifications)
  * [Send notifications to the official Pine app](#send-notifications-to-the-official-pine-app)
  * [Send notifications to your own app](#send-notifications-to-your-own-app)
* [API documentation](#api-documentation)
  * [Endpoints](#endpoints)
  * [Error handling](#error-handling)
  * [Authentication](#authentication)
  * [Rate limiting](#rate-limiting)
* [Testing](#testing)
  * [Unit tests](#unit-tests)
  * [Integration tests](#integration-tests)
* [Contributing](#contributing)
* [Licensing](#licensing)

## Dependencies

* [Node.js](https://nodejs.org) (`v10`) and [Restify](http://restify.com) for creating the REST API
* [PostgreSQL](https://www.postgresql.org) or another SQL database for persistent storage
* [Redis](https://redis.io) for queuing notifications and persisting some state

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
3. Rename `src/config.template.js` to `src/config.js`
4. Install a database by following the steps in [Setting up the database](#setting-up-the-database)
5. Install [Redis](https://redis.io)
6. Start the server in development mode:
    ```
    $ npm run dev
    ```
7. Or build it and run in production mode:
    ```
    $ npm run build
    $ npm start
    ```

## Setting up the database

You can use any database of PostgreSQL (recommended), MySQL, SQLite, MariaDB, and MS SQL.

### Create a new database

Once you have installed the database server you need to create a new database.
This is how you can do it with Postgres:

```
$ sudo su - postgres
$ createdb pine_payment_server
```

### Create a new user

Then create a new user to be used by the Pine Payment Server:

```
$ psql pine_payment_server
> CREATE USER pine WITH ENCRYPTED PASSWORD '<password>';
> GRANT ALL PRIVILEGES ON DATABASE pine_payment_server TO pine;
> \q
```

*Don't forget to enter a strong password instead of `<password>`.*

### Configure Pine Payment Server

Open `src/config.js` and in the `database` section, set `dialect` to `'postgres'` and then
set the username and password for the database you created in the previous steps.

### Install a client library

If you're using a database other than PostgreSQL you'll need to install a client library
for that database:

* MySQL: `npm install mysql2`
* MariaDB: `npm install mariadb`
* SQLite: `npm install sqlite3`
* MS SQL: `npm install tedious`

## Setting up a domain name

### Configure your DNS

Create a new subdomain on the domain that you want to use for your Pine Payment Server.
The new subdomain should be either an `A` or `CNAME` record with the value `pine-payment-server`
and point to your Pine server.

### Configure SSL

The Pine Payment Protocol requires all payment servers to be configured with SSL (HTTPS). The server
doesn't directly support that so instead you need to setup a reverse proxy such as [nginx](https://www.nginx.com)
and terminate there before forwarding to the Pine Payment Server. The easiest way to obtain an SSL
certificate is by using [Let's Encrypt](https://letsencrypt.org).

### Test your setup

Browse to `https://pine-payment-server.example.org/v1/info` and verify that you get a JSON object as a response.

*(Replace `example.org` with your own domain name.)*

## Setting up push notifications

There are two ways to set up push notifications; set up your own notification service with your own app,
or send them to the official Pine app through Pine's official notification service (requires API key).

### Send notifications to the official Pine app

**Note: This method will only work once Pine is released and has an official service to send
notifications through.**

This is the only way if you just want to host your own Pine Payment Server but still want to use the Pine app from the App Store and continue to get push notifications.

1. Open `src/config.js`
2. Make sure `notifications.webhook` is set to Pine's official Notification Service (default)
3. Request an API key from Pine (coming soon) and enter it in `notifications.apiKey`
4. Build and restart the server

### Send notifications to your own app

If you are running the app from source you will need to configure and host your own Notification Service in order to be able to receive push notifications.

1. Go to <https://github.com/blockfirm/pine-notification-service> and follow the instructions
2. Open `src/config.js`
3. Set `notifications.webhook` to your own Notification Service
4. Set `notifications.apiKey` to your [obtained API key](https://github.com/blockfirm/pine-notification-service#obtaining-an-api-key)
5. Build and restart the server

## API documentation

### Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | [/v1/info](#get-v1info) | Get information about the server |
| GET | [/v1/users](#get-v1users) | Search for users by username |
| POST | [/v1/users](#post-v1users) | Create a new user |
| GET | [/v1/users/:userId](#get-v1usersuserid) | Get a user by ID |
| PATCH | [/v1/users/:userId](#patch-v1usersuserid) | Update a user by ID |
| GET | [/v1/users/:userId/avatar](#get-v1usersuseridavatar) | Get a user's profile picture |
| PUT | [/v1/users/:userId/avatar](#put-v1usersuseridavatar) | Change a user's profile picture |
| POST | [/v1/users/:userId/device-tokens](#post-v1usersuseriddevice-tokens) | Add a device token for receiving push notifications |
| DELETE | [/v1/users/:userId/device-tokens/:deviceTokenId](#delete-v1usersuseriddevice-tokensdevicetokenid) | Remove a device token for a user |
| GET | [/v1/users/:userId/contact-requests](#get-v1usersuseridcontact-requests) | Get all contact requests for a user |
| POST | [/v1/users/:userId/contact-requests](#post-v1usersuseridcontact-requests) | Send a contact request to a user |
| DELETE | [/v1/users/:userId/contact-requests/:contactRequestId](#delete-v1usersuseridcontact-requestscontactrequestid) | Remove a contact request |
| GET | [/v1/users/:userId/contacts](#get-v1usersuseridcontacts) | Get all contacts for a user |
| POST | [/v1/users/:userId/contacts](#post-v1usersuseridcontacts) | Add a contact to a user |
| DELETE | [/v1/users/:userId/contacts/:contactId](#delete-v1usersuseridcontactscontactid) | Remove a contact |
| GET | [/v1/users/:userId/address](#get-v1usersuseridaddress) | Get a bitcoin address for a user |
| POST | [/v1/users/:userId/address/used](#post-v1usersuseridaddressused) | Flag addresses as used |
| GET | [/v1/users/:userId/messages](#get-v1usersuseridmessages) | Get all incoming messages for a user |
| POST | [/v1/users/:userId/messages](#post-v1usersuseridmessages) | Send a message to a user |
| DELETE | [/v1/users/:userId/messages/:messageId](#delete-v1usersuseridmessagesmessageid) | Remove a message |
| POST | [/v1/users/:userId/lightning/invoices](#post-v1usersuseridlightninginvoices) | Get a new lightning invoice for a user |

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
        "displayName": "", (string) Display name of the user
        "avatar": { (object) Metadata about the user's avatar. Null if the user doesn't have any
            "checksum": "" (string) A checksum of the image
        }
    },
    ...
]
```

### `POST` /v1/users

Endpoint to create a new user. Requires [authentication](#authentication).

#### Body

As JSON:

| Name | Type | Description |
| --- | --- | --- |
| publicKey | *string* | A public key encoded as base58check. Used for verifying users and encrypting messages. Must match the authenticated user |
| extendedPublicKey | *string* | An extended public key for a BIP49 account. Encoded as base58check. Used for generating new BIP49 bitcoin addresses on behalf of the user |
| username | *string* | Username of the user. Lowercase `a-z`, `0-9`, `_`, and `.`. Maximum 20 characters |
| displayName | *string* | Optional display name of the user. Maximum 50 characters |
| addressIndex | *integer* | The index of the current unused address as defined in BIP44. Defaults to 0 |

#### Returns

Returns the created user as JSON.

### `GET` /v1/users/:userId

Endpoint to get a user by ID.

#### Returns

```
{
    "id": "", (string) User ID - a hash 160 of the user's public key
    "publicKey": "", (string) A public key encoded as base58check
    "username": "", (string) Username of the user
    "displayName": "", (string) Display name of the user
    "avatar": { (object) Metadata about the user's avatar. Null if the user doesn't have any
        "checksum": "" (string) A checksum of the image
    }
}
```

### `PATCH` /v1/users/:userId

Endpoint to update a user by ID. Requires [authentication](#authentication).

#### Body

As JSON:

| Name | Type | Description |
| --- | --- | --- |
| displayName | *string* | Display name of the user. Maximum 50 characters |
| addressIndex | *integer* | The index of the current unused address as defined in BIP44. Starts at 0 |

#### Returns

Returns the updated user as JSON.

### `GET` /v1/users/:userId/avatar

Endpoint to get a user's profile picture.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| userId | *string* | ID of the user to get the profile picture for |

#### Query String Parameters

| Name | Type | Description |
| --- | --- | --- |
| byUsername | *boolean* | Set to `1` to get the profile picture by username instead of user ID |

#### Returns

A 250x250px JPEG if the user has set a profile picture.

### `PUT` /v1/users/:userId/avatar

Endpoint to change a user's avatar. Requires [authentication](#authentication).

#### Body

As JSON:

| Name | Type | Description |
| --- | --- | --- |
| image | *string* | Base64-encoded image (bmp, gif, jpeg, png, or tiff). Image will be scaled to 250x250px and cropped if the aspect ratio is not 1:1. Maximum 50 KB |

#### Returns

```
{
    "checksum": "" (string) A hash of the image used for caching purposes
}
```

### `POST` /v1/users/:userId/device-tokens

Endpoint to add a device token for a user to receive push notifications. A user can have multiple device tokens for multiple devices.
Old device tokens will automatically be removed. Requires [authentication](#authentication).

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| userId | *string* | ID of the user to add a device token for |

#### Body

As JSON:

| Name | Type | Description |
| --- | --- | --- |
| ios | *string* | An iOS device token |

#### Returns

```
{
    "id": "" (string) The ID of the added device token
}
```

### `DELETE` /v1/users/:userId/device-tokens/:deviceTokenId

Endpoint to remove a device token for a user. Requires [authentication](#authentication).

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| userId | *string* | ID of the user to remove a device token for |
| deviceTokenId | *string* | ID of the device token to remove |

### `GET` /v1/users/:userId/contact-requests

Endpoint to get all contact requests for a user. Requires [authentication](#authentication).

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| userId | *string* | ID of the user to get contact requests for |

#### Returns

```
[
    {
        "id": "", (string) The ID of the contact request
        "from": "" (string) Pine address of the user who sent the contact request
        "createdAt": 1550706061 (integer) When the contact request was created (unix timestamp)
    },
    ...
]
```

### `POST` /v1/users/:userId/contact-requests

Endpoint to send a contact request to a user. Requires external [authentication](#authentication).

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| userId | *string* | ID of the user to send the contact request to |

#### Returns

**If the contact request was created:**

`201 Created`

```
{
    "id": "", (string) The ID of the created contact request
    "from": "", (string) Pine address of the user who sent the contact request
    "createdAt": 1550706061 (integer) When the contact request was created (unix timestamp)
}
```

**If the contact request was accepted immediately:**

`202 Accepted`

*Contact requests can be accepted immediately if the receiving user is waiting for an incoming
contact request due to a sent contact request to the other party.*

### `DELETE` /v1/users/:userId/contact-requests/:contactRequestId

Endpoint to remove a contact request. Requires [authentication](#authentication). Both the receiver and the sender can remove the contact request.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| userId | *string* | ID of the user to remove a contact request for |
| contactRequestId | *string* | ID of the contact request to remove |

### `GET` /v1/users/:userId/contacts

Endpoint to get all contacts for a user. Requires [authentication](#authentication).

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| userId | *string* | ID of the user to get contacts for |

#### Returns

```
[
    {
        "id": "", (string) The ID of the contact (not user ID)
        "address": "", (string) Pine address of the contact
        "waitingForContactRequest": false, (boolean) Whether or not the user is waiting for the contact to accept a contact request
        "createdAt": 1550706061 (integer) When the contact was added (unix timestamp)
    },
    ...
]
```

### `POST` /v1/users/:userId/contacts

Endpoint to add a contact to a user. Requires [authentication](#authentication).

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| userId | *string* | ID of the user to add the contact to |

#### Body

As JSON:

| Name | Type | Description |
| --- | --- | --- |
| address | *string* | Pine address of the contact to add |
| waitingForContactRequest | *boolean* | Whether or not the user is waiting for the contact to accept a contact request (*optional*) |

#### Returns

```
{
    "id": "" (string) The ID of the created contact (not user ID)
}
```

### `DELETE` /v1/users/:userId/contacts/:contactId

Endpoint to remove a contact. Requires [authentication](#authentication).

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| userId | *string* | ID of the user to remove a contact for |
| contactId | *string* | ID of the contact to remove (not user ID) |

### `GET` /v1/users/:userId/address

Endpoint to get a bitcoin address for a user. Requires external [authentication](#authentication) and that the user has the authenticated user as a contact.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| userId | *string* | ID of the user to get a bitcoin address for |

#### Returns

```
{
    "address": "" (string) A bitcoin address (`P2SH(P2WSH)`)
}
```

### `POST` /v1/users/:userId/address/used

Endpoint to flag bitcoin addresses as used. Used to tell the server that an address has been used in a transaction
so that it can release it for contacts who has allocated it. Requires [authentication](#authentication).

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| userId | *string* | ID of the user that the addresses belong to |

#### Body

As JSON:

| Name | Type | Description |
| --- | --- | --- |
| addresses | *array* | An array of bitcoin addresses (strings) |

#### Returns

200 OK

### `GET` /v1/users/:userId/messages

Endpoint to get all incoming messages (payments) for a user. Requires [authentication](#authentication).

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| userId | *string* | ID of the user to get messages for |

#### Returns

```
[
    {
        "id": "", (string) The ID of the message
        "from": "", (string) Pine address of the sender
        "encryptedMessage": "", (string) The encrypted message (see below for details)
        "signature": "", (string) A signature of the encrypted message signed by the sender (see below for details)
        "createdAt": 1550706061 (integer) When the message was sent (unix timestamp)
    },
    ...
]
```

### `POST` /v1/users/:userId/messages

Endpoint to send a message (a payment) to a user. Requires external [authentication](#authentication).

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| userId | *string* | ID of the user to send the message to |

#### Body

As JSON:

| Name | Type | Description |
| --- | --- | --- |
| encryptedMessage | *string* | Base64-encoded JSON string of an ECIES object/structure (see below) encrypted with the recipient's public key |
| signature | *string* | A signature of the `encryptedMessage` field signed by the sender (`secp256k1.sign(sha256(sha256(encryptedMessage)), senderPrivateKey).toBase64()` with recovery) |

**ECIES Structure**

The message is end-to-end encrypted using [Elliptic Curve Integrated Encryption](https://www.cryptopp.com/wiki/Elliptic_Curve_Integrated_Encryption_Scheme) (ECIES) with the same curve as bitcoin uses (`secp256k1`).

| Name | Type | Description |
| --- | --- | --- |
| iv | *string* | Initialization vector serialized as hex (16 bytes) |
| ephemPublicKey | *string* | Ephemeral public key serialized as hex (65 bytes) |
| ciphertext | *string* | Encrypted JSON string of a Message object/structure (see below) serialized as hex |
| mac | *string* | Message authentication code serialized as hex (32 bytes) |

**Message Structure**

| Name | Type | Description |
| --- | --- | --- |
| version | *integer* | `1` |
| type | *string* | Only `'payment'` at the moment |
| data | *object* | Additional data attached to the message |
| data.transaction | *string* | A signed bitcoin transaction serialized in raw format (https://bitcoin.org/en/developer-reference#raw-transaction-format) |
| data.network | *string* | `'bitcoin_mainnet'` or `'bitcoin_testnet'` |

#### Returns

201 Created

### `DELETE` /v1/users/:userId/messages/:messageId

Endpoint to remove a message. Requires [authentication](#authentication).

**Note:** Deleted messages will only be flagged as deleted in the database.
This is so that they could later be restored by the user if needed (WIP).

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| userId | *string* | ID of the user to remove a message for |
| messageId | *string* | ID of the message to remove |

### `POST` /v1/users/:userId/lightning/invoices

Endpoint to get a new lightning invoice for a user. Requires external [authentication](#authentication).

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| userId | *string* | ID of the user to get an invoice for |

#### Body

As JSON:

| Name | Type | Description |
| --- | --- | --- |
| amount | *string* | The invoice amount in satoshis |
| paymentMessage | *string* | Encrypted payment message to send to the payee (recipient) when the invoice has been paid. See [POST /v1/users/:userId/messages](#post-v1usersuseridmessages) for more information |
| paymentMessageSignature | *string* | Signature of the payment message signed by the payer (sender). See [POST /v1/users/:userId/messages](#post-v1usersuseridmessages) for more information |

#### Returns

As JSON:

| Name | Type | Description |
| --- | --- | --- |
| amount | *string* | The specified invoice amount in satoshis |
| paymentRequest | *string* | Lightning payment request |

### Error handling

Errors are returned as JSON in the following format:

```json
{
    "code": "<error code>",
    "message": "<error message>"
}
```

### Authentication

Some endpoints require authentication using HTTP Basic Authorization. That can be done by setting
the `Authorization` header to the following:

```
Basic <credentials>
```

`<credentials>` must be replaced with a base64-encoded string of the user ID or address and a signature of the
raw request body:

```
base64('<userId/address>:<signature>')
```

The **User ID** is a base58check-encoded hash 160 (`ripemd160(sha256(publicKey))`) of the user's public key.
If authenticating as an external user from another server, this should be the address of the user instead.

The **signature** is a signature of the request path and the raw request body using the user's private key
(`secp256k1.sign(sha256(sha256(path + body)), privateKey).toBase64()` with recovery).

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

## Testing

### Unit tests

The unit tests mostly test the cryptographic functions and other things related to the server setup.
The API endpoints are easier to test using integration tests.

To run the unit tests, run the following command:

```
$ npm test
```

### Integration tests

The integration tests test that the API endpoints are working as expected. They require that you have
a testing environment set up and configured locally.

To run the integration tests, run the following command:

```
$ npm run test-it
```

## Contributing

Want to help us making Pine better? Great, but first read the
[CONTRIBUTING.md](CONTRIBUTING.md) file for instructions.

## Licensing

Pine Payment Server is licensed under the Apache License, Version 2.0.
See [LICENSE](LICENSE) for full license text.
