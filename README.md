# scuttlecrab.ts

### A League of Legends Discord Bot (version beta)

# Development environment setup

**Prerequisites**:
- [docker-compose](https://docs.docker.com/compose/install/)

1. Copy `.env.example` and name it `.env`. Complete it with the right fields.

2. Build the local docker image by running the following command:

`$ docker-compose build`

3. Run the next command to start the bot

`$ docker-compose up`

4. If you haven't invite your bot yet, go to Discord's developer applications and generate the invite link in OAuth2 > URL Generator. Make sure to select scopes `bot` and `application.commands`.