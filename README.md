# passManager

A secure, client-side encrypted password manager application built with ASP.NET Core and React.

## Features

- **Client-side encryption**: All passwords are encrypted/decrypted in your browser using AES-GCM
- **Zero-knowledge architecture**: The server never sees your unencrypted passwords or encryption keys
- **Multi-user support**: Each user has their own secure password vault
- **Secure authentication**: JWT-based authentication with salted password hashing
- **Responsive UI**: Clean, modern interface that works on desktop and mobile
- **Testimonials**: User feedback and ratings system

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v16 or later)
- [PostgreSQL](https://www.postgresql.org/download/) database server

### Database Setup

1. Install PostgreSQL if you don't have it already
2. Create a new database named `databaseName`
3. Update the connection string in `appsettings.json` if your database credentials differ from the default:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Database=databaseName;Username=YOUR_USERNAME;Password=YOUR_PASSWORD"
   }



