import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

const users = [
  {
    name: 'Admin User',
    email: 'admin@shopsphere.com',
    password: bcrypt.hashSync('admin123', salt),
    isAdmin: true,
    addresses: [
      {
        street: '1 Infinite Loop',
        city: 'Cupertino',
        state: 'CA',
        postalCode: '95014',
        country: 'United States',
        phone: '123-456-7890',
        isDefault: true
      }
    ]
  },
  {
    name: 'John Doe',
    email: 'john@gmail.com',
    password: bcrypt.hashSync('user123', salt),
    isAdmin: false,
    addresses: [
      {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
        phone: '987-654-3210',
        isDefault: true
      }
    ]
  }
];

export default users;
