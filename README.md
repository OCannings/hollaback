# Hollaback

A tiny presence service.

## Installation
  1. node app

## Usage
  * Request 1: http://localhost:8080/open/some_token
  * Request 2: http://localhost:8080/close/some_token
  * Request 1 will only complete once Request 2 has been made, letting Request 1 know that Request 2 has happened.
