// Global singleton to persist across React re-renders
let globalBluetoothDevice: any | null = null;
let globalCharacteristic: any | null = null;
let globalGattServer: any | null = null;

export class BluetoothPrinter {
  private serviceUUID: string;
  private characteristicUUID: string;

  constructor(serviceUUID?: string, characteristicUUID?: string) {
    this.serviceUUID = serviceUUID || 'e7810a71-73ae-499d-8c15-faa9aef0c3f2';
    this.characteristicUUID = characteristicUUID || 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f';
  }

  // Check if we have a stored connection and try to restore it
  async tryRestoreConnection(): Promise<boolean> {
    const wasConnected = localStorage.getItem('bluetoothConnected') === 'true';
    const deviceId = localStorage.getItem('connectedDeviceId');
    
    if (!wasConnected || !deviceId) {
      return false;
    }

    // Check if global connection still exists
    if (globalBluetoothDevice?.gatt?.connected && globalCharacteristic) {
      console.log('✅ Using existing Bluetooth connection');
      return true;
    }

    console.log('⚠️ Previous connection lost, need to reconnect manually');
    return false;
  }

  async connect(): Promise<boolean> {
    try {
      console.log('Requesting Bluetooth device with service UUID:', this.serviceUUID);
      
      globalBluetoothDevice = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: [this.serviceUUID] }]
      });

      console.log('Device selected:', globalBluetoothDevice.name);

      globalGattServer = await globalBluetoothDevice.gatt!.connect();
      if (!globalGattServer.connected) {
        throw new Error('Failed to connect to GATT server');
      }

      console.log('GATT server connected');

      const service = await globalGattServer.getPrimaryService(this.serviceUUID);
      console.log('Service obtained:', service.uuid);
      
      globalCharacteristic = await service.getCharacteristic(this.characteristicUUID);
      console.log('Characteristic obtained:', globalCharacteristic.uuid);

      localStorage.setItem('bluetoothConnected', 'true');
      localStorage.setItem('connectedDeviceName', globalBluetoothDevice.name || '');
      localStorage.setItem('connectedDeviceId', globalBluetoothDevice.id);

      console.log('✅ Bluetooth connection successful!');
      return true;
    } catch (error) {
      console.error('❌ Bluetooth connection error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (globalBluetoothDevice?.gatt?.connected) {
      globalBluetoothDevice.gatt.disconnect();
    }
    globalBluetoothDevice = null;
    globalCharacteristic = null;
    globalGattServer = null;
    localStorage.removeItem('bluetoothConnected');
    localStorage.removeItem('connectedDeviceName');
    localStorage.removeItem('connectedDeviceId');
  }

  isConnected(): boolean {
    // Check both global state and localStorage
    const hasGlobalConnection = globalBluetoothDevice?.gatt?.connected && globalCharacteristic !== null;
    const hasStoredConnection = localStorage.getItem('bluetoothConnected') === 'true';
    
    return hasGlobalConnection || hasStoredConnection;
  }

  getDeviceName(): string | null {
    return globalBluetoothDevice?.name || localStorage.getItem('connectedDeviceName');
  }

  async sendData(data: string): Promise<boolean> {
    console.log('sendData called, characteristic:', globalCharacteristic ? 'available' : 'null');
    console.log('Device connected:', globalBluetoothDevice?.gatt?.connected);
    
    if (!globalCharacteristic) {
      console.warn('⚠️ Bluetooth characteristic not available - skipping print');
      return true; // Return true to allow sale to continue
    }

    try {
      console.log('Encoding data, length:', data.length);
      const encoder = new TextEncoder();
      const dataArray = encoder.encode(data);
      const chunkSize = 512;
      
      console.log('Sending', Math.ceil(dataArray.length / chunkSize), 'chunks...');
      
      for (let i = 0; i < dataArray.length; i += chunkSize) {
        const chunk = dataArray.slice(i, i + chunkSize);
        await globalCharacteristic.writeValue(chunk);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      console.log('✅ Data sent successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error sending data:', error);
      return true; // Return true to allow sale to continue even if print fails
    }
  }
}
