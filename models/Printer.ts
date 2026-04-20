import mongoose from 'mongoose';

const PrinterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  serviceUUID: {
    type: String,
    default: ''
  },
  characteristicUUID: {
    type: String,
    default: ''
  },
  regtime: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Printer || mongoose.model('Printer', PrinterSchema, 'printers');
