# Contributing Guide

First, feel free to contact me with questions

1. Fork the repo
	- `$ git clone <yourForkUrl>`
	- `$ npm install && bower install && npm test`
1. Checkout a new branch based on whatever version branch is available (if none then branch from `master`) and name it to what you intend to do:
    - `$ git checkout -b BRANCH_NAME`
    - Use one branch per fix/feature
1. Make your changes
	- Use `grunt build`, `grunt watch` and `grunt karma:dev` while developing
	- Make sure to provide a spec for unit tests
	- Run your tests with `test`
	- When all tests pass, everything's fine
1. Commit your changes
	- Please provide a git message which explains what you've done
	- Commit to the forked repository
1. Make a pull request
	- Make sure you send the PR to the branch you branched from
	- Travis CI is watching you!
