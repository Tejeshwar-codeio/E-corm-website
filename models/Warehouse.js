import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    contactNumber: { type: String },
    inventory: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

const Warehouse = mongoose.model('Warehouse', warehouseSchema);
export default Warehouse;
