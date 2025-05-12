# HegGeo - Time-Limited Geo Sharing

HegGeo is a Next.js web application that allows users to "drop" their current geographical location, creating a time-limited marker (a "Geo") that can be shared. The app also includes features like a journey time calculator, an alarm mode, and customizable themes.

## Core Features

*   **GeoDropping:**
    *   Mark your current location with a Geo that has a configurable lifespan (5 to 120 minutes).
    *   View your active Geo on a map placeholder and see its remaining time.
    *   Clear your active Geo at any time.

*   **Journey Time Tracker:**
    *   Calculate estimated driving distance and duration between two points.
    *   Input locations as addresses, place names, or latitude/longitude coordinates.
    *   Option to use your current location as the source or destination.
    *   Powered by OpenStreetMap Nominatim for geocoding and OSRM for routing.

*   **Alarm Mode:**
    *   Activate a siren sound.
    *   **Instant Alarm:** A quick, fixed duration alarm at maximum volume.
    *   **Configured Alarm:** Set custom duration, volume, and siren type.
    *   Alarms can be stopped manually.
*   **SOS Functionality:**
    *   Store multiple SOS configurations.
    *   Designate a default SOS configuration. Only one default is allowed at a time.

*   **Sharing:**
    *   Share your active Geo via WhatsApp.
    *   Include an optional custom message.
    *   Optionally attach a photo by capturing one with your device camera or uploading an existing image.
    *   Attached photos are described by an AI (using Genkit with Gemini) and the description is included in the share message.
    *   Shared messages automatically include a link to the Geo on Google Maps, the #HegGeo hashtag, and a link to the HegGeo application.

*   **Theme Customization:**
    *   Switch between Light, Dark, High Contrast Light, and High Contrast Dark modes.
    *   Theme preference is saved locally in the browser.

*   **"How To" Guide:**
    *   An in-app guide accessible from the header, explaining how to use each feature.

## Technologies Used

*   **Frontend:** Next.js (App Router), React, TypeScript
*   **Styling:** Tailwind CSS, ShadCN UI components
*   **AI:** Genkit with Google Gemini (for image description)
*   **Geolocation & Mapping:** Browser Geolocation API, OpenStreetMap Nominatim, OSRM (Project OSRM)
*   **Audio:** Tone.js (for alarm sounds)
*   **State Management:** React Hooks (useState, useEffect, useCallback), localStorage for persisting active Geo and theme.

## Getting Started

This is a Next.js application.

1.  **Prerequisites:**
    *   Node.js (version 18.x or later recommended)
    *   npm or yarn

2.  **Environment Variables:**
    *   The application may require API keys for services like Google AI (Gemini). Create a `.env.local` file in the root directory and add any necessary environment variables. For example:
        ```
        GOOGLE_API_KEY=YOUR_GOOGLE_AI_API_KEY
        ```
    *   Refer to `src/ai/genkit.ts` and `.env` (if provided as a template) for potential environment variables.

3.  **Installation:**
    ```bash
    npm install
    # or
    yarn install
    ```

4.  **Running the Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will typically be available at `http://localhost:9002`.

5.  **Genkit Development (Optional):**
    If you are working on AI flows, you might need to run the Genkit development server:
    ```bash
    npm run genkit:dev
    # or for watching changes
    npm run genkit:watch
    ```

6.  **Building for Production:**
    ```bash
    npm run build
    npm run start
    # or
    yarn build
    yarn start
    ```

## Project Structure

*   `src/app/`: Main application pages and layouts (using Next.js App Router).
*   `src/components/`: Reusable React components.
    *   `src/components/ui/`: ShadCN UI components.
*   `src/ai/`: Genkit AI flows and configuration.
    *   `src/ai/flows/`: Specific AI flow implementations (e.g., `describe-image-flow.ts`).
*   `src/hooks/`: Custom React hooks.
*   `src/lib/`: Utility functions and type definitions.
*   `public/`: Static assets.
# heggeo
