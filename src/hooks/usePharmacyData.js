import React, { useState, useEffect } from 'react'

const usePharmacyData = () => {
    const [inventory, setInventory] = useState(() => {
        const saved = localStorage.getItem('pharmacy_inventory')
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'Paracetamol 500mg', price: 20, stock: 150, expiry: '2026-12-01', category: 'General' },
            { id: 2, name: 'Amoxicillin 250mg', price: 85, stock: 45, expiry: '2025-08-15', category: 'Antibiotic' },
            { id: 3, name: 'Cetirizine 10mg', price: 15, stock: 8, expiry: '2026-01-20', category: 'Antihistamine' },
            { id: 4, name: 'Metformin 500mg', price: 40, stock: 120, expiry: '2024-11-30', category: 'Diabetes' },
        ]
    })

    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('pharmacy_orders')
        return saved ? JSON.parse(saved) : []
    })

    const [slots, setSlots] = useState(() => {
        const saved = localStorage.getItem('pharmacy_slots')
        return saved ? JSON.parse(saved) : []
    })

    useEffect(() => {
        localStorage.setItem('pharmacy_inventory', JSON.stringify(inventory))
    }, [inventory])

    useEffect(() => {
        localStorage.setItem('pharmacy_orders', JSON.stringify(orders))
    }, [orders])

    useEffect(() => {
        localStorage.setItem('pharmacy_slots', JSON.stringify(slots))
    }, [slots])

    const addMedicine = (med) => {
        setInventory(prev => [...prev, { ...med, id: Date.now() }])
    }

    const updateStock = (id, amount) => {
        setInventory(prev => prev.map(item =>
            item.id === id ? { ...item, stock: Math.max(0, item.stock + amount) } : item
        ))
    }

    const addOrder = (order) => {
        setOrders(prev => [...prev, { ...order, id: Date.now(), status: 'Received', timestamp: new Date().toISOString() }])
    }

    const updateOrderStatus = (id, status) => {
        setOrders(prev => prev.map(order =>
            order.id === id ? { ...order, status } : order
        ))
    }

    const bookSlot = (slot) => {
        setSlots(prev => [...prev, { ...slot, id: Date.now() }])
    }

    return {
        inventory,
        orders,
        slots,
        addMedicine,
        updateStock,
        addOrder,
        updateOrderStatus,
        bookSlot
    }
}

export default usePharmacyData
