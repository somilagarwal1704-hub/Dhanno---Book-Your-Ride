# API Documentation: /users/register

## Endpoint Description
The `/users/register` endpoint is used to register a new user in the system. It accepts user details such as first name, last name, email, and password, validates the input, and creates a new user in the database.

## HTTP Method
`POST`

## URL
`/users/register`

## Request Body
The request body should be in JSON format and include the following fields:

```json
{
  "fullname": {
    "firstname": "string (min: 3 characters, required)",
    "lastname": "string (min: 3 characters, optional)"
  },
  "email": "string (valid email format, required)",
  "password": "string (min: 6 characters, required)"
}
```

### Example Request Body
```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "password123"
}
```

## Response
The endpoint returns a JSON response with the following structure:

### Success Response
**Status Code:** `200 OK`

```json
{
  "message": "User Created successfully",
  "token": "string (JWT token)",
  "user": {
    "_id": "string",
    "fullname": {
      "firstname": "string",
      "lastname": "string"
    },
    "email": "string",
    "socketId": "string (optional)"
  }
}
```

### Error Responses
**Status Code:** `400 Bad Request`

```json
{
  "errors": [
    {
      "msg": "string (error message)",
      "param": "string (field name)",
      "location": "string (location of the error, e.g., body)"
    }
  ]
}
```

**Status Code:** `500 Internal Server Error`

```json
{
  "message": "Internal Server Error"
}
```

## Validation Rules
- `fullname.firstname`: Must be at least 3 characters long.
- `email`: Must be a valid email address.
- `password`: Must be at least 6 characters long.

## Notes
- The password is hashed before being stored in the database.
- A JWT token is generated upon successful registration.

# API Documentation: /users/login

## Endpoint Description
The `/users/login` endpoint is used to authenticate a user. It accepts the user's email and password, validates the input, and returns a JWT token upon successful authentication.

## HTTP Method
`POST`

## URL
`/users/login`

## Request Body
The request body should be in JSON format and include the following fields:

```json
{
  "email": "string (valid email format, required)",
  "password": "string (min: 6 characters, required)"
}
```

### Example Request Body
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

## Response
The endpoint returns a JSON response with the following structure:

### Success Response
**Status Code:** `200 OK`

```json
{
  "message": "Login successful",
  "token": "string (JWT token)",
  "user": {
    "_id": "string",
    "fullname": {
      "firstname": "string",
      "lastname": "string"
    },
    "email": "string",
    "socketId": "string (optional)"
  }
}
```

### Error Responses
**Status Code:** `400 Bad Request`

```json
{
  "errors": [
    {
      "msg": "string (error message)",
      "param": "string (field name)",
      "location": "string (location of the error, e.g., body)"
    }
  ]
}
```

**Status Code:** `401 Unauthorized`

```json
{
  "message": "Invalid email or password"
}
```

**Status Code:** `500 Internal Server Error`

```json
{
  "message": "Internal Server Error"
}
```

## Validation Rules
- `email`: Must be a valid email address.
- `password`: Must be at least 6 characters long.

## Notes
- The password is compared using a secure hashing algorithm.
- A JWT token is generated upon successful authentication.

# API Documentation: /users/profile

## Endpoint Description
The `/users/profile` endpoint is used to retrieve the profile information of the authenticated user. It requires a valid JWT token for authentication.

## HTTP Method
`GET`

## URL
`/users/profile`

## Request Headers
The request must include the following headers:

```json
{
  "Authorization": "Bearer <JWT token>"
}
```

## Response
The endpoint returns a JSON response with the following structure:

### Success Response
**Status Code:** `200 OK`

```json
{
  "_id": "string",
  "fullname": {
    "firstname": "string",
    "lastname": "string"
  },
  "email": "string",
  "socketId": "string (optional)"
}
```

### Error Responses
**Status Code:** `401 Unauthorized`

```json
{
  "message": "Access Denied. No token provided."
}

**Status Code:** `401 Unauthorized`

```json
{
  "message": "Invalid token. Please login again."
}
```

**Status Code:** `500 Internal Server Error`

```json
{
  "message": "Internal Server Error"
}

# API Documentation: /users/logout

## Endpoint Description
The `/users/logout` endpoint is used to log out the authenticated user by invalidating their JWT token.

## HTTP Method
`POST`

## URL
`/users/logout`

## Request Headers
The request must include the following headers:

```json
{
  "Authorization": "Bearer <JWT token>"
}
```

## Response
The endpoint returns a JSON response with the following structure:

### Success Response
**Status Code:** `200 OK`

```json
{
  "message": "Logout successful"
}
```

### Error Responses
**Status Code:** `401 Unauthorized`

```json
{
  "message": "Access Denied. No token provided."
}

**Status Code:** `401 Unauthorized`

```json
{
  "message": "Invalid token. Please login again."
}
```

**Status Code:** `500 Internal Server Error`

```json
{
  "message": "Internal Server Error"
}


# API Documentation: /captains/register

## Endpoint Description
The `/captains/register` endpoint is used to register a new captain in the system. It accepts captain details such as full name, email, password, and vehicle information, validates the input, and creates a new captain in the database.

## HTTP Method
`POST`

## URL
`/captains/register`

## Request Body
The request body should be in JSON format and include the following fields:

```json
{
  "fullname": {
    "firstname": "string (min: 3 characters, required)",
    "lastname": "string (optional)"
  },
  "email": "string (valid email format, required)",
  "password": "string (min: 6 characters, required)",
  "vehicle": {
    "color": "string (min: 3 characters, required)",
    "plate": "string (min: 3 characters, required)",
    "capacity": "integer (min: 1, required)",
    "vehicleType": "string (must be one of: 'car', 'bike', 'auto', required)"
  }
}
```

### Example Request Body
```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "password123",
  "vehicle": {
    "color": "Red",
    "plate": "ABC123",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```

## Response
The endpoint returns a JSON response with the following structure:

### Success Response
**Status Code:** `200 OK`

```json
{
  "message": "Captain registered successfully"
}
```

### Example Response Body
```json
{
  "fullname": {
    "firstname": "string (min: 3 characters, required)",
    "lastname": "string (optional)"
  },
  "email": "string (valid email format, required)",
  "password": "string (min: 6 characters, required)",
  "vehicle": {
    "color": "string (min: 3 characters, required)",
    "plate": "string (min: 3 characters, required)",
    "capacity": "integer (min: 1, required)",
    "vehicleType": "string (must be one of: 'car', 'bike', 'auto', required)"
  }
}
```

### Error Responses
**Status Code:** `400 Bad Request`

```json
{
  "errors": [
    {
      "msg": "string (error message)",
      "param": "string (field name)",
      "location": "string (location of the error, e.g., body)"
    }
  ]
}
```

**Status Code:** `500 Internal Server Error`

```json
{
  "message": "Internal Server Error"
}
```

## Validation Rules
- `fullname.firstname`: Must be at least 3 characters long.
- `email`: Must be a valid email address.
- `password`: Must be at least 6 characters long.
- `vehicle.color`: Must be at least 3 characters long.
- `vehicle.plate`: Must be at least 3 characters long.
- `vehicle.capacity`: Must be an integer and at least 1.
- `vehicle.vehicleType`: Must be one of the following: `car`, `bike`, `auto`.

## Notes
- The password is hashed before being stored in the database.
- A JWT token is generated upon successful registration.

# API Documentation: /captains/login

## Endpoint Description
The `/captains/login` endpoint is used to authenticate a captain. It accepts the captain's email and password, validates the input, and returns a JWT token upon successful authentication.

## HTTP Method
`POST`

## URL
`/captains/login`

## Request Body
The request body should be in JSON format and include the following fields:

```json
{
  "email": "string (valid email format, required)",
  "password": "string (min: 6 characters, required)"
}
```

### Example Request Body
```json
{
  "email": "captain@example.com",
  "password": "password123"
}
```

## Response
The endpoint returns a JSON response with the following structure:

### Success Response
**Status Code:** `200 OK`

```json
{
  "message": "Login successful",
  "token": "string (JWT token)",
  "captain": {
    "_id": "string",
    "fullname": {
      "firstname": "string",
      "lastname": "string"
    },
    "email": "string",
    "vehicle": {
      "color": "string",
      "plate": "string",
      "capacity": "integer",
      "vehicleType": "string"
    }
  }
}
```

### Error Responses
**Status Code:** `400 Bad Request`

```json
{
  "message": "Invalid email or password"
}
```

**Status Code:** `500 Internal Server Error`

```json
{
  "message": "Internal Server Error"
}
```

## Validation Rules
- `email`: Must be a valid email address.
- `password`: Must be at least 6 characters long.

---

# API Documentation: /captains/profile

## Endpoint Description
The `/captains/profile` endpoint is used to retrieve the profile information of the authenticated captain. It requires a valid JWT token for authentication.

## HTTP Method
`GET`

## URL
`/captains/profile`

## Request Headers
The request must include the following headers:

```json
{
  "Authorization": "Bearer <JWT token>"
}
```

## Response
The endpoint returns a JSON response with the following structure:

### Success Response
**Status Code:** `200 OK`

```json
{
  "captain": {
    "_id": "string",
    "fullname": {
      "firstname": "string",
      "lastname": "string"
    },
    "email": "string",
    "vehicle": {
      "color": "string",
      "plate": "string",
      "capacity": "integer",
      "vehicleType": "string"
    }
  }
}
```

### Error Responses
**Status Code:** `401 Unauthorized`

```json
{
  "message": "Access Denied. No token provided."
}
```

**Status Code:** `401 Unauthorized`

```json
{
  "message": "Invalid token. Please login again."
}
```

**Status Code:** `500 Internal Server Error`

```json
{
  "message": "Internal Server Error"
}
```

---

# API Documentation: /captains/logout

## Endpoint Description
The `/captains/logout` endpoint is used to log out the authenticated captain by invalidating their JWT token.

## HTTP Method
`POST`

## URL
`/captains/logout`

## Request Headers
The request must include the following headers:

```json
{
  "Authorization": "Bearer <JWT token>"
}
```

## Response
The endpoint returns a JSON response with the following structure:

### Success Response
**Status Code:** `200 OK`

```json
{
  "message": "Logout successful"
}
```

### Error Responses
**Status Code:** `401 Unauthorized`

```json
{
  "message": "Access Denied. No token provided."
}
```

**Status Code:** `401 Unauthorized`

```json
{
  "message": "Invalid token. Please login again."
}
```

**Status Code:** `500 Internal Server Error`

```json
{
  "message": "Internal Server Error"
}
```