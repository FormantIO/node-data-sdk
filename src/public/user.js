const { Authentication, Fleet } = window.FormantDataSDK;

async function connectTeleop(data) {
  const { deviceId, username, password, pingIntervalMs, reconnectTimeoutMs } = data;

  await Authentication.login(username, password);
  const devices = await Fleet.getDevices();

  let connected = false;
  let reconnecting = false;

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
        setTimeout(() => {
          connectTeleop(data);
        }, reconnectTimeoutMs);
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
