# LocalSearch Test

### Requirements
- Working PC/Mac
- Internet Connection
- Docker

---

### Usage

Navigate into root of this README file and execute command `docker compose up`.

After containers are started access following link `http://localhost:8080/`

---


### Additional stuff
This task was overengineered on purpose.

Containers for `API` and `WEB` are listening on their respective ports `3000` and `3001`, but in order to properly use this we access port `8080` which is `NGINX` port since we are doing reverse proxy for it.

---

### Libraries used

For the `API` side only typescript is used, server itself is written in native nodejs `http` library.

Front-end side relies on `express` framework for serving static files, and actual FE doesn't use any library except `milligram` which is `CSS` library- whole logic is vanilla js.

To make it all work as expeteced `NGINX` is used, it does the reverse proxying so that `CORS` isn't an issue, and so that we can access both `web` and the `api` using same host and port.

---
