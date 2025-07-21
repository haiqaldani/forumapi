# Forum API

A RESTful API for a forum application built with Clean Architecture principles.

## Features

- User Authentication (register, login, refresh token, logout)
- Thread Management (create, view)
- Comment Management (add, delete)
- Reply Management (add, delete) [Optional]

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in `.env` file:
   ```env
   # HTTP SERVER
   HOST=localhost
   PORT=5000

   # POSTGRES
   PGHOST=localhost
   PGUSER=your_username
   PGDATABASE=forumapi
   PGPASSWORD=your_password
   PGPORT=5432

   # POSTGRES TEST
   PGHOST_TEST=localhost
   PGUSER_TEST=your_username
   PGDATABASE_TEST=forumapi_test
   PGPASSWORD_TEST=your_password
   PGPORT_TEST=5432

   # TOKENIZE
   ACCESS_TOKEN_KEY=your_access_token_key
   REFRESH_TOKEN_KEY=your_refresh_token_key
   ACCESS_TOKEN_AGE=3000
   ```
4. Create the database:
   ```bash
   createdb forumapi
   createdb forumapi_test
   ```
5. Run migrations:
   ```bash
   npm run migrate up
   ```
6. Start the server:
   ```bash
   # Development
   npm run start:dev

   # Production
   npm start
   ```

## Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:watch
```

## Project Structure

Following Clean Architecture principles:

```
src/
├── Applications/          # Use Cases and Security
├── Commons/              # Shared modules, utils
├── Domains/              # Entities and repositories interfaces
├── Infrastructures/      # Repository implementations, database
├── Interfaces/           # HTTP API handlers and validators
└── app.js               # Application entry point
```

## API Endpoints

### Authentication
- POST /users - Register new user
- POST /authentications - Login
- PUT /authentications - Refresh access token
- DELETE /authentications - Logout

### Threads
- POST /threads - Create new thread
- GET /threads/{threadId} - Get thread details

### Comments
- POST /threads/{threadId}/comments - Add comment
- DELETE /threads/{threadId}/comments/{commentId} - Delete comment

### Replies [Optional]
- POST /threads/{threadId}/comments/{commentId}/replies - Add reply
- DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId} - Delete reply 