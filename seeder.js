import mongoose from 'mongoose';
import dotenv from 'dotenv';
import users from './data/users.js';
import products from './data/products.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Warehouse from './models/Warehouse.js';
import Supplier from './models/Supplier.js';
import AuditLog from './models/AuditLog.js';
import SupportTicket from './models/SupportTicket.js';
import Seller from './models/Seller.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Warehouse.deleteMany();
    await Supplier.deleteMany();
    await AuditLog.deleteMany();
    await SupportTicket.deleteMany();
    await Seller.deleteMany();

    const createdUsers = await User.insertMany(users);

    const adminUserObj = createdUsers.find(u => u.isAdmin);
    const adminUser = adminUserObj ? adminUserObj._id : createdUsers[0]._id;

    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser };
    });

    const createdProducts = await Product.insertMany(sampleProducts);

    // Create suppliers
    await Supplier.insertMany([
      { name: 'Global Tech Dist', contactName: 'Sarah Jenkins', email: 'sarah@globaltech.com', phone: '1-800-555-0199', address: '100 Silicon Way, San Jose, CA' },
      { name: 'Apex Apparel Group', contactName: 'Marc Jacobs', email: 'marc@apexapparel.com', phone: '1-800-555-0122', address: '450 Fashion Blvd, New York, NY' },
      { name: 'FastLogistics Warehouse', contactName: 'David Lee', email: 'david@fastlog.com', phone: '1-800-555-0144', address: '220 Cargo Rd, Chicago, IL' }
    ]);

    // Create warehouses with initial stock allocations
    await Warehouse.insertMany([
      {
        name: 'New York Fulfillment Center',
        code: 'WH-NY-01',
        location: 'Queens, NY',
        capacity: 10000,
        contactNumber: '1-718-555-9000',
        inventory: createdProducts.slice(0, 3).map(p => ({ product: p._id, quantity: 250 }))
      },
      {
        name: 'Los Angeles Depot',
        code: 'WH-LA-02',
        location: 'Torrance, CA',
        capacity: 8000,
        contactNumber: '1-310-555-8000',
        inventory: createdProducts.slice(2, 5).map(p => ({ product: p._id, quantity: 150 }))
      },
      {
        name: 'Chicago Central Hub',
        code: 'WH-CH-03',
        location: 'Elk Grove, IL',
        capacity: 12000,
        contactNumber: '1-847-555-7000',
        inventory: createdProducts.slice(4, 7).map(p => ({ product: p._id, quantity: 400 }))
      }
    ]);

    // Create sellers
    await Seller.insertMany([
      { vendorName: 'TechnoGears', contactEmail: 'sales@technogears.com', phone: '555-1234', commissionRate: 8, status: 'Approved', performanceRating: 4.8, sales: 25400.0, payoutBalance: 1280.0 },
      { vendorName: 'ShoeEmporium', contactEmail: 'info@shoeemporium.com', phone: '555-5678', commissionRate: 12, status: 'Approved', performanceRating: 4.2, sales: 12050.0, payoutBalance: 450.0 },
      { vendorName: 'FitStyle Apparel', contactEmail: 'onboarding@fitstyle.com', phone: '555-9012', commissionRate: 10, status: 'Pending', performanceRating: 5.0, sales: 0.0, payoutBalance: 0.0 }
    ]);

    // Create a support ticket
    const customerUser = createdUsers.find(u => !u.isAdmin);
    if (customerUser) {
      await SupportTicket.create({
        user: customerUser._id,
        subject: 'Return assistance needed for order #1085',
        priority: 'High',
        status: 'Open',
        messages: [
          { sender: 'Customer', text: 'Hi, I received my sneakers yesterday but they are slightly too tight. Can I request an exchange for size US 10?' }
        ]
      });
    }

    // Create some initial audit logs
    if (adminUserObj) {
      await AuditLog.insertMany([
        { user: adminUserObj._id, action: 'System Setup', details: 'Initialized enterprise databases and loaded sample products inventory catalog.', ipAddress: '127.0.0.1', userAgent: 'Node.js Seeder Script' },
        { user: adminUserObj._id, action: 'Configure Settings', details: 'Set standard e-commerce commission split parameters to default 10%.', ipAddress: '127.0.0.1', userAgent: 'Node.js Seeder Script' }
      ]);
    }

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Warehouse.deleteMany();
    await Supplier.deleteMany();
    await AuditLog.deleteMany();
    await SupportTicket.deleteMany();
    await Seller.deleteMany();

    console.log('Data Destroyed Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data destroy: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
