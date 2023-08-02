const { Authentication, Fleet } = window.FormantDataSDK;

let reconnectTimeout = null;

async function connectTeleop(data) {
  const { deviceId, username, password, pingIntervalMs } = data;

  try {
    await Authentication.login(username, password);
  } catch (error) {
    console.error('Could not authenticate');
    return;
  }

  let devices;
  try {
    devices = await Fleet.getDevices();
  } catch (error) {
    console.error('Could not fetch devices');
    return;
  }

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
        setTimeout(() => {
          console.error('Device connection failed', error);
        }, data.reconnectTimeoutMs);
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
