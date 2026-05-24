# API Documentation - CarConsult

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-backend-domain.com/api
```

## Authentication

All protected endpoints require Bearer token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Auth Endpoints

### Register User
```
POST /auth/register

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Login
```
POST /auth/login

Body:
{
  "email": "admin@carconsult.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "admin@carconsult.com",
    "role": "admin"
  }
}
```

### Get Profile
```
GET /auth/profile
Headers: Authorization: Bearer token

Response:
{
  "success": true,
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "role": "user",
    "wishlist": [car_ids],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## Car Endpoints

### Get All Cars (with filters)
```
GET /cars

Query Parameters:
- search: string (search in title, brand, model)
- brand: string (comma-separated: hyundai,maruti,honda)
- fuelType: string (petrol,diesel,cng,electric)
- transmission: string (manual,automatic)
- priceMin: number (minimum price)
- priceMax: number (maximum price)
- yearMin: number (minimum year)
- yearMax: number (maximum year)
- bodyType: string (sedan,suv,hatchback,muv)
- category: string (budget,assured,luxury)
- owner: string (1st,2nd,3rd)
- location: string
- page: number (default: 1)
- limit: number (default: 12)

Example:
GET /cars?search=i20&brand=hyundai&fuelType=petrol&priceMin=300000&priceMax=900000&page=1&limit=12

Response:
{
  "success": true,
  "cars": [
    {
      "_id": "car_id",
      "title": "Hyundai i20 2022",
      "brand": "hyundai",
      "price": 450000,
      "fuelType": "petrol",
      "transmission": "manual",
      "kmsDriven": 15000,
      "year": 2022,
      "bodyType": "hatchback",
      "location": "Delhi",
      "images": ["url1", "url2"],
      "rating": 4.5,
      "reviews": 12
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalCars": 120,
    "limit": 12
  }
}
```

### Get Car by ID
```
GET /cars/:id

Response:
{
  "success": true,
  "car": {
    "_id": "car_id",
    "title": "Hyundai i20 2022",
    "brand": "hyundai",
    "model": "i20",
    "price": 450000,
    "fuelType": "petrol",
    "transmission": "manual",
    "kmsDriven": 15000,
    "year": 2022,
    "bodyType": "hatchback",
    "color": "silver",
    "seats": 5,
    "owner": "1st",
    "location": "Delhi",
    "rto": "DL-01",
    "description": "Well maintained...",
    "features": ["power-steering", "abs"],
    "category": "budget",
    "availability": "in-stock",
    "images": ["url1", "url2"],
    "rating": 4.5,
    "reviews": 12,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "similar": [
    // Similar cars array
  ]
}
```

### Get Featured Cars
```
GET /cars/featured

Response:
{
  "success": true,
  "cars": [
    // Array of luxury cars
  ]
}
```

### Create Car (Admin Only)
```
POST /cars
Headers: Authorization: Bearer admin_token

Body:
{
  "title": "Hyundai i20 2022",
  "brand": "hyundai",
  "model": "i20",
  "price": 450000,
  "fuelType": "petrol",
  "transmission": "manual",
  "kmsDriven": 15000,
  "year": 2022,
  "bodyType": "hatchback",
  "color": "silver",
  "seats": 5,
  "owner": "1st",
  "location": "Delhi",
  "rto": "DL-01",
  "description": "Well maintained...",
  "features": ["power-steering", "abs"],
  "category": "budget",
  "availability": "in-stock",
  "images": ["https://example.com/image1.jpg"]
}

Response:
{
  "success": true,
  "message": "Car added successfully",
  "car": { ...car_data }
}
```

### Update Car (Admin Only)
```
PUT /cars/:id
Headers: Authorization: Bearer admin_token

Body: { ...fields_to_update }

Response:
{
  "success": true,
  "message": "Car updated successfully",
  "car": { ...updated_car_data }
}
```

### Delete Car (Admin Only)
```
DELETE /cars/:id
Headers: Authorization: Bearer admin_token

Response:
{
  "success": true,
  "message": "Car deleted successfully"
}
```

### Add to Wishlist
```
POST /cars/wishlist/add
Headers: Authorization: Bearer token

Body:
{
  "carId": "car_id"
}

Response:
{
  "success": true,
  "message": "Car added to wishlist",
  "wishlist": [car_ids]
}
```

### Remove from Wishlist
```
DELETE /cars/wishlist/remove/:carId
Headers: Authorization: Bearer token

Response:
{
  "success": true,
  "message": "Car removed from wishlist",
  "wishlist": [car_ids]
}
```

### Get Dashboard Stats
```
GET /cars/admin/stats

Response:
{
  "success": true,
  "stats": {
    "totalCars": 120,
    "activeListing": 95,
    "bookedCars": 25,
    "avgPrice": 550000
  }
}
```

---

## Error Responses

All errors follow this format:

```
{
  "success": false,
  "message": "Error description",
  "error": "error_details"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden (Admin only)
- `404`: Not Found
- `500`: Server Error

---

## Rate Limiting

(Optional) To add rate limiting:
```
npm install express-rate-limit
```

---

## CORS

Configured for:
- http://localhost:3000
- http://localhost:5173
- https://your-frontend-domain.com

---

## Pagination

Default: 12 items per page
Max limit: 100 items per page

Example pagination response:
```
{
  "currentPage": 1,
  "totalPages": 10,
  "totalCars": 120,
  "limit": 12
}
```

---

## Testing

### Using cURL

```bash
# Get all cars
curl -X GET http://localhost:5000/api/cars

# Search with filters
curl -X GET "http://localhost:5000/api/cars?search=i20&brand=hyundai&fuelType=petrol"

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@carconsult.com","password":"admin123"}'

# Create car (replace TOKEN)
curl -X POST http://localhost:5000/api/cars \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Car Name","price":500000,...}'
```

### Using Postman

1. Import the API collection
2. Set `{{base_url}}` variable to http://localhost:5000/api
3. Set `{{token}}` variable after login
4. Run requests

---

## Changelog

### v1.0.0
- Initial release
- Complete CRUD for cars
- User authentication
- Advanced filtering
- Wishlist support
- Admin dashboard
