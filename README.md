# Chat Application

This is a simple chat application built using React and Effector. The application features a mock authentication system, chat management, and a modal-based UI for login, registration, and chat interactions.

## Features

-  **Mock Authentication**: Users can log in using mock credentials.
-  **Effector State Management**: Utilizes Effector for managing application state, including chat messages and authentication.
-  **Modal UI**: Uses modals for login, registration, and chat interactions.

## Getting Started

### Prerequisites

-  Node.js (version 14 or higher)
-  npm (version 6 or higher)

### Installation and running

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/chat-application.git
   cd chat-application
   
2. **Install dependencies**
    ```bash
   npm i
   
3. **Add env variables**
   ```bash
   REACT_APP_OPENAI_KEY= it needs to have a conversation with chatgpt
   REACT_APP_CLIENT_ID= it needs to allow authentication by google
   REACT_APP_HOST_URL= it need to have correct path of images
   
4. **Run script**
    ```bash
   npm run start

5. **Go to login page**

6. **Auth by "test" and "password" as credentials or google auth**:  These credentials are used to mock the authentication process and grant access to the chat functionalities. Once logged in, you can view and interact with the chat features.
