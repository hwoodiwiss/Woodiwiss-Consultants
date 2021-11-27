# Content-Management-API

## Introduction

This API provides authenticated access to a content management database. The core of the API is a custom framework including Dependency Injection, Routing and Model-Binding for controllers.

## Prerequisites

This API makes use of composer, as such, you will need that installed.
To run the application, you will need to run `composer install --no-dev` to generate the Autoloader bindings for `index.php` the API.

## Testing

To run tests you must first run `composer install` to allow composer to get PHPUnit.

Then Run `./vendor/bin/phpunit` this will pick up the `phpunit.xml` settings file from the project root and run the test suite.
