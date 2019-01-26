Contributing to Pine Payment Server
===================================

We're glad that you'd like to help us make Pine even better. But first,
read these guidelines and instructions.

## Setting up the environment

### Install Node.js and npm

Install Node.js (`v8`) and npm by following the instructions on
[nodejs.org](https://nodejs.org/).

### Clone the repository

	$ git clone https://github.com/blockfirm/pine-payment-server.git
	$ cd pine-payment-server

### Install dependencies

	$ npm install

### Start the API server in development mode

	$ npm run dev

## Coding conventions

Follow the coding conventions defined in [.eslintrc](.eslintrc).
Run `npm run lint` to verify that your code follows the rules.

### EditorConfig

Use [EditorConfig](http://editorconfig.org/) so that your code automatically
comply with our coding style.

## Submitting pull requests

When submitting pull requests, please follow these rules:

* Make sure there isn't another pull request that already does the same thing
* Make sure you've followed our [coding conventions](#coding-conventions)
* Provide tests for your code
* [Run the tests](#testing) before submitting
* Follow the [commit message conventions](#commit-message-guidelines)
* Rebase your commits if possible
* Refer to a GitHub Issue
* Include instructions on how to verify/test your changes
* Include screenshots for GUI changes

### Commit message conventions

* Briefly describe what your changes does
* Use the imperative, present tense: "change" not "changed" nor "changes"
* Capitalize the first letter
* No dot (.) at the end

## Testing

We're using [Mocha](https://mochajs.org/) to test all JavaScript code.
Always run the tests before and after you start changing the code. This will
ensure high quality of the code. Also write new tests when needed and be sure to
follow our [test conventions](#test-conventions) when writing them.

	$ npm test

### Testing conventions

* Put all tests in the `test` folder with the same folder structure as in `src/`
* Give the file the same name as the file under test, but append `.test`, e.g. `App.test.js`
* If you are unsure, read this post on [how to write good unit tests](http://blog.stevensanderson.com/2009/08/24/writing-great-unit-tests-best-and-worst-practises/)

### Code coverage

Aim for 100% code coverage when writing tests. Run the following command to
display the current code coverage:

	$ npm test

## Releases

We're using the [Semantic Versioning Specification](http://semver.org/) when
releasing new versions.

## Roadmap

We're using [Issues](https://github.com/blockfirm/pine-payment-server/issues) on
GitHub to plan our milestones. That include new features as well as bug fixes.

## Reporting security issues

We appreciate all security related reports. Please send them to <timothy@blockfirm.se>.

## Reporting bugs

To report a bug or another issue, please [submit a new issue](https://github.com/blockfirm/pine-payment-server/issues/new) on GitHub.

Describe your issue with steps of how to reproduce it, and if not obvious, what
the expected behavior should be. Also include information about your system
(e.g. version and OS) and your setup.

## Discussion and feedback

Use the [Telegram group](https://t.me/pinewallet) or [GitHub Issues](https://github.com/blockfirm/pine-payment-server/issues) for general discussions.
Tag your issue as a `Question`. You can also tweet us at [@pinewalletco](https://twitter.com/pinewalletco).
