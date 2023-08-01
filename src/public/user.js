const { Authentication, Fleet } = window.FormantDataSDK;

async function connectTeleop(data) {
  const { deviceId, username, password } = data;

  await Authentication.login(username, password);
  const devices = await Fleet.getDevices();

  let connected = false;

  for (const device of devices) {
    if (device.name === deviceId) {
      console.log('DEVICE FOUND');

      device.on('connect', () => {
        connected = true;
        console.log('DEVICE CONNECTED');
      });

      device.on('disconnect', () => {
        connected = false;
        console.log('DEVICE DISCONNECTED');
      });

      device.startRealtimeConnection();

      setInterval(() => {
        if (!connected) {
          return;
        }

        const pingMs = device.getRealtimePing();
        if (typeof pingMs === 'number') {
          console.log(`PING: ${pingMs}`);
        }
      }, 1000);

      return;
    }
  }

  console.log('DEVICE NOT FOUND');
}

window.connectTeleop = connectTeleop;
