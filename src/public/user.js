const { Authentication, Fleet } = window.FormantDataSDK;

async function connectTeleop(data) {
  const { deviceId, username, password, pingIntervalMs } = data;

  await Authentication.login(username, password);
  const devices = await Fleet.getDevices();

  let connected = false;

  for (const device of devices) {
    if (device.name === deviceId) {
      console.log('Device found');

      device.on('connect', () => {
        connected = true;
        console.log('Device connected');
      });

      device.on('disconnect', () => {
        connected = false;
        console.log('Device disconnected');
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
      }, pingIntervalMs);

      return;
    }
  }

  console.log('Device not found');
}

window.connectTeleop = connectTeleop;
