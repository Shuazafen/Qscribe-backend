# Qscribe-backend
fintech savings and habits building for university students &amp; first time earners

i will be building the backend for this project using drf(django rest framework), postgresql as the database, redis for caching and message queue and celery for background tasks

## Project Structure

```
Qscribe-backend/
├── apps/
│   ├── users/
│   ├── savings/
│   ├── habits/
│   ├── notifications/
│   └── transactions/
├── core/
├── config/
├── requirements.txt
├── manage.py
└── README.md
```

in this stage we would be focusing on the the users saving habits & goals 

the proposed user data includes first name, last name, email, password, phone number, nin, bvn, university, facial-recognition-image, id-card-image, etc.

there will different stages of user verification
1. email verification
2. phone number verification
3. facial recognition verification
4. id card verification
5. bvn verification
6. nin verification

end of first input 