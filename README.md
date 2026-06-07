<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h1 align="center">Algup</h1>

  <p align="center">
    A mobile app to build confidence in your cubing algorithms
  </p>
</div>


<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

To run this project, you'll need node/npm installed on your device. Visit the following links to download these.

- <a href = "https://nodejs.org/en/download"> Node / npm</a>

### Installation

_Below are instructions for how you can clone and run a development build of the project._


1. Clone the repo with

   ```sh
   git clone https://github.com/dwyaneramos/algup.git
   ```

#### Frontend / Mobile App

2. Enter the project

   ```sh
   cd algup/
   ```

3. Install NPM packages

   ```sh
   npm install
   ```

4. Run the dev environment
   ```sh
   npx expo start
   ```

  #### Backend (used for scramble generation)

2. Enter the project

   ```sh
   cd algup/
   ```

3. Make a .env which containing the following:
    ```
    EXPO_PUBLIC_API_URL = <IP addresss given when you start your mobile app>:3000
    ```
4. Enter the server directory

   ```sh
   cd server/
   ```

4. Install NPM packages

   ```sh
   npm install
   ```

5. Run the dev environment 
   ```sh
   npm run dev
   ```

<!-- BACK LOG -->
# Backlog
- [ ] Able to add new alg sets
- [ ] Able to edit existing alg sets
  - [ ] Add new algorithms
  - [ ] Delete algorithms
  - [ ] Edit algorithms
- [ ] Backtrack to previous case
- [ ] Show solution
- [ ] Draw scramble
- [ ] View confidence for each individual algset (can you edit it from there?)
  - [ ] SVG generated for the particular case

<!-- WIREFRAMES / MOCKUPS -->
   
# Wireframes / Mockups :
<img width="711" height="436" alt="image" src="https://github.com/user-attachments/assets/c374e2ef-aa20-493f-82ee-c05e1bc64f43" />
<img width="722" height="435" alt="image" src="https://github.com/user-attachments/assets/cb060737-3aee-4bb5-a5fb-6c39e05d389c" />

