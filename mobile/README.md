# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Run with Docker (development)

Docker runs the Expo development server. Run the native app on a physical device
with a compatible Expo Go or development build, or on an emulator outside the
container. This image does not build an APK or run an iOS simulator.

Start Docker Desktop with Linux containers enabled. From the repository root:

```powershell
docker build -t iwa-mobile ./mobile
docker run --rm -it -p 8081:8081 -e EXPO_PACKAGER_PROXY_URL=http://192.168.1.42:8081 iwa-mobile
```

Replace `192.168.1.42` with your computer's LAN IPv4 address (`ipconfig` on
Windows). Connect your phone to the same network, allow TCP port 8081 through
the host firewall, and scan the Expo QR code. The host address prevents Expo
from advertising an unreachable container IP.

For a browser preview, run this instead and open <http://localhost:8081>:

The image sets `BROWSER=none` to disable automatic browser launching inside the
container. This also avoids attempts to launch Windows `cmd.exe` under WSL2.

```powershell
docker run --rm -it -p 8081:8081 iwa-mobile npm run web -- --lan --port 8081
```

To edit files without rebuilding, add these mounts to either `docker run`
command (PowerShell, from the repository root):

```powershell
--mount "type=bind,source=$($PWD.Path)/mobile,target=/app" --mount type=volume,target=/app/node_modules --mount type=volume,target=/app/.expo
```

Place the mount options before `iwa-mobile`. The anonymous volumes keep Linux
dependencies and Expo state separate from your host. Rebuild the image and
recreate the container after changing dependencies. Stop the server with Ctrl+C.

See the [Expo CLI documentation](https://docs.expo.dev/more/expo-cli/) for
development server and device connection options.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
