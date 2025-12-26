# JVL cart

an E-commerce Website built with MERN stack.

## Instructions

after cloning, run this command in the root folder
```bash
npm install
```
navigate to "frontend" folder, run these commands 
```bash
npm install


```
wait for application build
after that open the backend/config/config.env
and update the MongoDB connection string
```bash
...
DB_LOCAL_URI=mongodb://localhost:27017/jvlcart
```

navigate back to "root" folder and run this command for loading demo data
```bash
npm run seeder
```

run this below command to run the app in production mode
```bash
npm run prod
```


## Test
open the http://localhost:8000 and test the 

## Postman Collection
https://www.postman.com/jvlcode/workspace/nodejs-ecommerce/collection/19530322-997cf450-820a-4852-bc1f-a93c9072d6ec?action=share&creator=19530322


## License

[MIT](https://choosealicense.com/licenses/mit/)

## Project Overview

JVLcart is a MERN-stack e-commerce application with a Node/Express backend and a React frontend. Key implemented features:

- Product listing, search, and detail pages (with product images and seeded demo data).
- User authentication (register, login, profile, password reset).
- Shopping cart, shipping, and checkout flow.
- Order creation, user order history, and admin order management.
- Payment integration scaffolding (Stripe keys are read from environment variables).
- Admin dashboard to manage products, users, reviews, and orders.
- Server-side utilities: email helper, JWT auth, error handling, and seed data script.

See `backend` and `frontend` folders for implementation details and `backend/config/config.example.env` for environment variables setup.