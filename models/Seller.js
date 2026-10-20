import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema(
  {
    vendorName: { type: String, required: true },
    contactEmail: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    commissionRate: { type: Number, required: true, default: 10 },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    performanceRating: { type: Number, default: 5.0 },
    sales: { type: Number, default: 0.0 },
    payoutBalance: { type: Number, default: 0.0 }
  },
  { timestamps: true }
);

const Seller = mongoose.model('Seller', sellerSchema);
export default Seller;
