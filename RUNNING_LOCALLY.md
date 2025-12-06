Running SpyGameBackend locally

1. Copy the example env and fill values:

PowerShell commands:
cd SpyGameBackend
copy .env.example .env

# then edit .env and set MONGODB_URI, JWT_SECRET, and optional OAuth keys

2. Start a local MongoDB instance (recommended via Docker):

PowerShell command:
docker run --rm -d -p 27017:27017 --name spygame-mongo mongo:6.0

3. Install dependencies and run server:

PowerShell commands:
npm install
npm run dev

4. Verify backend is reachable at the port configured in .env (default http://localhost:3000).

5. Configure the frontend to point to this backend by setting VITE_API_URL and VITE_SOCKET_URL in the frontend .env.
