# Hospital Equipment Web App

Hospital Equipment Web App is a microservice-based application designed for ordering and tracking medical equipment. The app features a frontend developed with Next.js, a backend built with Django Rest Framework, and utilizes Kafka for real-time data processing of equipment movements.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Setup](#setup)
- [Usage](#usage)
- [Database Diagram](#database-diagram)
- [License](#license)

## Features

- Order medical equipment.
- Track real-time movement of equipment.
- Live Google map display of equipment coordinates.
- Scalable microservice architecture.

## Architecture

The application consists of the following components:

1. **Frontend**: Developed with Next.js.
2. **Backend**: Built with Django Rest Framework.
3. **Kafka**: Used for real-time data processing.

## Technologies Used

- **Next.js**: For the frontend.
- **Django Rest Framework**: For the backend.
- **Kafka**: For real-time data streaming and processing.
- **Google Maps API**: For displaying real-time equipment locations.

## Setup

### Prerequisites

- Node.js
- Python
- Docker

### Frontend

1. Clone the repository:
    ```bash
    git clone https://github.com/Nikwiza/Drf-NextJS-Hospital-app
    cd Drf-NextJS-Hospital-app/frontend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```

### Backend

1. Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

2. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3. Apply migrations:
    ```bash
    python manage.py migrate
    ```

4. Start the development server:
    ```bash
    python manage.py runserver
    ```

### Kafka

1. Start Kafka and Zookeeper using Docker:
    ```bash
    docker-compose up
    ```

## Usage

### Running the Coordinate Generator

1. Navigate to the coordinate generator directory:
    ```bash
    cd coordinate-generator
    ```

2. Run the generator script:
    ```bash
    python generate_coordinates.py
    ```

### Accessing the Application

- Open your browser and go to `http://localhost:3000` to access the frontend.
- The backend API can be accessed at `http://localhost:8000`.

## Database Diagram

*DB diagram*


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
