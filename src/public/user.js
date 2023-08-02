const { Authentication, Fleet } = window.FormantDataSDK;

let reconnectTimeout = null;

async function connectTeleop(data) {
  const { deviceId, username, password, pingIntervalMs, reconnectTimeoutMs } = data;

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
        scheduleReconnect(data);
      });

      device.startRealtimeConnection().catch((error) => {
        console.error('Device connection failed', error);
        scheduleReconnect(data);
      });

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

function scheduleReconnect(data) {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    connectTeleop(data);
  }, data.reconnectTimeoutMs);
}

window.connectTeleop = connectTeleop;
