import React, { createContext, useContext, useState, useCallback } from 'react';
import { medicinesApi, prescriptionsApi, slotsApi } from '../api/pharmacyApi';

const PharmacyContext = createContext(null);

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};

export const PharmacyProvider = ({ children }) => {
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const setLoadingState = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  // ==================== MEDICINES ====================

  const fetchMedicines = useCallback(async (params = {}) => {
    setLoadingState('medicines', true);
    try {
      const result = await medicinesApi.getAll(params);
      setMedicines(result.data);
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoadingState('medicines', false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const result = await medicinesApi.getStats();
      setStats(result.data);
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const addMedicine = useCallback(async (medicine) => {
    setLoadingState('addMedicine', true);
    try {
      const result = await medicinesApi.add(medicine);
      setMedicines(prev => [result.data, ...prev]);
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoadingState('addMedicine', false);
    }
  }, []);

  const updateMedicine = useCallback(async (id, data) => {
    setLoadingState('updateMedicine', true);
    try {
      const result = await medicinesApi.update(id, data);
      setMedicines(prev => prev.map(m => m.id === id ? result.data : m));
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoadingState('updateMedicine', false);
    }
  }, []);

  const sellMedicine = useCallback(async (id, quantity = 1) => {
    try {
      const result = await medicinesApi.sell(id, quantity);
      setMedicines(prev => prev.map(m => m.id === id ? result.data : m));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteMedicine = useCallback(async (id) => {
    try {
      await medicinesApi.delete(id);
      setMedicines(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // ==================== PRESCRIPTIONS ====================

  const fetchPrescriptions = useCallback(async (params = {}) => {
    setLoadingState('prescriptions', true);
    try {
      const result = await prescriptionsApi.getAll(params);
      setPrescriptions(result.data);
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoadingState('prescriptions', false);
    }
  }, []);

  const uploadPrescription = useCallback(async (formData) => {
    setLoadingState('uploadPrescription', true);
    try {
      const result = await prescriptionsApi.upload(formData);
      setPrescriptions(prev => [result.data, ...prev]);
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoadingState('uploadPrescription', false);
    }
  }, []);

  const updatePrescriptionStatus = useCallback(async (id, status) => {
    try {
      const result = await prescriptionsApi.updateStatus(id, status);
      setPrescriptions(prev => prev.map(p => p.id === id ? result.data : p));
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // ==================== SLOTS ====================

  const fetchSlots = useCallback(async (params = {}) => {
    setLoadingState('slots', true);
    try {
      const result = await slotsApi.getAll(params);
      setSlots(result.data);
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoadingState('slots', false);
    }
  }, []);

  const fetchBookedSlots = useCallback(async (date) => {
    try {
      const result = await slotsApi.getBooked(date);
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const bookSlot = useCallback(async (slot) => {
    setLoadingState('bookSlot', true);
    try {
      const result = await slotsApi.book(slot);
      setSlots(prev => [...prev, result.data]);
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoadingState('bookSlot', false);
    }
  }, []);

  const value = {
    // State
    medicines,
    prescriptions,
    slots,
    stats,
    loading,
    error,

    // Actions
    clearError,
    fetchMedicines,
    fetchStats,
    addMedicine,
    updateMedicine,
    sellMedicine,
    deleteMedicine,
    fetchPrescriptions,
    uploadPrescription,
    updatePrescriptionStatus,
    fetchSlots,
    fetchBookedSlots,
    bookSlot,
  };

  return (
    <PharmacyContext.Provider value={value}>
      {children}
    </PharmacyContext.Provider>
  );
};
