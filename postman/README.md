# Car Marketplace API Testing Suite

This directory contains the complete automated testing suite for the Car Consulting Platform API. The suite is designed to be executed inside Postman (manually or via the Collection Runner) and via **Newman** (Postman's command-line runner) for CI/CD compatibility.

---

## Directory Structure

```text
postman/
│
├── Project.postman_collection.json    # Comprehensive API requests and test scripts
├── Project.postman_environment.json   # Environment variables configuration
├── README.md                          # Documentation and execution instructions
└── reports/                           # Folder for storing HTML/JSON execution reports
```

---

## Prerequisites

1. **Postman**: Install the Postman desktop application or sign up at [Postman Web](https://www.postman.com/).
2. **Node.js & npm**: Required to run the backend and execute tests using Newman.
3. **Newman** (Optional, for CLI execution):
   ```bash
   npm install -g newman
   # Optionally install the HTML reporter
   npm install -g newman-reporter-htmlextra
   ```

---

## Setting Up and Running the Backend

Ensure your local backend server is up and running before executing the tests.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make sure `.env` variables are set. The MONGODB_URI and JWT_SECRET are mandatory.
4. (Optional) Run the database seed script to setup sample data and the admin user:
   ```bash
   npm run seed
   ```
   *Note: This creates the default admin user `harishvicky07@gmail.com` with the password `123456`.*
5. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend should start, listening on port `5000` (http://localhost:5000).

---

## Execution Option 1: Running in Postman App

### 1. Import Files
1. Open the Postman Desktop App.
2. Click the **Import** button in the top-left corner.
3. Drag and drop both `Project.postman_collection.json` and `Project.postman_environment.json` from the `postman/` directory.

### 2. Select the Environment
1. In the top-right corner of Postman, select the environment dropdown and choose **Car Marketplace Env**.
2. To inspect or edit the environment parameters (such as `baseUrl`, `adminEmail`, or `adminPassword`), navigate to **Environments** on the left menu, select **Car Marketplace Env**, and adjust as necessary.

### 3. Run the Collection
1. Select the **Collections** tab on the left.
2. Click the **Car Marketplace API Testing Suite** collection.
3. Click the **Run** button at the top-right of the collection page to open the **Collection Runner**.
4. Check that all requests are selected. Ensure the run order matches the default sequence (which executes authentication and setup requests first).
5. Click **Run Car Marketplace API Testing Suite**.
6. The test runner will sequentially execute all positive and negative API tests, showing the results and status checks in real-time.

---

## Execution Option 2: Running via Newman (CLI)

You can run the entire test suite completely from your command line.

Navigate to the project root directory and run the following command:

```bash
newman run postman/Project.postman_collection.json -e postman/Project.postman_environment.json
```

### Save HTML Reports

To generate visual HTML test reports inside the `postman/reports/` folder:

```bash
newman run postman/Project.postman_collection.json -e postman/Project.postman_environment.json -r htmlextra --reporter-htmlextra-export postman/reports/report.html
```

---

## Request Chaining & Workflow Details

The collection relies on dynamic variable chaining. Here is the lifecycle of a complete run:

```
[Health Check]
      ↓
[Register User] ──(Generates dynamic email/phone and saves user ID)
      ↓
[Login User] ────(Retrieves & stores regular {{token}})
      ↓
[Get/Update Profile]
      ↓
[Admin Login] ───(Authenticates admin & stores {{adminToken}})
      ↓
[Create Car] ────(Creates car under admin context & stores {{carId}})
      ↓
[List/Get Cars] ─(Validates filter, search, sorting and details on {{carId}})
      ↓
[Wishlist Add] ──(Adds {{carId}} to user wishlist)
      ↓
[Wishlist Remove]
      ↓
[Delete Car] ────(Cleans up the created car)
      ↓
[Create Sell Request] (Creates request and saves {{sellRequestId}})
      ↓
[Get My Requests] (Queries requests belonging to the logged-in user)
      ↓
[Update Request] ─(Updates request status to "Under Review")
      ↓
[Delete Request] ─(Cleans up the created sell request)
      ↓
[Create Testimonial] (Creates testimonial & stores {{testimonialId}})
      ↓
[Update Testimonial]
      ↓
[Delete Testimonial] (Cleans up testimonial)
```

---

## Assertions Handled Per Request

For every API call, the testing suite automatically asserts:
1. **Response Status Code**: Validates successful status codes (e.g. `200 OK`, `201 Created`) or correct error status codes (e.g. `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`).
2. **Response Time**: Ensures APIs respond in under 500ms or 800ms (depending on weight).
3. **Response Headers**: Assures `Content-Type` is set to JSON.
4. **Response Structure**: Checks key fields (e.g. `success` flag, error messages, presence of expected resource keys, pagination schemas, and stats layouts).

---

## Troubleshooting & Failure Interpretations

### 1. Connection Errors (ECONNREFUSED)
* **Message**: `connect ECONNREFUSED 127.0.0.1:5000`
* **Cause**: The backend server is not running on port 5000.
* **Solution**: Run `npm run dev` in the `backend` folder and verify it listens on port 5000.

### 2. Admin Login Failures (Unauthorized)
* **Message**: `Status code is 200` fails, returning `401` or `404`.
* **Cause**: Default admin credentials in the environment do not exist in the database.
* **Solution**: 
  - Ensure the database is seeded by running `npm run seed` in the `backend` directory.
  - Or, edit the `adminEmail` and `adminPassword` variables in the environment to match an existing admin user in your database.

### 3. JWT Token Missing / Invalid (Unauthorized)
* **Message**: `Status code is 401/403` failures on protected routes.
* **Cause**: The register or login request failed, meaning the `{{token}}` or `{{adminToken}}` environment variables are empty.
* **Solution**: Check that the **Register New User** and **Admin Login** requests are succeeding. Check the runner console logs for specific errors from the database (such as MongoDB connection drops).

### 4. Database Validation Failures (Bad Request)
* **Message**: `Status code is 400` returning validation messages.
* **Cause**: Required fields are missing or inputs (like emails, phone numbers, or dates) are invalid.
* **Solution**: Review the request payload in Postman against the validations defined in `backend/src/middleware/validator.js`.
