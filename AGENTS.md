# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# LittleSteps — Mobile AGENTS.md

## 1. Mobile Stack
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State Management**: To be decided (likely React Query for server state, Zustand for client state)
- **Navigation**: React Navigation or Expo Router

## 2. Mobile Architecture
- **Structure**:
  - `src/components`: Reusable UI elements (buttons, inputs, media cards).
  - `src/screens`: Main view layouts and screen flows.
  - `src/services`: API calls and external integrations.
  - `src/navigation`: App routing configuration.
- **Media Upload Rule**: The app MUST NOT send image/video binaries to the NestJS backend. It must request a signed URL from the backend and perform a direct `PUT` upload to the storage provider (MinIO/S3).

## 3. Coding Conventions
- Use Functional Components and React Hooks exclusively.
- Use strict TypeScript typing for all props and state.
- UI should follow the `design_system.md` guidelines (warm, personal, uncluttered).

## 4. Testing Rules
- Use React Native Testing Library for critical component tests.
- Mock API responses rather than relying on a live backend for component-level tests.
