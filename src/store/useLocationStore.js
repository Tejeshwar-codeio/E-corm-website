import { create } from 'zustand';

const useLocationStore = create((set) => ({
  location: JSON.parse(localStorage.getItem('userLocation')) || {
    country: 'United States',
    zipCode: '95014'
  },
  isModalOpen: false,
  setModalOpen: (open) => set({ isModalOpen: open }),
  setLocation: (country, zipCode) => {
    const newLoc = { country, zipCode };
    localStorage.setItem('userLocation', JSON.stringify(newLoc));
    set({ location: newLoc });
  }
}));

export default useLocationStore;
