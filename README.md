# NoAuth
An OAuth2.0 Identity Provider
## development
`docker compose up -d` - starts the pg db  
`npm run db:sync` - drops the db and resyncs the schema  
`npm run user:add` - cli to add a new user  
`npm start` - starts  
more can be found by inspecting the `package.json`

### supported auth flows
- Authorization Code Flow
- Authorization Code Flow with Proof Key for Code Exchange (PKCE)
- Client Credentials Flow
- Resource Owner Password Flow
